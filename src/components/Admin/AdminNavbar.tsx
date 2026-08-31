"use client";
import React from 'react';
import { Search, Bell, Menu, User as UserIcon } from 'lucide-react';
import { User } from '@supabase/supabase-js';

interface AdminNavbarProps {
  user: User | null;
  isSidebarOpen: boolean;
  setIsSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function AdminNavbar({ user, isSidebarOpen, setIsSidebarOpen }: AdminNavbarProps) {
  return (
    <header className="h-[90px] px-8 flex items-center justify-between sticky top-0 z-10 bg-[#F0F2F5]/90 backdrop-blur-md">
       <div className="flex items-center gap-4">
          <button className="bg-white text-gray-500 hover:text-gray-800 px-6 py-2.5 rounded-full text-sm font-semibold shadow-sm border border-gray-100 transition-all">
             Global Search
          </button>
          <button className="bg-white text-gray-500 hover:text-gray-800 px-6 py-2.5 rounded-full text-sm font-semibold shadow-sm border border-gray-100 transition-all">
             Filter
          </button>
          <button className="bg-[#3ED08C] text-white px-6 py-2.5 rounded-full text-sm font-semibold shadow-md shadow-[#3ED08C]/30 hover:bg-[#32B879] transition-all">
             New Order
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
           <div className="flex items-center gap-3 ml-2">
             <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#6A43FB] to-[#3ED08C] p-[2px] shadow-sm">
                <div className="w-full h-full bg-[#1A1C29] rounded-full flex items-center justify-center text-white">
                    <UserIcon size={18} />
                </div>
             </div>
             <div className="hidden md:block text-sm">
                <p className="font-bold text-gray-800">{user?.email || 'Admin'}</p>
                <p className="text-xs text-green-500 font-bold uppercase tracking-wider">Online</p>
             </div>
           </div>
           
           <button 
             onClick={() => setIsSidebarOpen(!isSidebarOpen)}
             className="text-gray-600 hover:text-gray-900 ml-4 p-2 rounded-lg hover:bg-gray-200 transition-colors"
           >
              <Menu size={28} strokeWidth={2} />
           </button>
       </div>
    </header>
  );
}
