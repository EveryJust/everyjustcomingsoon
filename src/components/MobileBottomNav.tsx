'use client';
import Link from 'next/link';
import React from 'react';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';

const MobileBottomNav = () => {
  const pathname = usePathname();
  const { user } = useAuthStore();
  const [mounted, setMounted] = React.useState(false);
  const isProductPage = pathname?.startsWith('/product/');
  const isOrdersPage = pathname === '/orders' || pathname?.startsWith('/orders/');

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (isProductPage) return null;

  return (
    <nav className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 z-[100] lg:hidden flex justify-between items-center px-1 py-2 pb-safe shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
      <Link href="/" className={`flex flex-col items-center justify-center w-full transition-colors ${pathname === '/' ? 'text-primary' : 'text-gray-500 hover:text-primary'}`}>
        {pathname === '/' ? (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mb-1" viewBox="0 0 20 20" fill="currentColor">
            <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
        )}
        <span className="text-[9px] font-bold tracking-wide uppercase">Home</span>
      </Link>
      
      <Link href="/categories" className={`flex flex-col items-center justify-center w-full transition-colors ${pathname === '/categories' ? 'text-primary' : 'text-gray-500 hover:text-primary'}`}>
        {pathname === '/categories' ? (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mb-1" viewBox="0 0 20 20" fill="currentColor">
            <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
          </svg>
        )}
        <span className="text-[9px] font-bold tracking-wide uppercase">Categories</span>
      </Link>
      
      <Link href="/play" className={`flex flex-col items-center justify-center w-full transition-colors relative -top-3 ${pathname === '/play' ? 'text-primary' : 'text-gray-500 hover:text-primary'}`}>
        <div className={`p-3 rounded-full mb-1 border-4 border-white transition-colors ${pathname === '/play' ? 'bg-primary shadow-lg shadow-primary/30' : 'bg-gray-100 shadow-md'}`}>
          <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 transition-colors ${pathname === '/play' ? 'text-white' : 'text-gray-700'}`} viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
          </svg>
        </div>
        <span className={`text-[9px] font-black tracking-wide uppercase ${pathname === '/play' ? 'text-primary' : 'text-gray-500'}`}>Play</span>
      </Link>
      
      <Link href="/orders" className={`flex flex-col items-center justify-center w-full transition-colors ${isOrdersPage ? 'text-primary' : 'text-gray-500 hover:text-primary'}`}>
        {isOrdersPage ? (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mb-1" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12.378 1.602a.75.75 0 00-.756 0L3.366 6.183a.75.75 0 00-.366.648v10.338a.75.75 0 00.366.648l8.256 4.581a.75.75 0 00.756 0l8.256-4.581a.75.75 0 00.366-.648V6.831a.75.75 0 00-.366-.648L12.378 1.602zM12 3.102l6.83 3.791-2.937 1.632-6.83-3.791L12 3.102zm-7.5 4.887l6.75 3.75v8.156l-6.75-3.746V7.989zm8.25 11.906v-8.156l6.75-3.75v8.16l-6.75 3.746z" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
        )}
        <span className="text-[9px] font-bold tracking-wide uppercase whitespace-nowrap">My Orders</span>
      </Link>
      
      <Link href="/account" className={`flex flex-col items-center justify-center w-full transition-colors ${pathname === '/account' ? 'text-primary' : 'text-gray-500 hover:text-primary'}`}>
        {mounted && user?.user_metadata?.avatar_url ? (
          <div className={`w-6 h-6 mb-1 rounded-full overflow-hidden border ${pathname === '/account' ? 'border-primary ring-1 ring-primary' : 'border-gray-200'}`}>
            <img src={user.user_metadata.avatar_url} alt="Account" className="w-full h-full object-cover" />
          </div>
        ) : pathname === '/account' ? (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mb-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        )}
        <span className="text-[9px] font-bold tracking-wide uppercase">Account</span>
      </Link>
    </nav>
  );
};

export default MobileBottomNav;
