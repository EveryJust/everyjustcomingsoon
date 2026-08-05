'use client';
import React, { useState } from 'react';
import CartDrawer from './CartDrawer';

export default function MainHeader() {
  const [isCartOpen, setIsCartOpen] = useState(false);
  return (
    <header className="bg-white py-6 px-6 shadow-sm sticky top-0 z-40">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-8">
        {/* Logo */}
        <div className="flex-shrink-0">
          <a href="/" className="text-3xl font-extrabold tracking-tighter uppercase text-gray-900">
            every<span className="text-primary">just</span>
          </a>
        </div>

        {/* Search Bar */}
        <div className="flex-grow max-w-2xl flex border-2 border-primary rounded-md overflow-hidden">
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
        <div className="flex items-center gap-6">
          <div className="hidden lg:flex flex-col text-right">
            <span className="text-sm font-semibold text-gray-800">Need Help?</span>
            <span className="text-primary font-bold">9876-543-210</span>
          </div>
          
          <div className="flex items-center gap-4">
            <button className="p-2 text-gray-700 hover:text-primary transition-colors cursor-pointer">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
            </button>
            <button className="p-2 text-gray-700 hover:text-primary transition-colors relative cursor-pointer">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
              <span className="absolute top-0 right-0 bg-primary text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">0</span>
            </button>
            <button 
              onClick={() => setIsCartOpen(true)}
              className="p-2 text-gray-700 hover:text-primary transition-colors flex items-center gap-2 cursor-pointer"
            >
              <div className="relative">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
                <span className="absolute -top-1 -right-1 bg-primary text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">0</span>
              </div>
              <div className="hidden sm:flex flex-col text-left leading-tight">
                <span className="text-[10px] text-gray-500">₹0.00</span>
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
