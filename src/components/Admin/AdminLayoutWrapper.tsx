"use client";
import React, { useState } from 'react';
import AdminSidebar from './AdminSidebar';
import AdminNavbar from './AdminNavbar';
import { User } from '@supabase/supabase-js';

export default function AdminLayoutWrapper({ 
  children, 
  user 
}: { 
  children: React.ReactNode; 
  user: User | null;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className="min-h-screen bg-[#F0F2F5] flex font-sans overflow-x-hidden">
      <AdminSidebar isOpen={isSidebarOpen} />
      
      <main 
        className={`flex-1 transition-all duration-300 ease-in-out ${isSidebarOpen ? 'ml-[280px]' : 'ml-[88px]'} bg-[#F0F2F5] min-h-screen flex flex-col relative pt-[90px]`}
      >
        <AdminNavbar 
          user={user} 
          isSidebarOpen={isSidebarOpen} 
          setIsSidebarOpen={setIsSidebarOpen} 
        />
        
        <div className="p-8 pt-0 flex-1 relative z-0">
          {children}
        </div>
      </main>
    </div>
  );
}
