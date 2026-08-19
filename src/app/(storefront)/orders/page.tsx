import React from 'react';
import Link from 'next/link';

export default function OrdersPage() {
  const orders = [
    {
      id: 'OD-1234567890',
      date: 'Aug 15, 2026',
      total: '₹2,999',
      status: 'Delivered',
      items: [
        { name: 'Dash Camera Pro Max', image: '/dash_camera.png', qty: 1, price: '₹2,999' }
      ]
    },
    {
      id: 'OD-0987654321',
      date: 'Aug 10, 2026',
      total: '₹1,499',
      status: 'In Transit',
      items: [
        { name: 'Wireless Earbuds Active', image: '/promo_top_banner.png', qty: 1, price: '₹1,499' }
      ]
    }
  ];

  return (
    <div className="bg-gray-50 min-h-screen pb-16">
      <div className="bg-white border-b border-gray-200 py-8">
        <div className="max-w-7xl mx-auto px-4 lg:px-6">
          <h1 className="text-3xl font-extrabold text-gray-900">My Orders</h1>
          <p className="text-gray-500 mt-1">Track, return, or buy things again</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 lg:px-6 py-8 flex flex-col lg:flex-row gap-8">
        {/* Sidebar */}
        <div className="w-full lg:w-64 flex-shrink-0">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <ul className="flex flex-col">
              <li>
                <Link href="/orders" className="block px-4 py-3 bg-gray-50 text-primary font-bold rounded-lg">
                  My Orders
                </Link>
              </li>
              <li>
                <Link href="#" className="block px-4 py-3 text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-lg transition-colors">
                  Account Settings
                </Link>
              </li>
              <li>
                <Link href="#" className="block px-4 py-3 text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-lg transition-colors">
                  Payment Methods
                </Link>
              </li>
              <li>
                <Link href="#" className="block px-4 py-3 text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-lg transition-colors">
                  Addresses
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Order List */}
        <div className="flex-grow flex flex-col gap-6">
          
          {/* Filters */}
          <div className="flex gap-4 border-b border-gray-200">
            <button className="px-4 py-2 text-primary font-bold border-b-2 border-primary">Orders</button>
            <button className="px-4 py-2 text-gray-500 font-medium hover:text-gray-800">Not Yet Shipped</button>
            <button className="px-4 py-2 text-gray-500 font-medium hover:text-gray-800">Cancelled Orders</button>
          </div>

          {/* Orders */}
          {orders.map((order) => (
            <div key={order.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              {/* Order Header */}
              <div className="bg-gray-50 px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between border-b border-gray-200 gap-4">
                <div className="flex items-center gap-8">
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">Order Placed</p>
                    <p className="text-sm font-bold text-gray-800">{order.date}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">Total</p>
                    <p className="text-sm font-bold text-gray-800">{order.total}</p>
                  </div>
                </div>
                <div className="text-sm">
                  <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">Order #</p>
                  <p className="font-medium text-gray-700">{order.id}</p>
                </div>
              </div>

              {/* Order Body */}
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className={`text-lg font-bold ${order.status === 'Delivered' ? 'text-green-600' : 'text-orange-500'}`}>
                    {order.status}
                  </h3>
                  <button className="text-sm text-primary font-bold hover:underline">Track Package</button>
                </div>

                {order.items.map((item, idx) => (
                  <div key={idx} className="flex gap-6 items-center">
                    <div className="w-24 h-24 bg-gray-50 rounded-lg border border-gray-100 flex-shrink-0 flex items-center justify-center p-2">
                      <img src={item.image} alt={item.name} className="max-w-full max-h-full object-contain" />
                    </div>
                    <div className="flex-grow">
                      <Link href="/product/1" className="text-base font-bold text-gray-900 hover:text-primary hover:underline">
                        {item.name}
                      </Link>
                      <p className="text-gray-500 text-sm mt-1">Qty: {item.qty}</p>
                      <p className="text-gray-800 font-bold mt-2">{item.price}</p>
                    </div>
                    <div className="hidden sm:flex flex-col gap-2">
                      <button className="px-6 py-2 bg-primary text-white font-bold rounded-lg hover:bg-primary/90 transition-colors shadow-sm text-sm">
                        Buy it again
                      </button>
                      <button className="px-6 py-2 bg-white border border-gray-300 text-gray-700 font-bold rounded-lg hover:bg-gray-50 transition-colors shadow-sm text-sm">
                        View Item
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

        </div>
      </div>
    </div>
  );
}
