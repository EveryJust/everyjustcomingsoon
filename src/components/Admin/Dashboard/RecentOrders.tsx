import React from 'react';

export default function RecentOrders() {
  const orders = [
    { id: '#ORD-001', customer: 'John Doe', status: 'Delivered', amount: '$120.00', date: 'Oct 24, 2023' },
    { id: '#ORD-002', customer: 'Jane Smith', status: 'Processing', amount: '$45.50', date: 'Oct 23, 2023' },
    { id: '#ORD-003', customer: 'Alice Johnson', status: 'Shipped', amount: '$299.99', date: 'Oct 23, 2023' },
    { id: '#ORD-004', customer: 'Bob Brown', status: 'Cancelled', amount: '$89.00', date: 'Oct 22, 2023' },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Delivered': return 'bg-green-100 text-green-600';
      case 'Processing': return 'bg-blue-100 text-blue-600';
      case 'Shipped': return 'bg-purple-100 text-purple-600';
      case 'Cancelled': return 'bg-red-100 text-red-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  return (
    <div className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] col-span-2">
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-bold text-gray-800 text-lg">Recent Orders</h3>
        <button className="text-sm font-bold text-[#6A43FB] hover:underline">View All</button>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="text-xs text-gray-400 uppercase tracking-wider border-b border-gray-100">
              <th className="pb-3 font-semibold">Order ID</th>
              <th className="pb-3 font-semibold">Customer</th>
              <th className="pb-3 font-semibold">Date</th>
              <th className="pb-3 font-semibold">Amount</th>
              <th className="pb-3 font-semibold">Status</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order, idx) => (
              <tr key={idx} className="border-b border-gray-50 last:border-0">
                <td className="py-4 text-sm font-bold text-gray-800">{order.id}</td>
                <td className="py-4 text-sm font-medium text-gray-600">{order.customer}</td>
                <td className="py-4 text-sm font-medium text-gray-400">{order.date}</td>
                <td className="py-4 text-sm font-bold text-gray-800">{order.amount}</td>
                <td className="py-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(order.status)}`}>
                    {order.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
