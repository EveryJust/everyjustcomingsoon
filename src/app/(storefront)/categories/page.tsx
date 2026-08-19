'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { MAJOR_CATEGORIES } from '@/utils/category';

export default function CategoriesPage() {
  const [activeCategoryId, setActiveCategoryId] = useState(MAJOR_CATEGORIES[0]?.id);

  const activeCategory = MAJOR_CATEGORIES.find(c => c.id === activeCategoryId);

  return (
    <div className="bg-white lg:min-h-screen flex flex-col">
      {/* Mobile Top Header */}
      <div className="lg:hidden flex items-center justify-between p-4 border-b border-gray-100 bg-white sticky top-0 z-40">
        <h1 className="text-[15px] font-bold text-gray-800 tracking-wide uppercase">Categories</h1>
        <div className="flex gap-4 items-center">
          <button className="text-gray-700">
             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          </button>
          <button className="text-gray-700">
             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
          </button>
          <button className="text-gray-700 relative">
             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
             <span className="absolute -top-1.5 -right-1.5 bg-primary text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-bold">2</span>
          </button>
        </div>
      </div>

      <div className="flex items-start flex-1">
      
      {/* Sidebar */}
      <div className="w-[85px] lg:w-72 flex-shrink-0 bg-[#f9f9f9] flex flex-col border-r border-gray-100 sticky top-[72px] lg:top-[125px] h-[calc(100vh-72px)] lg:h-[calc(100vh-125px)] overflow-y-auto scrollbar-hide">
        {MAJOR_CATEGORIES.map((category) => {
          const isActive = category.id === activeCategoryId;
          return (
            <button
              key={category.id}
              onClick={() => setActiveCategoryId(category.id)}
              className={`flex flex-col lg:flex-row items-center lg:items-start justify-center lg:justify-start py-4 lg:py-5 lg:px-6 gap-2 lg:gap-4 relative text-center lg:text-left transition-colors border-b border-gray-100/50 ${isActive ? 'bg-white' : 'hover:bg-gray-100'}`}
            >
              {/* Active Indicator */}
              {isActive && (
                <div className="absolute left-0 top-0 bottom-0 w-1 lg:w-1.5 bg-primary rounded-r-md"></div>
              )}
              
              <div className="w-[45px] h-[45px] lg:w-12 lg:h-12 rounded-full bg-white lg:bg-transparent overflow-hidden flex-shrink-0 flex items-center justify-center p-1 border border-gray-200 lg:border-none shadow-sm lg:shadow-none">
                 <img src={'/dash_camera.png'} alt={category.name} className="w-full h-full object-contain opacity-80" />
              </div>
              
              <span className={`text-[10px] lg:text-sm leading-tight px-1 lg:px-0 lg:mt-1 ${isActive ? 'text-primary font-semibold' : 'text-gray-600 font-medium'}`}>
                {category.name}
              </span>
            </button>
          )
        })}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 bg-white overflow-y-auto p-4 lg:p-10 pb-32 lg:pb-24 min-h-[calc(100vh-72px)]">
        {activeCategory && (
          <div className="animate-in fade-in duration-300">
            
            {/* Featured Section */}
            <div className="mb-10 lg:mb-14">
              <h3 className="text-[11px] lg:text-sm font-semibold text-gray-400 mb-1 lg:mb-2 uppercase tracking-wide">Popular</h3>
              <h2 className="text-lg lg:text-2xl font-bold text-gray-900 mb-5 lg:mb-8">Featured On {activeCategory.name}</h2>
              
              <div className="grid grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-y-6 gap-x-2 lg:gap-8">
                {[1, 2, 3].map((item, idx) => (
                  <Link href={`/category/${activeCategory.slug}`} key={idx} className="flex flex-col items-center group cursor-pointer relative">
                    <div className="w-[72px] h-[72px] lg:w-36 lg:h-36 rounded-full bg-white overflow-hidden mb-2 group-hover:shadow-md transition-all flex items-center justify-center border border-gray-200 p-2 lg:p-4">
                       <img src={`/dash_camera.png`} alt={`Featured ${item}`} className="w-full h-full object-contain hover:scale-105 transition-transform" />
                    </div>
                    {idx === 0 && (
                       <span className="absolute top-[60px] lg:top-[125px] bg-blue-600 text-white text-[9px] lg:text-xs font-bold px-1.5 lg:px-3 py-0.5 rounded-full flex items-center gap-1 shadow-sm border border-white">
                         <svg className="w-2.5 h-2.5" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg> Mall
                       </span>
                    )}
                    <span className="text-[11px] lg:text-[15px] text-center font-medium text-gray-800 leading-tight group-hover:text-primary transition-colors mt-2">
                      Top Brand {item}
                    </span>
                  </Link>
                ))}
              </div>
            </div>

            {/* All Popular / Subcategories Section */}
            <div>
              <h2 className="text-lg lg:text-2xl font-bold text-gray-900 mb-5 lg:mb-8">All Popular</h2>
              
              <div className="grid grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-y-8 gap-x-2 lg:gap-8">
                {activeCategory.subcategories?.map((sub, idx) => (
                  <Link href={`/category/${activeCategory.slug}?sub=${sub.toLowerCase().replace(/\s+/g, '-')}`} key={idx} className="flex flex-col items-center group cursor-pointer">
                    <div className="w-[72px] h-[72px] lg:w-36 lg:h-36 rounded-full bg-white overflow-hidden mb-2 group-hover:shadow-md transition-all flex items-center justify-center border border-gray-100 p-1 lg:p-2">
                       <img src={`/turbo_charger.png`} alt={sub} className="w-full h-full object-cover rounded-full hover:scale-105 transition-transform" />
                    </div>
                    <span className="text-[11px] lg:text-[15px] text-center font-medium text-gray-800 leading-tight group-hover:text-primary transition-colors mt-1 max-w-[80%] lg:max-w-full">
                      {sub}
                    </span>
                  </Link>
                ))}
                
                {(!activeCategory.subcategories || activeCategory.subcategories.length === 0) && (
                  <div className="col-span-full text-center py-12 text-gray-500 text-sm">
                    No subcategories found.
                  </div>
                )}
              </div>
            </div>
            
          </div>
        )}
      </div>
      </div>
      
    </div>
  );
}
