import React from 'react';

export default function AdminDashboardPage() {
  return (
    <div className="p-8 max-w-7xl mx-auto">
      <header className="mb-8">
        <h1 className="text-3xl font-black text-gray-900 tracking-tight">Dashboard Overview</h1>
        <p className="text-gray-500 font-medium mt-2">Welcome back. Here is what's happening today.</p>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <StatCard title="Total Users" value="12,482" trend="+14%" isPositive={true} />
        <StatCard title="Active Brands" value="142" trend="+5%" isPositive={true} />
        <StatCard title="Total Revenue" value="$42,890" trend="-2%" isPositive={false} />
        <StatCard title="Pending Approvals" value="18" trend="Requires attention" isNeutral={true} />
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Activity Table */}
        <div className="col-span-1 lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
            <h2 className="text-lg font-bold text-gray-900">Recent Registrations</h2>
            <button className="text-primary text-sm font-bold hover:underline">View All</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white text-xs uppercase tracking-wider font-semibold text-gray-500 border-b border-gray-100">
                  <th className="p-4 pl-6">Brand / User</th>
                  <th className="p-4">Date</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right pr-6">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {[
                  { name: 'Acme Corp', type: 'Brand', date: 'Today, 10:42 AM', status: 'Pending' },
                  { name: 'John Doe', type: 'User', date: 'Today, 09:12 AM', status: 'Active' },
                  { name: 'Global Tech', type: 'Brand', date: 'Yesterday', status: 'Active' },
                  { name: 'Jane Smith', type: 'User', date: 'Yesterday', status: 'Inactive' },
                ].map((row, idx) => (
                  <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                    <td className="p-4 pl-6">
                      <p className="font-bold text-gray-900">{row.name}</p>
                      <p className="text-xs text-gray-500 font-medium">{row.type}</p>
                    </td>
                    <td className="p-4 text-sm text-gray-600 font-medium">{row.date}</td>
                    <td className="p-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        row.status === 'Active' ? 'bg-green-100 text-green-800' : 
                        row.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' : 
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {row.status}
                      </span>
                    </td>
                    <td className="p-4 text-right pr-6">
                      <button className="text-gray-400 hover:text-primary transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 inline" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* System Status Sidebar */}
        <div className="col-span-1 space-y-6">
          <div className="bg-gradient-to-br from-gray-900 to-black rounded-2xl shadow-xl p-6 text-white border border-gray-800">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              System Status
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-end border-b border-gray-800 pb-3">
                <span className="text-sm font-medium text-gray-400">Database</span>
                <span className="text-sm font-bold text-green-400">Healthy</span>
              </div>
              <div className="flex justify-between items-end border-b border-gray-800 pb-3">
                <span className="text-sm font-medium text-gray-400">API Latency</span>
                <span className="text-sm font-bold text-white">42ms</span>
              </div>
              <div className="flex justify-between items-end">
                <span className="text-sm font-medium text-gray-400">Errors (24h)</span>
                <span className="text-sm font-bold text-white">0.01%</span>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-md font-bold text-gray-900 mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-3">
              <button className="bg-gray-50 hover:bg-gray-100 text-gray-700 font-semibold py-3 px-4 rounded-xl text-sm transition-colors border border-gray-200 shadow-sm flex flex-col items-center gap-2">
                <span>+</span> Add Admin
              </button>
              <button className="bg-gray-50 hover:bg-gray-100 text-gray-700 font-semibold py-3 px-4 rounded-xl text-sm transition-colors border border-gray-200 shadow-sm flex flex-col items-center gap-2">
                <span>⚡</span> Export Data
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Simple Stat Card Component
function StatCard({ title, value, trend, isPositive, isNeutral }: { title: string, value: string, trend: string, isPositive?: boolean, isNeutral?: boolean }) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">{title}</h3>
      <p className="text-3xl font-black text-gray-900 mb-4">{value}</p>
      <div className={`text-sm font-bold flex items-center gap-1 ${isNeutral ? 'text-gray-500' : isPositive ? 'text-green-600' : 'text-red-500'}`}>
        {!isNeutral && (
          <svg className={`w-4 h-4 ${isPositive ? '' : 'rotate-180'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
        )}
        {trend}
      </div>
    </div>
  );
}
