"use client";
import Link from 'next/link';
import { LayoutDashboard, Users, Tag, Package, Settings } from 'lucide-react';

interface AdminSidebarProps {
  isOpen: boolean;
}

export default function AdminSidebar({ isOpen }: AdminSidebarProps) {
  return (
    <aside 
      className={`bg-gradient-to-br from-[#6A43FB] to-[#5926EC] text-white flex flex-col fixed h-full shadow-xl z-20 rounded-r-3xl border-r border-[#7C55FC]/30 transition-all duration-300 ease-in-out ${
        isOpen ? 'w-[280px]' : 'w-[88px]'
      }`}
    >
      <div className={`p-8 flex items-center gap-3 ${isOpen ? '' : 'justify-center p-4 pt-8'}`}>
        <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center shadow-inner flex-shrink-0">
           <span className="text-white text-xl font-bold">E</span>
        </div>
        {isOpen && (
          <h2 className="text-xl font-bold uppercase tracking-wider border border-white/20 px-3 py-1 rounded-md bg-white/10 whitespace-nowrap overflow-hidden">
            JUST
          </h2>
        )}
      </div>
      
      {isOpen ? (
        <div className="px-8 mb-4 mt-2 transition-opacity duration-300">
           <p className="text-xs text-white/70 font-bold tracking-widest uppercase">MAIN MENU</p>
        </div>
      ) : (
        <div className="mb-4 mt-2 border-b border-white/10 mx-4"></div>
      )}

      <nav className={`flex-1 space-y-1 font-medium ${isOpen ? 'px-4' : 'px-2'}`}>
        <Link href="/admin/dashboard" className={`flex items-center gap-4 py-4 rounded-r-full text-white/70 hover:text-white hover:bg-white/10 transition-all ${isOpen ? 'px-6' : 'justify-center px-0 rounded-full'}`} title="Dashboard">
          <LayoutDashboard size={20} className="flex-shrink-0" />
          {isOpen && <span className="whitespace-nowrap">Dashboard</span>}
        </Link>
        <Link href="/admin/users" className={`flex items-center gap-4 py-4 rounded-r-full bg-[#4611C8] shadow-inner text-white transition-all relative ${isOpen ? 'px-6' : 'justify-center px-0 rounded-full'}`} title="Users">
           <div className={`absolute left-0 top-0 bottom-0 bg-[#F9BC16] ${isOpen ? 'w-1 rounded-r-full' : 'w-full h-full rounded-full opacity-20'}`}></div>
          <Users size={20} className="flex-shrink-0 relative z-10" />
          {isOpen && <span className="whitespace-nowrap relative z-10">Users</span>}
        </Link>
        <Link href="/admin/brands" className={`flex items-center gap-4 py-4 rounded-r-full text-white/70 hover:text-white hover:bg-white/10 transition-all ${isOpen ? 'px-6' : 'justify-center px-0 rounded-full'}`} title="Brands">
          <Tag size={20} className="flex-shrink-0" />
          {isOpen && <span className="whitespace-nowrap">Brands</span>}
        </Link>
        <Link href="/admin/products" className={`flex items-center gap-4 py-4 rounded-r-full text-white/70 hover:text-white hover:bg-white/10 transition-all ${isOpen ? 'px-6' : 'justify-center px-0 rounded-full'}`} title="Products">
          <Package size={20} className="flex-shrink-0" />
          {isOpen && <span className="whitespace-nowrap">Products</span>}
        </Link>
        <Link href="#" className={`flex items-center gap-4 py-4 rounded-r-full text-white/70 hover:text-white hover:bg-white/10 transition-all ${isOpen ? 'px-6' : 'justify-center px-0 rounded-full'}`} title="Settings">
          <Settings size={20} className="flex-shrink-0" />
          {isOpen && <span className="whitespace-nowrap">Settings</span>}
        </Link>
      </nav>

      {isOpen && (
        <div className="p-6 transition-opacity duration-300">
           <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 relative overflow-hidden">
               <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full blur-2xl -mr-10 -mt-10"></div>
               <h4 className="font-bold text-sm mb-2 uppercase">PRO UPGRADE</h4>
               <p className="text-xs text-white/60 mb-4 leading-relaxed">
                  Get access to advanced analytics and priority support.
               </p>
               <button className="bg-[#F9D017] hover:bg-[#FFE047] text-gray-900 font-bold px-6 py-2 rounded-full text-sm transition-colors shadow-lg shadow-[#F9D017]/30 whitespace-nowrap">
                  UPGRADE
               </button>
           </div>
           <p className="text-[10px] text-white/40 mt-6 text-center uppercase tracking-widest">EveryJust Admin</p>
        </div>
      )}
    </aside>
  );
}
