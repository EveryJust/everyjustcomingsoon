import React from 'react';
import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import Link from 'next/link';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  // 1. Check if user is logged in
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/admin/login');
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-gray-900 text-white flex flex-col fixed h-full shadow-2xl z-10">
        <div className="p-6 border-b border-gray-800">
          <h2 className="text-2xl font-black uppercase tracking-tight text-white flex items-center gap-2">
            <span className="text-primary text-3xl leading-none">•</span>
            Admin
          </h2>
          <p className="text-xs text-gray-400 mt-1 uppercase tracking-widest font-semibold">
            Control Panel
          </p>
        </div>
        
        <nav className="flex-1 py-6 px-4 space-y-2 font-medium">
          <Link href="/admin/dashboard" className="block px-4 py-3 rounded-lg bg-gray-800 text-white hover:bg-gray-700 transition-colors">
            Dashboard
          </Link>
          <Link href="#" className="block px-4 py-3 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors">
            Users
          </Link>
          <Link href="#" className="block px-4 py-3 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors">
            Brands
          </Link>
          <Link href="#" className="block px-4 py-3 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors">
            Settings
          </Link>
        </nav>

        <div className="p-6 border-t border-gray-800">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center font-bold text-gray-300">
              {user.email?.charAt(0).toUpperCase() || 'A'}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-bold truncate text-gray-200">{user.email}</p>
              <p className="text-xs text-green-400 font-semibold uppercase tracking-wider">Online</p>
            </div>
          </div>
          <form action="/api/auth/signout" method="post">
            <button className="w-full py-2.5 px-4 bg-gray-800 hover:bg-red-500/10 hover:text-red-400 text-gray-300 rounded-lg text-sm font-bold transition-colors border border-gray-700 hover:border-red-500/20">
              Sign Out
            </button>
          </form>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 ml-64 bg-gray-50 min-h-screen">
        {children}
      </main>
    </div>
  );
}
