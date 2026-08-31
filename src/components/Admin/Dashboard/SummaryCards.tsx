import React from 'react';
import { IndianRupee, Users, ShoppingBag, ArrowUpRight } from 'lucide-react';

export default function SummaryCards() {
  const metrics = [
    {
      title: 'Total Revenue',
      value: '₹24,560',
      change: '+14%',
      icon: <IndianRupee size={24} />,
      gradient: 'from-[#F9D017] to-[#F1A900]',
    },
    {
      title: 'Active Users',
      value: '12,450',
      change: '+5%',
      icon: <Users size={24} />,
      gradient: 'from-[#3ED08C] to-[#32B879]',
    },
    {
      title: 'Total Orders',
      value: '3,840',
      change: '+12%',
      icon: <ShoppingBag size={24} />,
      gradient: 'from-[#6A43FB] to-[#5926EC]',
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {metrics.map((metric, index) => (
        <div key={index} className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden transition-all hover:-translate-y-1">
          <div className="flex items-center justify-between mb-4 relative z-10">
            <div className={`w-14 h-14 bg-gradient-to-br ${metric.gradient} rounded-2xl flex items-center justify-center text-white shadow-lg opacity-90`}>
              {metric.icon}
            </div>
            <div className="flex items-center gap-1 text-[#3ED08C] bg-[#E6F9F0] px-2 py-1 rounded-full text-xs font-bold">
              <span>{metric.change}</span>
              <ArrowUpRight size={14} />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-gray-400 font-medium text-sm">{metric.title}</h3>
            <h2 className="text-3xl font-black text-gray-800">{metric.value}</h2>
          </div>
        </div>
      ))}
    </div>
  );
}
