import Link from 'next/link';
import { Home, Shield, Lock, DollarSign, Settings } from 'lucide-react';

export default function AdminSidebar() {
  return (
    <aside className="w-[280px] bg-gradient-to-br from-[#6A43FB] to-[#5926EC] text-white flex flex-col fixed h-full shadow-xl z-20 rounded-r-3xl border-r border-[#7C55FC]/30">
      <div className="p-8 flex items-center gap-3">
        <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center shadow-inner">
           <span className="text-white text-xl font-bold">L</span>
        </div>
        <h2 className="text-xl font-bold uppercase tracking-wider border border-white/20 px-3 py-1 rounded-md bg-white/10">
          LOGO
        </h2>
      </div>
      
      <div className="px-8 mb-4 mt-2">
         <p className="text-xs text-white/70 font-bold tracking-widest uppercase">LOREM</p>
      </div>

      <nav className="flex-1 px-4 space-y-1 font-medium">
        <Link href="/admin/dashboard" className="flex items-center gap-4 px-6 py-4 rounded-r-full text-white/70 hover:text-white hover:bg-white/10 transition-all">
          <Home size={20} />
          <span>Ipsum dolor</span>
        </Link>
        <Link href="/admin/users" className="flex items-center gap-4 px-6 py-4 rounded-r-full bg-[#4611C8] shadow-inner text-white transition-all relative">
           <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#F9BC16] rounded-r-full"></div>
          <Shield size={20} />
          <span>Sit amet</span>
        </Link>
        <Link href="/admin/brands" className="flex items-center gap-4 px-6 py-4 rounded-r-full text-white/70 hover:text-white hover:bg-white/10 transition-all">
          <Lock size={20} />
          <span>Lorem ipsum</span>
        </Link>
        <Link href="/admin/products" className="flex items-center gap-4 px-6 py-4 rounded-r-full text-white/70 hover:text-white hover:bg-white/10 transition-all">
          <DollarSign size={20} />
          <span>Dolor sit</span>
        </Link>
        <Link href="#" className="flex items-center gap-4 px-6 py-4 rounded-r-full text-white/70 hover:text-white hover:bg-white/10 transition-all">
          <Settings size={20} />
          <span>Amet lorem</span>
        </Link>
      </nav>

      <div className="p-6">
         <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 relative overflow-hidden">
             <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full blur-2xl -mr-10 -mt-10"></div>
             <h4 className="font-bold text-sm mb-2 uppercase">LOREM IPSUM</h4>
             <p className="text-xs text-white/60 mb-4 leading-relaxed">
                Dolor sit amet, consectetur adipiscing elit, sed diam.
             </p>
             <button className="bg-[#F9D017] hover:bg-[#FFE047] text-gray-900 font-bold px-6 py-2 rounded-full text-sm transition-colors shadow-lg shadow-[#F9D017]/30">
                LOREM
             </button>
         </div>
         <p className="text-[10px] text-white/40 mt-6 text-center uppercase tracking-widest">Lorem ipsum dolor</p>
      </div>
    </aside>
  );
}
