import React from 'react';
import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import Link from 'next/link';
import { Search, Bell, Menu, User } from 'lucide-react';
import AdminSidebar from '@/components/Admin/AdminSidebar';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/admin/login');
  }

  return (
    <div className="min-h-screen bg-[#F0F2F5] flex font-sans">
      {/* Sidebar Navigation */}
      <AdminSidebar />

      {/* Main Content Area */}
      <main className="flex-1 ml-[280px] bg-[#F0F2F5] min-h-screen flex flex-col relative">
        {/* Top Navbar */}
        <header className="h-[90px] px-8 flex items-center justify-between sticky top-0 z-10">
           <div className="flex items-center gap-4">
              <button className="bg-white text-gray-500 hover:text-gray-800 px-6 py-2.5 rounded-full text-sm font-semibold shadow-sm border border-gray-100 transition-all">
                 Lorem ipsum
              </button>
              <button className="bg-white text-gray-500 hover:text-gray-800 px-6 py-2.5 rounded-full text-sm font-semibold shadow-sm border border-gray-100 transition-all">
                 Amet lorem
              </button>
              <button className="bg-[#3ED08C] text-white px-6 py-2.5 rounded-full text-sm font-semibold shadow-md shadow-[#3ED08C]/30 hover:bg-[#32B879] transition-all">
                 Ipsum dolor
              </button>
           </div>
           
           <div className="flex items-center gap-6">
               <button className="text-gray-400 hover:text-gray-600 transition-colors">
                  <Search size={24} />
               </button>
               <button className="text-gray-400 hover:text-gray-600 transition-colors relative">
                  <Bell size={24} />
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#3ED08C] rounded-full border-2 border-[#F0F2F5] flex items-center justify-center text-[9px] text-white font-bold">5</span>
               </button>
               <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#6A43FB] to-[#3ED08C] p-[2px] shadow-sm">
                  <div className="w-full h-full bg-[#1A1C29] rounded-full flex items-center justify-center text-white">
                      <User size={18} />
                  </div>
               </div>
               <button className="text-gray-600 hover:text-gray-900 ml-2">
                  <Menu size={32} strokeWidth={1.5} />
               </button>
           </div>
        </header>

        {/* Dashboard Content */}
        <div className="p-8 pt-0 flex-1 relative z-0">
          {children}
        </div>
      </main>
    </div>
  );
}
