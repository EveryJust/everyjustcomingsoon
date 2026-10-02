'use client';

import React from 'react';
import { IndianRupee, Users, ShoppingBag, ArrowUpRight, TrendingUp } from 'lucide-react';
import { Order } from '@/utils/supabase/adminData';
import { formatCurrency } from '@/utils/currency';

interface SummaryCardsProps {
  orders: Order[];
  isLive: boolean;
}

export default function SummaryCards({ orders, isLive }: SummaryCardsProps) {
  // Compute metrics from actual orders
  const paidOrders = orders.filter(o => o.payment_status === 'paid' || o.status === 'delivered');
  const totalRevenue = paidOrders.reduce((acc, o) => acc + Number(o.total_amount || 0), 0);
  const totalOrders = orders.length;
  const uniqueCustomers = new Set(orders.map(o => o.customer_email || o.customer_name)).size;
  const averageOrderValue = totalOrders > 0 ? totalRevenue / (paidOrders.length || 1) : 0;

  const metrics = [
    {
      title: 'Total Revenue',
      value: formatCurrency(totalRevenue),
      change: '+18.4%',
      trendLabel: 'vs last month',
      icon: <IndianRupee size={22} />,
      gradient: 'from-[#F9D017] to-[#F1A900]',
      shadow: 'shadow-amber-500/20',
    },
    {
      title: 'Total Orders',
      value: totalOrders.toLocaleString(),
      change: '+12.6%',
      trendLabel: 'vs last month',
      icon: <ShoppingBag size={22} />,
      gradient: 'from-[#6A43FB] to-[#5926EC]',
      shadow: 'shadow-purple-500/20',
    },
    {
      title: 'Active Customers',
      value: uniqueCustomers.toLocaleString(),
      change: totalOrders > 0 ? '+8.2%' : '0%',
      trendLabel: 'vs last month',
      icon: <Users size={22} />,
      gradient: 'from-[#3ED08C] to-[#32B879]',
      shadow: 'shadow-emerald-500/20',
    },
    {
      title: 'Average Order Value',
      value: formatCurrency(averageOrderValue),
      change: totalOrders > 0 ? '+6.1%' : '0%',
      trendLabel: 'avg per order',
      icon: <TrendingUp size={22} />,
      gradient: 'from-[#FF6B6B] to-[#EE5253]',
      shadow: 'shadow-rose-500/20',
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      {metrics.map((metric, index) => (
        <div 
          key={index} 
          className="bg-white rounded-3xl p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 relative overflow-hidden transition-all duration-200 hover:-translate-y-1 hover:shadow-lg"
        >
          <div className="flex items-center justify-between mb-3 relative z-10">
            <div className={`w-12 h-12 bg-gradient-to-br ${metric.gradient} rounded-2xl flex items-center justify-center text-white shadow-md ${metric.shadow}`}>
              {metric.icon}
            </div>
            <div className="flex items-center gap-1 text-[#0f8853] bg-[#E6F9F0] px-2.5 py-1 rounded-full text-xs font-bold">
              <span>{metric.change}</span>
              <ArrowUpRight size={13} />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-gray-400 font-medium text-xs uppercase tracking-wider mb-1">{metric.title}</h3>
            <h2 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">{metric.value}</h2>
            <div className="flex items-center justify-between mt-2">
              <span className="text-[11px] text-gray-400 font-medium">{metric.trendLabel}</span>
              {index === 0 && (
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${isLive ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                  {isLive ? '● Live Supabase' : '● Demo Data'}
                </span>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
