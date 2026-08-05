import React from 'react';
import { MAJOR_CATEGORIES } from '../utils/category';

export default function Navbar() {
  return (
    <nav className="bg-primary text-white shadow-md">
      <div className="max-w-7xl mx-auto flex items-center">
        {/* Categories Dropdown */}
        <div className="relative group cursor-pointer bg-white text-gray-800 flex items-center gap-2 px-6 py-4 font-bold w-64 border-r border-gray-200">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
          CATEGORIES
          <svg className="w-4 h-4 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
          
          {/* Dropdown Menu */}
          <div className="absolute top-full left-0 w-full bg-white shadow-lg border border-gray-100 rounded-b-sm opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
            <ul className="py-2 flex flex-col">
              {MAJOR_CATEGORIES.slice(0, 10).map(cat => (
                <li key={cat.id}>
                  <a href={`/category/${cat.slug}`} className="block px-6 py-2.5 text-sm font-semibold text-gray-600 hover:text-primary hover:bg-gray-50 transition-colors">
                    {cat.name}
                  </a>
                </li>
              ))}
              <li>
                <a href="/categories" className="block px-6 py-3 text-sm font-bold text-primary hover:bg-gray-50 transition-colors border-t border-gray-100 mt-1">
                  VIEW ALL
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Main Links */}
        <div className="flex items-center gap-8 px-8 font-semibold flex-grow">
          <a href="/" className="hover:text-white/80 transition-colors">Home</a>
          <a href="/shop" className="hover:text-white/80 transition-colors">Shop</a>
          <a href="/brands" className="hover:text-white/80 transition-colors">Brands</a>
          <a href="/categories" className="hover:text-white/80 transition-colors">Categories</a>
          <a href="/about-us" className="hover:text-white/80 transition-colors">About Us</a>
          <a href="/contact" className="hover:text-white/80 transition-colors">Contact</a>
          <a href="/blog" className="hover:text-white/80 transition-colors">Blog</a>
        </div>

        {/* Right Deal */}
        <div className="px-6 flex items-center gap-2 font-bold cursor-pointer hover:text-white/80 hidden lg:flex">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          Weekly Deal
        </div>
      </div>
    </nav>
  );
}
