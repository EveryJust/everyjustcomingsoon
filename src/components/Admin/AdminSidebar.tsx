"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, Tag, Package, Settings, Plus, HelpCircle } from 'lucide-react';

interface AdminSidebarProps {
  isOpen: boolean;
}

export default function AdminSidebar({ isOpen }: AdminSidebarProps) {
  const pathname = usePathname();

  const renderSectionHeader = (title: string, isFirst = false) => {
    if (isOpen) {
      return (
        <div className={`px-8 mb-2 ${isFirst ? 'mt-2' : 'mt-6'} transition-opacity duration-300`}>
           <p className="text-xs text-white/70 font-bold tracking-widest uppercase">{title}</p>
        </div>
      );
    }
    return <div className={`mb-2 ${isFirst ? 'mt-2' : 'mt-6'} border-b border-white/10 mx-4`}></div>;
  };

  const renderLink = (href: string, Icon: React.ElementType, label: string) => {
    let isActive = pathname === href;
    
    // Special case: Keep "Products" highlighted when editing a product (but NOT when adding, since Add has its own link)
    if (href === '/admin/products' && pathname.startsWith('/admin/products/edit/')) {
      isActive = true;
    }
    
    let className = `flex items-center gap-4 py-3 text-sm rounded-r-full text-white/70 hover:text-white hover:bg-white/10 transition-all ${isOpen ? 'px-6' : 'justify-center px-0 rounded-full'}`;
    
    if (isActive) {
      className = `flex items-center gap-4 py-3 text-sm rounded-r-full bg-[#4611C8] shadow-inner text-white transition-all relative ${isOpen ? 'px-6' : 'justify-center px-0 rounded-full'}`;
    }

    return (
      <Link href={href} className={className} title={label}>
        {isActive && (
          <div className={`absolute left-0 top-0 bottom-0 bg-[#F9BC16] ${isOpen ? 'w-1 rounded-r-full' : 'w-full h-full rounded-full opacity-20'}`}></div>
        )}
        <Icon size={20} className={`flex-shrink-0 relative z-10`} />
        {isOpen && <span className="whitespace-nowrap relative z-10">{label}</span>}
      </Link>
    );
  };

  return (
    <aside 
      className={`bg-gradient-to-br from-[#6A43FB] to-[#5926EC] text-white flex flex-col fixed h-full shadow-xl z-20 rounded-r-3xl border-r border-[#7C55FC]/30 transition-all duration-300 ease-in-out ${
        isOpen ? 'w-[280px]' : 'w-[88px]'
      }`}
    >
      <div className={`p-6 flex items-center ${isOpen ? 'gap-3' : 'justify-center pt-8'}`}>
        {isOpen ? (
          <h2 className="text-lg font-bold tracking-wider text-white">
            EveryJust Admin
          </h2>
        ) : (
          <span className="text-white font-bold text-lg bg-white/20 px-3 py-2 rounded-lg">EA</span>
        )}
      </div>
      
      <nav className={`flex-1 space-y-1 font-medium ${isOpen ? 'px-4' : 'px-2'} overflow-y-auto pb-4 custom-scrollbar`}>
        {renderSectionHeader('Overview', true)}
        {renderLink('/admin/dashboard', LayoutDashboard, 'Dashboard')}
        
        {renderSectionHeader('Product Management')}
        {renderLink('/admin/categories', Tag, 'Categories')}
        {renderLink('/admin/products', Package, 'Products')}
        {renderLink('/admin/products/add', Plus, 'Add Product')}
        
        {/* Brands Link with Coming Soon Badge */}
        <Link href="/admin/brands" className={`flex items-center gap-4 py-3 text-sm rounded-r-full text-white/70 hover:text-white hover:bg-white/10 transition-all ${isOpen ? 'px-6' : 'justify-center px-0 rounded-full'}`} title="Brands">
          <Tag size={20} className="flex-shrink-0" />
          {isOpen && (
            <div className="flex items-center justify-between w-full">
              <span>Brands</span>
              <span className="text-[9px] font-bold uppercase tracking-wider bg-[#F9BC16] text-[#1A1C29] px-2 py-0.5 rounded-full ml-2">Soon</span>
            </div>
          )}
        </Link>
        
        {renderSectionHeader('User Management')}
        {renderLink('/admin/users', Users, 'Users')}
        
        {renderSectionHeader('System')}
        {renderLink('/admin/settings', Settings, 'Settings')}
      </nav>

      <div className={`p-4 border-t border-white/10 ${isOpen ? 'px-4' : 'px-2 flex justify-center'}`}>
        <Link href="#" className={`flex items-center gap-3 py-3 text-sm font-medium rounded-xl text-white/60 hover:text-white hover:bg-white/10 transition-all ${isOpen ? 'px-4 w-full' : 'justify-center px-0 w-full'}`} title="Help & Docs">
          <HelpCircle size={20} className="flex-shrink-0" />
          {isOpen && <span className="whitespace-nowrap">Help & Docs</span>}
        </Link>
      </div>
    </aside>
  );
}
