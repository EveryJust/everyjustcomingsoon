import React from 'react';
import SummaryCards from '@/components/Admin/Dashboard/SummaryCards';
import SalesChart from '@/components/Admin/Dashboard/SalesChart';
import RecentOrders from '@/components/Admin/Dashboard/RecentOrders';
import TopProducts from '@/components/Admin/Dashboard/TopProducts';

export default function AdminDashboardPage() {
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Top Metrics Row */}
      <SummaryCards />

      {/* Charts Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <div className="md:col-span-2">
            <SalesChart />
         </div>
         <div className="md:col-span-1">
            <TopProducts />
         </div>
      </div>

      {/* Orders Row */}
      <div className="grid grid-cols-1 gap-6">
        <RecentOrders />
      </div>
    </div>
  );
}
