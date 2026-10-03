'use client';
import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import CartDrawer from './CartDrawer';
import { useCartStore } from '@/store/useCartStore';
import { useWishlistStore } from '@/store/useWishlistStore';
import { useAuthStore } from '@/store/useAuthStore';
import { formatCurrency } from '@/utils/currency';
import { ShoppingCart } from 'lucide-react';

export default function MainHeader() {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const pathname = usePathname();
  const isHiddenOnMobile = pathname?.startsWith('/product/') || pathname === '/categories' || pathname?.startsWith('/account');
  
  const { items, getSubtotal } = useCartStore();
  const { items: wishlistItems } = useWishlistStore();
  const { user } = useAuthStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const cartCount = items.reduce((acc, item) => acc + item.qty, 0);
  const wishlistCount = wishlistItems.length;
  const subtotal = getSubtotal();

  const userAvatar = mounted && user ? (user.user_metadata?.avatar_url || '') : '';
  const userName = mounted && user ? (user.user_metadata?.full_name || user.user_metadata?.name || (user.email ? user.email.split('@')[0] : '')) : '';

  return (
    <header className={`bg-white py-3 px-4 lg:py-6 lg:px-6 shadow-sm sticky top-0 z-40 ${isHiddenOnMobile ? 'hidden lg:block' : ''}`}>
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 lg:gap-8">
        {/* Logo */}
        <div className="flex-shrink-0">
          <Link href="/" className="text-3xl font-extrabold tracking-tighter uppercase text-gray-900">
            every<span className="text-primary">just</span>
          </Link>
        </div>

        {/* Search Bar */}
        <div className="hidden lg:flex flex-grow max-w-2xl border-2 border-primary rounded-md overflow-hidden">
          <input 
            type="text" 
            placeholder="Search..." 
            className="w-full px-4 py-2 outline-none text-gray-700"
          />
          <button className="bg-primary text-white font-bold px-8 py-2 hover:bg-primary/90 transition-colors cursor-pointer">
            SEARCH
          </button>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-3 lg:gap-6">
          <div className="hidden lg:flex flex-col text-right">
            <span className="text-sm font-semibold text-gray-800">Need Help?</span>
            <span className="text-primary font-bold">9876-543-210</span>
          </div>
          
          <div className="flex items-center gap-2 lg:gap-4">
            <Link 
              href="/account" 
              className="p-1 lg:p-1.5 text-gray-700 hover:text-primary transition-colors cursor-pointer flex items-center justify-center rounded-full hover:bg-gray-100" 
              title={mounted && user ? (userName ? `${userName}'s Account` : 'My Account') : 'My Account'}
            >
              {mounted && user && userAvatar ? (
                <div className="w-6 h-6 lg:w-7 lg:h-7 rounded-full overflow-hidden border border-gray-200 ring-1 ring-primary/40 flex-shrink-0 shadow-xs">
                  <img 
                    src={userAvatar} 
                    alt={userName || 'Account'} 
                    className="w-full h-full object-cover" 
                  />
                </div>
              ) : mounted && user ? (
                <div className="w-6 h-6 lg:w-7 lg:h-7 rounded-full bg-gradient-to-tr from-gray-800 to-gray-950 text-white font-bold text-xs flex items-center justify-center flex-shrink-0 shadow-xs uppercase">
                  {userName ? userName.charAt(0) : 'U'}
                </div>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              )}
            </Link>
            <Link href="/wishlist" className="p-1.5 lg:p-2 text-gray-700 hover:text-primary transition-colors relative cursor-pointer">
              <svg className="w-6 h-6 lg:w-6 lg:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
              {mounted && wishlistCount > 0 && <span className="absolute top-0 right-0 bg-primary text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">{wishlistCount}</span>}
            </Link>
            <button 
              onClick={() => setIsCartOpen(true)}
              aria-label="View Cart"
              className="p-1.5 lg:p-2 text-gray-700 hover:text-primary transition-colors flex items-center gap-2 cursor-pointer"
            >
              <div className="relative flex items-center justify-center">
                <ShoppingCart className="w-6 h-6 stroke-[2.2]" />
                {mounted && cartCount > 0 && (
                  <span className="absolute -top-1.5 -right-2 bg-[#d81b60] text-white text-[10px] min-w-4 h-4 px-1 rounded-full flex items-center justify-center font-bold shadow-xs">
                    {cartCount}
                  </span>
                )}
              </div>
              <div className="hidden sm:flex flex-col text-left leading-tight">
                <span className="text-[10px] text-gray-500">{mounted ? formatCurrency(subtotal) : '₹0.00'}</span>
                <span className="text-xs font-bold text-gray-800">My Cart</span>
              </div>
            </button>
          </div>
        </div>
      </div>

      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </header>
  );
}
