'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { getAdminOrders, Order } from '@/utils/supabase/adminData';
import { formatCurrency } from '@/utils/currency';
import { 
  FileText, 
  BarChart3, 
  Download, 
  Printer, 
  Calendar, 
  Filter, 
  TrendingUp, 
  Package, 
  Users, 
  Receipt,
  RefreshCw,
  Search,
  ArrowUpRight
} from 'lucide-react';
import toast from 'react-hot-toast';

type ReportCategory = 'sales' | 'inventory' | 'customers' | 'tax';
type DateRange = '7d' | '30d' | '90d' | 'ytd' | 'all';

export default function AdminReportsPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLive, setIsLive] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<ReportCategory>('sales');
  const [dateRange, setDateRange] = useState<DateRange>('30d');
  const [searchQuery, setSearchQuery] = useState('');

  const loadData = async () => {
    setLoading(true);
    const res = await getAdminOrders();
    setOrders(res.orders);
    setIsLive(res.isLive);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filter orders by date range
  const filteredOrders = useMemo(() => {
    const now = Date.now();
    let daysCutoff = 3650; // 'all'
    if (dateRange === '7d') daysCutoff = 7;
    else if (dateRange === '30d') daysCutoff = 30;
    else if (dateRange === '90d') daysCutoff = 90;
    else if (dateRange === 'ytd') daysCutoff = 200;

    const cutoffTime = now - daysCutoff * 24 * 60 * 60 * 1000;
    return orders.filter(o => new Date(o.created_at).getTime() >= cutoffTime);
  }, [orders, dateRange]);

  // Sales Report Aggregation
  const salesSummary = useMemo(() => {
    const totalOrders = filteredOrders.length;
    const grossSales = filteredOrders.reduce((acc, o) => acc + Number(o.total_amount || 0), 0);
    const totalDiscounts = filteredOrders.reduce((acc, o) => acc + Number(o.discount_amount || 0), 0);
    const totalTaxes = filteredOrders.reduce((acc, o) => acc + Number(o.tax_amount || 0), 0);
    const totalShipping = filteredOrders.reduce((acc, o) => acc + Number(o.shipping_amount || 0), 0);
    const aov = totalOrders > 0 ? grossSales / totalOrders : 0;
    const deliveredCount = filteredOrders.filter(o => o.status === 'delivered').length;
    const fulfillmentRate = totalOrders > 0 ? ((deliveredCount / totalOrders) * 100).toFixed(1) : '100';

    return {
      totalOrders,
      grossSales,
      totalDiscounts,
      totalTaxes,
      totalShipping,
      aov,
      fulfillmentRate
    };
  }, [filteredOrders]);

  // Inventory & Product Report Aggregation
  const inventoryReportData = useMemo(() => {
    const map = new Map<string, { name: string; unitsSold: number; totalGross: number; avgPrice: number }>();

    filteredOrders.forEach(o => {
      (o.order_items || []).forEach(item => {
        const existing = map.get(item.product_name) || {
          name: item.product_name,
          unitsSold: 0,
          totalGross: 0,
          avgPrice: item.unit_price || 0
        };
        existing.unitsSold += item.quantity || 1;
        existing.totalGross += Number(item.total_price || (item.unit_price * item.quantity) || 0);
        map.set(item.product_name, existing);
      });
    });

    return Array.from(map.values()).sort((a, b) => b.totalGross - a.totalGross);
  }, [filteredOrders]);

  // Customer Report Aggregation
  const customerReportData = useMemo(() => {
    const map = new Map<string, { name: string; email: string; phone?: string; ordersCount: number; totalSpent: number }>();

    filteredOrders.forEach(o => {
      const email = o.customer_email || 'guest@example.com';
      const existing = map.get(email) || {
        name: o.customer_name,
        email,
        phone: o.customer_phone,
        ordersCount: 0,
        totalSpent: 0
      };
      existing.ordersCount += 1;
      existing.totalSpent += Number(o.total_amount || 0);
      map.set(email, existing);
    });

    return Array.from(map.values()).sort((a, b) => b.totalSpent - a.totalSpent);
  }, [filteredOrders]);

  // Export to CSV
  const handleExportCSV = () => {
    let headers: string[] = [];
    let rows: (string | number)[][] = [];
    const filename = `everyjust_${activeCategory}_report_${dateRange}.csv`;

    if (activeCategory === 'sales') {
      headers = ['Order Number', 'Customer', 'Date', 'Payment', 'Subtotal', 'Tax', 'Discount', 'Total Amount', 'Status'];
      rows = filteredOrders.map(o => [
        o.order_number,
        o.customer_name,
        new Date(o.created_at).toLocaleDateString('en-IN'),
        o.payment_method,
        o.subtotal,
        o.tax_amount,
        o.discount_amount,
        o.total_amount,
        o.status
      ]);
    } else if (activeCategory === 'inventory') {
      headers = ['Product Name', 'Units Sold', 'Total Revenue (INR)', 'Average Price'];
      rows = inventoryReportData.map(p => [
        `"${p.name.replace(/"/g, '""')}"`,
        p.unitsSold,
        p.totalGross,
        p.avgPrice
      ]);
    } else if (activeCategory === 'customers') {
      headers = ['Customer Name', 'Email', 'Phone', 'Orders Count', 'Total Spent (INR)'];
      rows = customerReportData.map(c => [
        `"${c.name.replace(/"/g, '""')}"`,
        c.email,
        c.phone || '',
        c.ordersCount,
        c.totalSpent
      ]);
    } else {
      headers = ['Order Number', 'Date', 'Taxable Value (INR)', 'CGST 9% (INR)', 'SGST 9% (INR)', 'Total Tax (INR)', 'Total Amount'];
      rows = filteredOrders.map(o => {
        const halfTax = (Number(o.tax_amount) / 2).toFixed(2);
        return [
          o.order_number,
          new Date(o.created_at).toLocaleDateString('en-IN'),
          o.subtotal,
          halfTax,
          halfTax,
          o.tax_amount,
          o.total_amount
        ];
      });
    }

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success(`Exported ${activeCategory.toUpperCase()} Report to CSV!`);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-black text-gray-900 tracking-tight">Intelligence & Reports</h1>
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
              isLive ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
            }`}>
              <span className={`w-2 h-2 rounded-full ${isLive ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
              {isLive ? 'Connected to Supabase' : 'Waiting for Tables'}
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Generate and export custom sales, inventory, consumer, and GST tax statements.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={loadData}
            disabled={loading}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl border border-gray-200 hover:border-gray-300 text-gray-700 text-xs font-bold hover:bg-gray-50 transition-all cursor-pointer disabled:opacity-50"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl border border-gray-200 hover:border-gray-300 text-gray-700 text-xs font-bold hover:bg-gray-50 transition-all cursor-pointer"
          >
            <Printer size={14} />
            <span>Print</span>
          </button>

          <button
            type="button"
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#6A43FB] to-[#5926EC] text-white text-xs font-bold shadow-md shadow-purple-500/20 hover:opacity-95 transition-all cursor-pointer"
          >
            <Download size={14} />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Category Tabs & Range Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-4 rounded-3xl border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
        {/* Category Selector */}
        <div className="flex bg-gray-100 p-1.5 rounded-2xl text-xs font-bold text-gray-600 overflow-x-auto scrollbar-hide">
          {[
            { id: 'sales', label: 'Sales & Revenue', icon: BarChart3 },
            { id: 'inventory', label: 'Product Inventory', icon: Package },
            { id: 'customers', label: 'Customers', icon: Users },
            { id: 'tax', label: 'GST & Tax Compliance', icon: Receipt },
          ].map((cat) => {
            const Icon = cat.icon;
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveCategory(cat.id as ReportCategory)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-white text-gray-900 shadow-md font-black'
                    : 'hover:text-gray-900'
                }`}
              >
                <Icon size={15} className={isActive ? 'text-[#6A43FB]' : 'text-gray-400'} />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* Date Range Selector */}
        <div className="flex items-center gap-2">
          <Calendar size={15} className="text-gray-400 ml-2" />
          <div className="flex bg-gray-100 p-1.5 rounded-2xl text-xs font-semibold text-gray-600">
            {[
              { id: '7d', label: '7 Days' },
              { id: '30d', label: '30 Days' },
              { id: '90d', label: 'Quarter' },
              { id: 'ytd', label: 'YTD' },
              { id: 'all', label: 'All Time' },
            ].map((rng) => (
              <button
                key={rng.id}
                type="button"
                onClick={() => setDateRange(rng.id as DateRange)}
                className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                  dateRange === rng.id
                    ? 'bg-[#6A43FB] text-white shadow-sm font-bold'
                    : 'hover:text-gray-900'
                }`}
              >
                {rng.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Summary KPI Cards based on Category */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {activeCategory === 'sales' && (
          <>
            <div className="bg-white rounded-3xl p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100">
              <div className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-1">Gross Invoiced</div>
              <div className="text-2xl font-black text-gray-900">{formatCurrency(salesSummary.grossSales)}</div>
              <div className="text-[11px] text-emerald-600 font-bold mt-2">Across {salesSummary.totalOrders} Orders</div>
            </div>
            <div className="bg-white rounded-3xl p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100">
              <div className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-1">Avg Order Value (AOV)</div>
              <div className="text-2xl font-black text-gray-900">{formatCurrency(salesSummary.aov)}</div>
              <div className="text-[11px] text-gray-400 font-medium mt-2">Per checkout session</div>
            </div>
            <div className="bg-white rounded-3xl p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100">
              <div className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-1">Discounts Applied</div>
              <div className="text-2xl font-black text-gray-900">{formatCurrency(salesSummary.totalDiscounts)}</div>
              <div className="text-[11px] text-rose-500 font-medium mt-2">Promotional offers</div>
            </div>
            <div className="bg-white rounded-3xl p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100">
              <div className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-1">Fulfillment Rate</div>
              <div className="text-2xl font-black text-gray-900">{salesSummary.fulfillmentRate}%</div>
              <div className="text-[11px] text-emerald-600 font-bold mt-2">Successfully delivered</div>
            </div>
          </>
        )}

        {activeCategory === 'inventory' && (
          <>
            <div className="bg-white rounded-3xl p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100">
              <div className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-1">Total Products Sold</div>
              <div className="text-2xl font-black text-gray-900">
                {inventoryReportData.reduce((acc, p) => acc + p.unitsSold, 0)} Units
              </div>
              <div className="text-[11px] text-purple-600 font-bold mt-2">Across all catalogs</div>
            </div>
            <div className="bg-white rounded-3xl p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100">
              <div className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-1">Top Selling Item</div>
              <div className="text-base font-bold text-gray-900 truncate">
                {inventoryReportData[0]?.name || 'N/A'}
              </div>
              <div className="text-[11px] text-emerald-600 font-bold mt-2">
                {inventoryReportData[0]?.unitsSold || 0} Units ({formatCurrency(inventoryReportData[0]?.totalGross || 0)})
              </div>
            </div>
            <div className="bg-white rounded-3xl p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100">
              <div className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-1">Active Catalog SKUs</div>
              <div className="text-2xl font-black text-gray-900">{inventoryReportData.length} SKUs</div>
              <div className="text-[11px] text-gray-400 font-medium mt-2">Generated sales</div>
            </div>
            <div className="bg-white rounded-3xl p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100">
              <div className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-1">Avg Selling Price</div>
              <div className="text-2xl font-black text-gray-900">
                {formatCurrency(inventoryReportData.length > 0 
                  ? inventoryReportData.reduce((acc, p) => acc + p.avgPrice, 0) / inventoryReportData.length 
                  : 0)}
              </div>
              <div className="text-[11px] text-gray-400 font-medium mt-2">Across active items</div>
            </div>
          </>
        )}

        {activeCategory === 'customers' && (
          <>
            <div className="bg-white rounded-3xl p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100">
              <div className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-1">Total Customers</div>
              <div className="text-2xl font-black text-gray-900">{customerReportData.length}</div>
              <div className="text-[11px] text-purple-600 font-bold mt-2">Active buyers</div>
            </div>
            <div className="bg-white rounded-3xl p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100">
              <div className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-1">Top Spender</div>
              <div className="text-base font-bold text-gray-900 truncate">
                {customerReportData[0]?.name || 'N/A'}
              </div>
              <div className="text-[11px] text-emerald-600 font-bold mt-2">
                {formatCurrency(customerReportData[0]?.totalSpent || 0)} Total
              </div>
            </div>
            <div className="bg-white rounded-3xl p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100">
              <div className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-1">Avg Spend Per Buyer</div>
              <div className="text-2xl font-black text-gray-900">
                {formatCurrency(customerReportData.length > 0 
                  ? salesSummary.grossSales / customerReportData.length 
                  : 0)}
              </div>
              <div className="text-[11px] text-gray-400 font-medium mt-2">Customer lifetime value</div>
            </div>
            <div className="bg-white rounded-3xl p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100">
              <div className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-1">Repeat Purchase Rate</div>
              <div className="text-2xl font-black text-gray-900">
                {customerReportData.length > 0
                  ? ((customerReportData.filter(c => c.ordersCount > 1).length / customerReportData.length) * 100).toFixed(0)
                  : 0}%
              </div>
              <div className="text-[11px] text-emerald-600 font-bold mt-2">Loyal multi-order buyers</div>
            </div>
          </>
        )}

        {activeCategory === 'tax' && (
          <>
            <div className="bg-white rounded-3xl p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100">
              <div className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-1">Total GST Collected</div>
              <div className="text-2xl font-black text-gray-900">{formatCurrency(salesSummary.totalTaxes)}</div>
              <div className="text-[11px] text-emerald-600 font-bold mt-2">Integrated Tax Liability</div>
            </div>
            <div className="bg-white rounded-3xl p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100">
              <div className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-1">CGST Share (9%)</div>
              <div className="text-2xl font-black text-gray-900">{formatCurrency(salesSummary.totalTaxes / 2)}</div>
              <div className="text-[11px] text-gray-400 font-medium mt-2">Central Goods & Service Tax</div>
            </div>
            <div className="bg-white rounded-3xl p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100">
              <div className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-1">SGST Share (9%)</div>
              <div className="text-2xl font-black text-gray-900">{formatCurrency(salesSummary.totalTaxes / 2)}</div>
              <div className="text-[11px] text-gray-400 font-medium mt-2">State Goods & Service Tax</div>
            </div>
            <div className="bg-white rounded-3xl p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100">
              <div className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-1">Taxable Supplies</div>
              <div className="text-2xl font-black text-gray-900">
                {formatCurrency(salesSummary.grossSales - salesSummary.totalTaxes)}
              </div>
              <div className="text-[11px] text-purple-600 font-bold mt-2">Net taxable base</div>
            </div>
          </>
        )}
      </div>

      {/* Main Table for the Selected Report Category */}
      <div className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="font-bold text-gray-900 text-lg capitalize">
              {activeCategory} Statement Breakdown
            </h3>
            <p className="text-xs text-gray-400 mt-0.5">
              Filtered for {dateRange === '7d' ? 'last 7 days' : dateRange === '30d' ? 'last 30 days' : dateRange === '90d' ? 'quarter' : dateRange === 'ytd' ? 'year to date' : 'all time'}
            </p>
          </div>

          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search in report..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#6A43FB]/20 focus:border-[#6A43FB] transition-all w-52 sm:w-60"
            />
          </div>
        </div>

        {/* Dynamic Table Content */}
        <div className="overflow-x-auto">
          {activeCategory === 'sales' && (
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="text-xs text-gray-400 uppercase tracking-wider border-b border-gray-100 pb-3">
                  <th className="pb-3 font-semibold pl-2">Order #</th>
                  <th className="pb-3 font-semibold">Customer</th>
                  <th className="pb-3 font-semibold">Date</th>
                  <th className="pb-3 font-semibold">Subtotal</th>
                  <th className="pb-3 font-semibold">GST</th>
                  <th className="pb-3 font-semibold">Discount</th>
                  <th className="pb-3 font-semibold">Grand Total</th>
                  <th className="pb-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredOrders.map(o => (
                  <tr key={o.id} className="hover:bg-gray-50/70 transition-colors text-xs">
                    <td className="py-4 pl-2 font-black text-gray-900 font-mono">{o.order_number}</td>
                    <td className="py-4 font-bold text-gray-800">{o.customer_name}</td>
                    <td className="py-4 text-gray-500">{new Date(o.created_at).toLocaleDateString('en-IN')}</td>
                    <td className="py-4 font-medium text-gray-700">{formatCurrency(Number(o.subtotal))}</td>
                    <td className="py-4 font-medium text-gray-500">{formatCurrency(Number(o.tax_amount))}</td>
                    <td className="py-4 font-medium text-rose-500">-{formatCurrency(Number(o.discount_amount))}</td>
                    <td className="py-4 font-black text-gray-900">{formatCurrency(Number(o.total_amount))}</td>
                    <td className="py-4">
                      <span className="capitalize px-2.5 py-0.5 rounded-full font-bold bg-gray-100 text-gray-700">
                        {o.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {activeCategory === 'inventory' && (
            <table className="w-full text-left border-collapse min-w-[650px]">
              <thead>
                <tr className="text-xs text-gray-400 uppercase tracking-wider border-b border-gray-100 pb-3">
                  <th className="pb-3 font-semibold pl-2">Product Name</th>
                  <th className="pb-3 font-semibold">Units Sold</th>
                  <th className="pb-3 font-semibold">Average Unit Price</th>
                  <th className="pb-3 font-semibold">Gross Revenue</th>
                  <th className="pb-3 font-semibold">Share</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {inventoryReportData.map((p, idx) => (
                  <tr key={idx} className="hover:bg-gray-50/70 transition-colors text-xs">
                    <td className="py-4 pl-2 font-bold text-gray-900">{p.name}</td>
                    <td className="py-4 font-semibold text-purple-600">{p.unitsSold} pcs</td>
                    <td className="py-4 text-gray-700">{formatCurrency(p.avgPrice)}</td>
                    <td className="py-4 font-black text-gray-900">{formatCurrency(p.totalGross)}</td>
                    <td className="py-4 text-emerald-600 font-bold">
                      {salesSummary.grossSales > 0 ? ((p.totalGross / salesSummary.grossSales) * 100).toFixed(1) : 0}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {activeCategory === 'customers' && (
            <table className="w-full text-left border-collapse min-w-[650px]">
              <thead>
                <tr className="text-xs text-gray-400 uppercase tracking-wider border-b border-gray-100 pb-3">
                  <th className="pb-3 font-semibold pl-2">Customer</th>
                  <th className="pb-3 font-semibold">Email</th>
                  <th className="pb-3 font-semibold">Phone</th>
                  <th className="pb-3 font-semibold">Total Orders</th>
                  <th className="pb-3 font-semibold">Lifetime Spend</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {customerReportData.map((c, idx) => (
                  <tr key={idx} className="hover:bg-gray-50/70 transition-colors text-xs">
                    <td className="py-4 pl-2 font-bold text-gray-900">{c.name}</td>
                    <td className="py-4 text-gray-600">{c.email}</td>
                    <td className="py-4 text-gray-500">{c.phone || '-'}</td>
                    <td className="py-4 font-bold text-purple-600">{c.ordersCount} Orders</td>
                    <td className="py-4 font-black text-gray-900">{formatCurrency(c.totalSpent)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {activeCategory === 'tax' && (
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="text-xs text-gray-400 uppercase tracking-wider border-b border-gray-100 pb-3">
                  <th className="pb-3 font-semibold pl-2">Invoice / Order #</th>
                  <th className="pb-3 font-semibold">Date</th>
                  <th className="pb-3 font-semibold">Taxable Amount</th>
                  <th className="pb-3 font-semibold">CGST (9%)</th>
                  <th className="pb-3 font-semibold">SGST (9%)</th>
                  <th className="pb-3 font-semibold">Total GST</th>
                  <th className="pb-3 font-semibold">Invoice Value</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredOrders.map(o => {
                  const halfTax = (Number(o.tax_amount) / 2);
                  return (
                    <tr key={o.id} className="hover:bg-gray-50/70 transition-colors text-xs">
                      <td className="py-4 pl-2 font-black text-gray-900 font-mono">{o.order_number}</td>
                      <td className="py-4 text-gray-500">{new Date(o.created_at).toLocaleDateString('en-IN')}</td>
                      <td className="py-4 font-bold text-gray-800">{formatCurrency(Number(o.subtotal))}</td>
                      <td className="py-4 text-gray-600">{formatCurrency(halfTax)}</td>
                      <td className="py-4 text-gray-600">{formatCurrency(halfTax)}</td>
                      <td className="py-4 font-bold text-[#6A43FB]">{formatCurrency(Number(o.tax_amount))}</td>
                      <td className="py-4 font-black text-gray-900">{formatCurrency(Number(o.total_amount))}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
