'use client';

import React from 'react';
import { usePathname } from 'next/navigation';

export default function Footer() {
  const pathname = usePathname();

  if (pathname === '/' || pathname === '/categories' || pathname === '/play' || pathname === '/reels' || pathname?.startsWith('/product/')) {
    return null;
  }

  const isWishlist = pathname === '/wishlist';

  return (
    <footer className={`w-full bg-white pt-16 border-t border-gray-200 ${isWishlist ? 'hidden md:block' : ''}`}>
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
        
        {/* About Our Store */}
        <div className="lg:col-span-1">
          <h4 className="text-gray-900 font-bold text-lg mb-6">About Our Store</h4>
          <p className="text-gray-500 text-sm leading-relaxed mb-6">
            Welcome to our store, where we pride ourselves on providing exceptional products and unparalleled customer service our store is a haven for those who appreciate quality, style, and innovation.
          </p>
          <div className="flex gap-2">
            {/* Fake App Store Badges using CSS/Divs since we don't have images */}
            <button className="bg-gray-900 text-white rounded-md px-3 py-1.5 flex items-center gap-2 hover:bg-gray-800 transition-colors">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.04 2.26-.8 3.59-.8 1.58.05 2.81.71 3.53 1.78-3.26 1.83-2.6 6.13.56 7.42-.71 1.74-1.63 3.03-2.76 3.77zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/></svg>
              <div className="text-left">
                <div className="text-[8px] uppercase leading-none opacity-80">Download on the</div>
                <div className="text-sm font-semibold leading-none">App Store</div>
              </div>
            </button>
            <button className="bg-gray-900 text-white rounded-md px-3 py-1.5 flex items-center gap-2 hover:bg-gray-800 transition-colors">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M3.609 1.814L13.792 12 3.61 22.186c-.165-.154-.265-.36-.265-.589V2.404c0-.23.1-.435.264-.59z"/><path d="M14.652 12.86l4.242 4.242-12.784 7.025 8.542-11.267z"/><path d="M15.422 12.09L21.378 6.13c.47-.47.47-1.233 0-1.703L15.422 12.09z"/><path d="M14.652 11.32L6.11.053 18.894 7.078l-4.242 4.242z"/></svg>
              <div className="text-left">
                <div className="text-[8px] uppercase leading-none opacity-80">GET IT ON</div>
                <div className="text-sm font-semibold leading-none">Google Play</div>
              </div>
            </button>
          </div>
        </div>

        {/* Your Account */}
        <div>
          <h4 className="text-gray-900 font-bold text-lg mb-6">Your Account</h4>
          <ul className="flex flex-col gap-3">
            {['Search', 'About Us', 'Delivery Information', 'Contact', 'FAQs', 'Shipping'].map((link) => (
              <li key={link}>
                <a href="#" className="text-gray-500 text-sm hover:text-primary transition-colors">{link}</a>
              </li>
            ))}
          </ul>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="text-gray-900 font-bold text-lg mb-6">Quick Links</h4>
          <ul className="flex flex-col gap-3">
            {['Privacy Policy', 'Refund Policy', 'Shipping Policy', 'Terms of Service', 'Policy for Buyers', 'Policy for Sellers'].map((link) => (
              <li key={link}>
                <a href="#" className="text-gray-500 text-sm hover:text-primary transition-colors">{link}</a>
              </li>
            ))}
          </ul>
        </div>

        {/* Footer Links */}
        <div>
          <h4 className="text-gray-900 font-bold text-lg mb-6">Footer Links</h4>
          <ul className="flex flex-col gap-3">
            {['Size Chart', 'Contact', 'About Us', 'FAQs', 'Shipping & Refund', 'Sitemap'].map((link) => (
              <li key={link}>
                <a href="#" className="text-gray-500 text-sm hover:text-primary transition-colors">{link}</a>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact Us */}
        <div>
          <h4 className="text-gray-900 font-bold text-lg mb-6">Contact Us</h4>
          <ul className="flex flex-col gap-4 text-sm text-gray-500">
            <li className="flex gap-3">
              <svg className="w-5 h-5 text-primary flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              <span>Autokart - Auto Parts Store<br/>507-Union Trade Ipsum Doler<br/>Centre France</span>
            </li>
            <li className="flex gap-3 items-center">
              <svg className="w-5 h-5 text-primary flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
              <a href="mailto:demo@example.com" className="hover:text-primary transition-colors">demo@example.com</a>
            </li>
            <li className="flex gap-3 items-center">
              <svg className="w-5 h-5 text-primary flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
              <span>(+91) 9876-543-210</span>
            </li>
          </ul>
        </div>
        
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-200 py-6">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          
          {/* Socials */}
          <div className="flex gap-3">
             <a href="#" className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-primary hover:text-white hover:border-primary transition-colors">
               <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
             </a>
             <a href="#" className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-primary hover:text-white hover:border-primary transition-colors">
               <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
             </a>
             <a href="#" className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-primary hover:text-white hover:border-primary transition-colors">
               <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/></svg>
             </a>
          </div>

          {/* Copyright */}
          <div className="text-gray-500 text-xs text-center">
            © 2026, Autokart - Auto Parts Store (Password: demo) Powered by Shopify
          </div>

          {/* Payments Mock (Just text badges) */}
          <div className="flex gap-2 text-xs font-bold text-gray-400">
            <span className="bg-blue-600 text-white px-2 py-0.5 rounded-sm">VISA</span>
            <span className="bg-orange-500 text-white px-2 py-0.5 rounded-sm">MC</span>
            <span className="bg-blue-400 text-white px-2 py-0.5 rounded-sm">AMEX</span>
          </div>

        </div>
      </div>
    </footer>
  );
}
