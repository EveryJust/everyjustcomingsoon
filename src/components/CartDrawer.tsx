'use client';
import React, { useEffect, useState } from 'react';
import { useCartStore } from '@/store/useCartStore';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const { items, updateQuantity, removeItem, getSubtotal } = useCartStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Prevent scrolling when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const total = getSubtotal();

  return (
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-black/60 z-[1000] backdrop-blur-sm transition-opacity duration-300 ${isOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`}
        onClick={onClose}
      />
      
      {/* Drawer */}
      <div 
        className={`fixed top-0 right-0 h-[100dvh] w-full sm:w-[400px] bg-white z-[1010] shadow-2xl transform transition-transform duration-300 ease-in-out flex flex-col ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-xl font-black uppercase tracking-tight text-gray-900">Your Cart</h2>
          <button 
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-800 hover:bg-gray-100 rounded-full transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {!mounted || items.length === 0 ? (
            <div className="text-center text-gray-500 mt-10">
              <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
              <p>Your cart is empty.</p>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.id} className="flex gap-4 items-center group">
                <div className="w-20 h-20 flex-shrink-0 bg-gray-50 rounded-sm relative overflow-hidden border border-gray-100">
                  <div className="absolute inset-0 bg-cover bg-center transition-transform group-hover:scale-110" style={{ backgroundImage: `url('${item.image}')` }} />
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-bold text-gray-900 line-clamp-2 hover:text-primary transition-colors cursor-pointer">{item.name}</h4>
                  <div className="text-primary font-bold mt-1">₹{item.price.toFixed(2)}</div>
                  <div className="flex items-center gap-3 mt-2">
                    <div className="flex items-center border border-gray-200 rounded-sm">
                      <button onClick={() => updateQuantity(item.id, Math.max(1, item.qty - 1))} className="px-2 py-0.5 text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors">-</button>
                      <span className="px-2 py-0.5 text-xs font-bold text-gray-700 border-x border-gray-200">{item.qty}</span>
                      <button onClick={() => updateQuantity(item.id, item.qty + 1)} className="px-2 py-0.5 text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors">+</button>
                    </div>
                    <button onClick={() => removeItem(item.id)} className="text-xs text-red-500 font-bold hover:underline">Remove</button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-100 bg-gray-50">
          <div className="flex justify-between items-center mb-6">
            <span className="text-gray-600 font-semibold">Subtotal</span>
            <span className="text-2xl font-black text-gray-900">₹{mounted ? total.toFixed(2) : '0.00'}</span>
          </div>
          <p className="text-xs text-gray-500 mb-6 text-center">Taxes and shipping calculated at checkout.</p>
          <div className="flex flex-col gap-3">
            <button className="w-full bg-primary text-white font-bold py-3.5 rounded-sm uppercase tracking-widest hover:bg-primary/90 transition-all hover:shadow-lg hover:-translate-y-0.5">
              Checkout
            </button>
            <button 
              onClick={onClose}
              className="w-full bg-white border-2 border-gray-200 text-gray-800 font-bold py-3 rounded-sm uppercase tracking-widest hover:border-gray-900 transition-colors"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
