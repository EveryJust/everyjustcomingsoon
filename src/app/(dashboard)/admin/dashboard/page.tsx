'use client';

import React, { useState, useEffect } from 'react';
import SummaryCards from '@/components/Admin/Dashboard/SummaryCards';
import SalesChart from '@/components/Admin/Dashboard/SalesChart';
import RecentOrders from '@/components/Admin/Dashboard/RecentOrders';
import TopProducts from '@/components/Admin/Dashboard/TopProducts';
import { getAdminOrders, Order } from '@/utils/supabase/adminData';
import { RefreshCw, Database, AlertCircle, ArrowUpRight, ShoppingBag } from 'lucide-react';
import toast from 'react-hot-toast';
import Link from 'next/link';

export default function AdminDashboardPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLive, setIsLive] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    const result = await getAdminOrders();
    setOrders(result.orders);
    setIsLive(result.isLive);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      {/* Top Header Row with Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-black text-gray-900 tracking-tight">Admin Overview</h1>
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
              isLive ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
            }`}>
              <span className={`w-2 h-2 rounded-full ${isLive ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
              {isLive ? 'Connected to Supabase' : 'Waiting for Tables'}
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Real-time sales tracking, customer orders, and financial operations.
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
        </div>
      </div>

      {/* Supabase Notice Banner if not connected to live tables */}
      {!isLive && (
        <div className="bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-200/80 p-4 rounded-2xl flex items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500 text-white flex-shrink-0">
              <AlertCircle size={18} />
            </div>
            <div>
              <h4 className="text-xs font-bold text-gray-900">Supabase Setup Notice</h4>
              <p className="text-xs text-gray-600">
                Run <code className="bg-amber-100 text-amber-800 px-1 py-0.5 rounded text-[11px] font-mono">supabase/schema.sql</code> in your Supabase SQL editor to create the orders and transactions tables.
              </p>
            </div>
          </div>
          <Link
            href="/admin/finances"
            className="flex items-center gap-1 text-xs font-bold text-amber-900 bg-amber-200/80 hover:bg-amber-200 px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors"
          >
            <span>Finances</span>
            <ArrowUpRight size={14} />
          </Link>
        </div>
      )}

      {/* When live and no orders yet */}
      {isLive && orders.length === 0 && (
        <div className="bg-blue-50 border border-blue-200/80 p-4 rounded-2xl flex items-center gap-3">
          <div className="p-2 rounded-xl bg-blue-500 text-white flex-shrink-0">
            <ShoppingBag size={18} />
          </div>
          <div>
            <h4 className="text-xs font-bold text-blue-900">Ready for Live Orders</h4>
            <p className="text-xs text-blue-700">
              Supabase tables are active! As customers place orders on the storefront, real metrics, charts, and customer details will populate automatically.
            </p>
          </div>
        </div>
      )}

      {/* Top Metrics Row */}
      <SummaryCards orders={orders} isLive={isLive} />

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <SalesChart orders={orders} />
        </div>
        <div className="lg:col-span-1">
          <TopProducts orders={orders} />
        </div>
      </div>

      {/* Orders Row */}
      <div className="grid grid-cols-1 gap-6">
        <RecentOrders orders={orders} />
      </div>
    </div>
  );
}
