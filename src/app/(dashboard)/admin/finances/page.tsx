'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { getAdminTransactions, Transaction } from '@/utils/supabase/adminData';
import { formatCurrency } from '@/utils/currency';
import { 
  DollarSign, 
  ArrowUpRight, 
  ArrowDownLeft, 
  CreditCard, 
  RefreshCw, 
  Download, 
  Search, 
  Filter, 
  ShieldCheck, 
  Receipt, 
  Wallet,
  TrendingUp,
  TrendingDown,
  CheckCircle2,
  Clock,
  AlertCircle
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminFinancesPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLive, setIsLive] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');

  const loadData = async () => {
    setLoading(true);
    const res = await getAdminTransactions();
    setTransactions(res.transactions);
    setIsLive(res.isLive);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  // Compute Financial Metrics
  const metrics = useMemo(() => {
    let grossIncome = 0;
    let totalExpenses = 0;
    let totalRefunds = 0;
    let totalFees = 0;
    let totalPayouts = 0;

    transactions.forEach(t => {
      const amt = Number(t.amount || 0);
      const fee = Number(t.fee || 0);
      totalFees += fee;

      if (t.type === 'income') {
        grossIncome += amt;
      } else if (t.type === 'expense') {
        totalExpenses += amt;
      } else if (t.type === 'refund') {
        totalRefunds += amt;
      } else if (t.type === 'payout') {
        totalPayouts += amt;
      }
    });

    const netSales = grossIncome - totalRefunds;
    const netProfit = netSales - totalExpenses - totalFees;
    const estimatedTax = netSales * 0.18; // 18% GST

    return {
      grossIncome,
      netSales,
      totalExpenses,
      totalRefunds,
      totalFees,
      totalPayouts,
      netProfit,
      estimatedTax
    };
  }, [transactions]);

  // Payment Method Breakdown
  const methodStats = useMemo(() => {
    const map: Record<string, { count: number; total: number }> = {
      UPI: { count: 0, total: 0 },
      Card: { count: 0, total: 0 },
      'Net Banking': { count: 0, total: 0 },
      'Cash on Delivery': { count: 0, total: 0 },
    };

    transactions.forEach(t => {
      if (t.type === 'income') {
        const m = t.payment_method || 'UPI';
        if (!map[m]) map[m] = { count: 0, total: 0 };
        map[m].count += 1;
        map[m].total += Number(t.amount || 0);
      }
    });

    const totalIncome = metrics.grossIncome || 1;
    return Object.entries(map).map(([method, data]) => ({
      method,
      count: data.count,
      total: data.total,
      percentage: Math.round((data.total / totalIncome) * 100) || 0
    }));
  }, [transactions, metrics.grossIncome]);

  // Filter Transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      const matchSearch = 
        t.transaction_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.payment_method.toLowerCase().includes(searchTerm.toLowerCase());
      const matchType = typeFilter === 'all' || t.type.toLowerCase() === typeFilter.toLowerCase();
      return matchSearch && matchType;
    });
  }, [transactions, searchTerm, typeFilter]);

  // Export to CSV
  const handleExportCSV = () => {
    const headers = ['Transaction ID', 'Type', 'Amount', 'Fee', 'Net Amount', 'Status', 'Payment Method', 'Description', 'Date'];
    const rows = filteredTransactions.map(t => [
      t.transaction_id,
      t.type,
      t.amount,
      t.fee,
      t.net_amount,
      t.status,
      t.payment_method,
      `"${t.description.replace(/"/g, '""')}"`,
      new Date(t.created_at).toLocaleDateString('en-IN')
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `everyjust_finances_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Financial ledger exported to CSV!');
  };

  const getTypeBadge = (type: string) => {
    switch (type.toLowerCase()) {
      case 'income':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <ArrowDownLeft size={12} />
            Income
          </span>
        );
      case 'expense':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-orange-50 text-orange-700 border border-orange-200">
            <ArrowUpRight size={12} />
            Expense
          </span>
        );
      case 'refund':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
            <TrendingDown size={12} />
            Refund
          </span>
        );
      case 'payout':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200">
            <Wallet size={12} />
            Payout
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-gray-100 text-gray-700">
            {type}
          </span>
        );
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-black text-gray-900 tracking-tight">Finances & Accounting</h1>
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
              isLive ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
            }`}>
              <span className={`w-2 h-2 rounded-full ${isLive ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
              {isLive ? 'Connected to Supabase' : 'Waiting for Tables'}
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Cashflow statements, payment gateways, tax reporting, and payout settlements.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={loadData}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 hover:border-gray-300 text-gray-700 text-xs font-bold hover:bg-gray-50 transition-all cursor-pointer disabled:opacity-50"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>

          <button
            type="button"
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#6A43FB] to-[#5926EC] text-white text-xs font-bold shadow-md shadow-purple-500/20 hover:opacity-95 transition-all cursor-pointer"
          >
            <Download size={14} />
            <span>Export Statement</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white rounded-3xl p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <DollarSign size={24} />
            </div>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
              +19.2%
            </span>
          </div>
          <h3 className="text-gray-400 font-medium text-xs uppercase tracking-wider mb-1">Gross Sales Revenue</h3>
          <h2 className="text-2xl font-black text-gray-900">{formatCurrency(metrics.grossIncome)}</h2>
          <p className="text-[11px] text-gray-400 mt-2 font-medium">Total customer charges</p>
        </div>

        <div className="bg-white rounded-3xl p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 text-[#6A43FB] flex items-center justify-center font-bold">
              <Receipt size={24} />
            </div>
            <span className="text-xs font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full">
              Estimated
            </span>
          </div>
          <h3 className="text-gray-400 font-medium text-xs uppercase tracking-wider mb-1">Net Realized Profit</h3>
          <h2 className="text-2xl font-black text-gray-900">{formatCurrency(metrics.netProfit)}</h2>
          <p className="text-[11px] text-gray-400 mt-2 font-medium">After refunds, fees & costs</p>
        </div>

        <div className="bg-white rounded-3xl p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
              <TrendingDown size={24} />
            </div>
            <span className="text-xs font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full">
              {metrics.grossIncome > 0 ? ((metrics.totalRefunds / metrics.grossIncome) * 100).toFixed(1) : '0'}%
            </span>
          </div>
          <h3 className="text-gray-400 font-medium text-xs uppercase tracking-wider mb-1">Refunds & Disputes</h3>
          <h2 className="text-2xl font-black text-gray-900">{formatCurrency(metrics.totalRefunds)}</h2>
          <p className="text-[11px] text-gray-400 mt-2 font-medium">Processed customer returns</p>
        </div>

        <div className="bg-white rounded-3xl p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <Wallet size={24} />
            </div>
            <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
              Settled
            </span>
          </div>
          <h3 className="text-gray-400 font-medium text-xs uppercase tracking-wider mb-1">Bank Payouts</h3>
          <h2 className="text-2xl font-black text-gray-900">{formatCurrency(metrics.totalPayouts)}</h2>
          <p className="text-[11px] text-gray-400 mt-2 font-medium">Transferred to merchant account</p>
        </div>
      </div>

      {/* Breakdown Grid: Payment Methods & Cashflow Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Payment Methods */}
        <div className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-bold text-gray-900 text-lg">Payment Methods</h3>
              <p className="text-xs text-gray-400 mt-0.5">Volume by payment channel</p>
            </div>
            <div className="p-2 rounded-xl bg-purple-50 text-[#6A43FB]">
              <CreditCard size={18} />
            </div>
          </div>

          <div className="space-y-4">
            {methodStats.map((item, idx) => (
              <div key={idx} className="space-y-1.5">
                <div className="flex justify-between items-center text-xs font-bold">
                  <span className="text-gray-700">{item.method}</span>
                  <span className="text-gray-900">{formatCurrency(item.total)} ({item.percentage}%)</span>
                </div>
                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-[#6A43FB] to-[#5926EC] rounded-full transition-all duration-500" 
                    style={{ width: `${Math.max(item.percentage, 4)}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-gray-400 font-medium">
                  <span>{item.count} Transactions</span>
                  <span>Instant Settlement</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Operating Costs & Tax Summary */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="font-bold text-gray-900 text-lg">Operating Costs & Deductions</h3>
                <p className="text-xs text-gray-400 mt-0.5">Gateway fees, logistics, and compliance</p>
              </div>
              <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
                <ShieldCheck size={18} />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100">
                <div className="text-xs text-gray-400 font-semibold mb-1">Gateway Fees (Avg 2%)</div>
                <div className="text-xl font-black text-gray-900">{formatCurrency(metrics.totalFees)}</div>
                <div className="text-[10px] text-gray-500 mt-1">UPI & Card charges</div>
              </div>
              <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100">
                <div className="text-xs text-gray-400 font-semibold mb-1">Logistics & Shipping</div>
                <div className="text-xl font-black text-gray-900">{formatCurrency(metrics.totalExpenses)}</div>
                <div className="text-[10px] text-gray-500 mt-1">Courier & fulfillment</div>
              </div>
              <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100">
                <div className="text-xs text-gray-400 font-semibold mb-1">Estimated Tax (GST 18%)</div>
                <div className="text-xl font-black text-gray-900">{formatCurrency(metrics.estimatedTax)}</div>
                <div className="text-[10px] text-gray-500 mt-1">Input tax offset available</div>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-purple-50/70 border border-purple-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-[#6A43FB] text-white">
                <Wallet size={18} />
              </div>
              <div>
                <div className="text-xs font-bold text-gray-900">Next Scheduled Payout</div>
                <div className="text-[11px] text-gray-500">Every Monday automatically via NEFT/RTGS</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm font-black text-[#6A43FB]">{formatCurrency(metrics.netProfit > 0 ? metrics.netProfit : 0)}</div>
              <div className="text-[10px] text-emerald-600 font-bold">Auto-Settling</div>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Transactions Ledger */}
      <div className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="font-bold text-gray-900 text-lg">Transactions Ledger</h3>
            <p className="text-xs text-gray-400 mt-0.5">Comprehensive audit trail of all payments and settlements</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search transaction ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#6A43FB]/20 focus:border-[#6A43FB] transition-all w-52 sm:w-60"
              />
            </div>

            <div className="flex bg-gray-100 p-1 rounded-xl text-xs font-semibold text-gray-600 overflow-x-auto scrollbar-hide">
              {['all', 'income', 'expense', 'refund', 'payout'].map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTypeFilter(t)}
                  className={`px-3 py-1.5 rounded-lg capitalize transition-all whitespace-nowrap cursor-pointer ${
                    typeFilter === t ? 'bg-white text-gray-900 shadow-sm font-bold' : 'hover:text-gray-900'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Ledger Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="text-xs text-gray-400 uppercase tracking-wider border-b border-gray-100 pb-3">
                <th className="pb-3 font-semibold pl-2">Transaction ID</th>
                <th className="pb-3 font-semibold">Type</th>
                <th className="pb-3 font-semibold">Description</th>
                <th className="pb-3 font-semibold">Method</th>
                <th className="pb-3 font-semibold">Gross</th>
                <th className="pb-3 font-semibold">Fee</th>
                <th className="pb-3 font-semibold">Net Settled</th>
                <th className="pb-3 font-semibold">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-sm text-gray-400">
                    No transactions match the selected filter.
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((txn) => (
                  <tr key={txn.id} className="hover:bg-gray-50/70 transition-colors">
                    <td className="py-4 pl-2">
                      <span className="text-sm font-black text-gray-900 font-mono">
                        {txn.transaction_id}
                      </span>
                    </td>
                    <td className="py-4">
                      {getTypeBadge(txn.type)}
                    </td>
                    <td className="py-4 text-xs font-medium text-gray-700 max-w-[240px] truncate">
                      {txn.description}
                    </td>
                    <td className="py-4">
                      <span className="px-2.5 py-0.5 rounded-md text-xs font-semibold bg-gray-100 text-gray-700">
                        {txn.payment_method}
                      </span>
                    </td>
                    <td className="py-4 text-sm font-bold text-gray-800">
                      {formatCurrency(Number(txn.amount))}
                    </td>
                    <td className="py-4 text-xs font-medium text-gray-400">
                      {Number(txn.fee) > 0 ? formatCurrency(Number(txn.fee)) : '-'}
                    </td>
                    <td className="py-4">
                      <span className={`text-sm font-black ${
                        txn.type === 'income' ? 'text-emerald-600' : 'text-gray-900'
                      }`}>
                        {formatCurrency(Number(txn.net_amount))}
                      </span>
                    </td>
                    <td className="py-4 text-xs text-gray-400 font-medium">
                      {new Date(txn.created_at).toLocaleDateString('en-IN', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
