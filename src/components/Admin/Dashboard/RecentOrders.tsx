'use client';

import React, { useState } from 'react';
import { Order } from '@/utils/supabase/adminData';
import { formatCurrency } from '@/utils/currency';
import { Search, Filter, CheckCircle2, Clock, Truck, Package, XCircle, ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface RecentOrdersProps {
  orders: Order[];
}

export default function RecentOrders({ orders }: RecentOrdersProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer_email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || order.status.toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'delivered':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 size={13} />
            Delivered
          </span>
        );
      case 'processing':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
            <Clock size={13} />
            Processing
          </span>
        );
      case 'shipped':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200">
            <Truck size={13} />
            Shipped
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
            <Package size={13} />
            Pending
          </span>
        );
      case 'cancelled':
      case 'refunded':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
            <XCircle size={13} />
            {status}
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-700">
            {status}
          </span>
        );
    }
  };

  const formatDate = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return isoString;
    }
  };

  return (
    <div className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h3 className="font-bold text-gray-900 text-lg">Recent Customer Orders</h3>
          <p className="text-xs text-gray-400 mt-0.5">Real-time fulfillment and payment status</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by order or customer..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#6A43FB]/20 focus:border-[#6A43FB] transition-all w-56 sm:w-64"
            />
          </div>

          {/* Status Filter Tabs */}
          <div className="flex bg-gray-100 p-1 rounded-xl text-xs font-semibold text-gray-600 overflow-x-auto scrollbar-hide">
            {['all', 'processing', 'shipped', 'delivered', 'pending', 'cancelled'].map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setStatusFilter(st)}
                className={`px-2.5 py-1.5 rounded-lg capitalize transition-all whitespace-nowrap cursor-pointer ${
                  statusFilter === st ? 'bg-white text-gray-900 shadow-sm font-bold' : 'hover:text-gray-900'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>
      </div>
      
      {/* Orders Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[700px]">
          <thead>
            <tr className="text-xs text-gray-400 uppercase tracking-wider border-b border-gray-100 pb-3">
              <th className="pb-3 font-semibold pl-2">Order ID</th>
              <th className="pb-3 font-semibold">Customer</th>
              <th className="pb-3 font-semibold">Date</th>
              <th className="pb-3 font-semibold">Payment</th>
              <th className="pb-3 font-semibold">Amount</th>
              <th className="pb-3 font-semibold">Fulfillment</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filteredOrders.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-sm text-gray-400">
                  No orders match your filter criteria.
                </td>
              </tr>
            ) : (
              filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50/70 transition-colors">
                  <td className="py-4 pl-2">
                    <span className="text-sm font-black text-gray-900 font-mono tracking-tight">
                      {order.order_number}
                    </span>
                  </td>
                  <td className="py-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#6A43FB] to-[#5926EC] text-white flex items-center justify-center font-bold text-xs shadow-sm">
                        {order.customer_name ? order.customer_name[0] : 'U'}
                      </div>
                      <div>
                        <div className="text-sm font-bold text-gray-800 leading-tight">
                          {order.customer_name}
                        </div>
                        <div className="text-[11px] text-gray-400 font-medium">
                          {order.customer_email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 text-xs font-medium text-gray-500">
                    {formatDate(order.created_at)}
                  </td>
                  <td className="py-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-semibold bg-gray-100 text-gray-700">
                      {order.payment_method}
                    </span>
                  </td>
                  <td className="py-4">
                    <span className="text-sm font-black text-gray-900">
                      {formatCurrency(Number(order.total_amount))}
                    </span>
                  </td>
                  <td className="py-4">
                    {getStatusBadge(order.status)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
