import React from 'react';

export default function Navbar() {
  return (
    <nav className="bg-primary text-white shadow-md">
      <div className="max-w-7xl mx-auto flex items-center">
        {/* Categories Dropdown */}
        <div className="relative group cursor-pointer bg-white text-gray-800 flex items-center gap-2 px-6 py-4 font-bold w-64 border-r border-gray-200">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
          SHOP BY CATEGORIES
          <svg className="w-4 h-4 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
        </div>

        {/* Main Links */}
        <div className="flex items-center gap-8 px-8 font-semibold flex-grow">
          <a href="#" className="hover:text-white/80 transition-colors">Home</a>
          <a href="#" className="hover:text-white/80 transition-colors flex items-center gap-1">Shop <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg></a>
          <a href="#" className="hover:text-white/80 transition-colors">Collections</a>
          <a href="#" className="hover:text-white/80 transition-colors flex items-center gap-1">Headlights <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg></a>
          <a href="#" className="hover:text-white/80 transition-colors">Contact</a>
          <a href="#" className="hover:text-white/80 transition-colors">Blog</a>
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
