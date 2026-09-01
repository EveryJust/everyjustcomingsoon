'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/client';

export default function CategoriesPage() {
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCategories() {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('isActive', true)
        .eq('isDeleted', false);
        
      if (error) {
        console.error(error);
        setLoading(false);
        return;
      }

      if (data) {
        // Handle both camelCase and snake_case mapping just in case
        const normalizedData = data.map(c => ({
          ...c,
          parentId: c.parentId || c.parent_id,
          imageUrl: c.imageUrl || c.image_url
        }));
        
        const mainCats = normalizedData.filter(c => !c.parentId);
        
        // Subcategories are those whose parent is a main category
        const subCats = normalizedData.filter(c => 
          c.parentId && mainCats.some(m => m.id === c.parentId)
        );
        
        // 2nd level categories are those whose parent is a subcategory
        const secondLevelCats = normalizedData.filter(c => 
          c.parentId && subCats.some(s => s.id === c.parentId)
        );

        const formatted = mainCats.map(main => {
          const directSubs = subCats.filter(sub => sub.parentId === main.id);
          const subsWithChildren = directSubs.map(sub => ({
            ...sub,
            children: secondLevelCats.filter(child => child.parentId === sub.id)
          }));
          
          return {
            ...main,
            subcategories: subsWithChildren
          };
        }).sort((a, b) => new Date(a.createdAt || a.created_at).getTime() - new Date(b.createdAt || b.created_at).getTime());

        setCategories(formatted);
        if (formatted.length > 0) {
          setActiveCategoryId(formatted[0].id);
        }
      }
      setLoading(false);
    }
    
    fetchCategories();
  }, []);

  // Intersection Observer for scroll spy
  useEffect(() => {
    if (categories.length === 0) return;

    const scrollContainer = document.getElementById('categories-scroll-container');
    if (!scrollContainer) return;
    
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = entry.target.id.replace('category-', '');
            setActiveCategoryId(id);
            
            // Scroll the sidebar so the active item is visible
            const sidebarBtn = document.getElementById(`sidebar-btn-${id}`);
            if (sidebarBtn) {
              sidebarBtn.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
          }
        });
      },
      {
        root: scrollContainer,
        rootMargin: '-5% 0px -80% 0px', // Trigger when section hits the top 5-20% of the screen
      }
    );

    // Give the DOM a moment to render before observing
    setTimeout(() => {
      categories.forEach((cat) => {
        const el = document.getElementById(`category-${cat.id}`);
        if (el) observer.observe(el);
      });
    }, 100);

    return () => observer.disconnect();
  }, [categories]);

  const activeCategory = categories.find(c => c.id === activeCategoryId);

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
      {loading ? (
        <div className="flex-1 flex justify-center items-center py-32">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
        </div>
      ) : (
        <>
        {/* Sidebar */}
        <div className="w-[85px] lg:w-72 flex-shrink-0 bg-[#f9f9f9] flex flex-col border-r border-gray-100 sticky top-[72px] lg:top-[125px] h-[calc(100dvh-136px)] lg:h-[calc(100vh-125px)] overflow-y-auto category-scrollbar">
          {categories.map((category) => {
            const isActive = category.id === activeCategoryId;
            return (
              <button
                key={category.id}
                id={`sidebar-btn-${category.id}`}
                onClick={() => {
                  setActiveCategoryId(category.id);
                  const el = document.getElementById(`category-${category.id}`);
                  if (el) {
                    el.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
                className={`flex flex-col lg:flex-row items-center lg:items-start justify-center lg:justify-start py-4 lg:py-5 lg:px-6 gap-2 lg:gap-4 relative text-center lg:text-left transition-colors border-b border-gray-100/50 ${isActive ? 'bg-white' : 'hover:bg-gray-100'}`}
              >
                {/* Active Indicator */}
                {isActive && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 lg:w-1.5 bg-primary rounded-r-md"></div>
                )}
                
                <div className="w-[45px] h-[45px] lg:w-12 lg:h-12 rounded-full bg-white lg:bg-transparent overflow-hidden flex-shrink-0 flex items-center justify-center p-1 border border-gray-200 lg:border-none shadow-sm lg:shadow-none">
                   <img src={category.imageUrl || '/dash_camera.png'} alt={category.name} className="w-full h-full object-contain opacity-80" />
                </div>
                
                <span className={`text-[10px] lg:text-sm leading-tight px-1 lg:px-0 lg:mt-1 ${isActive ? 'text-primary font-semibold' : 'text-gray-600 font-medium'}`}>
                  {category.name}
                </span>
              </button>
            )
          })}
        </div>

        {/* Main Content Area */}
        <div id="categories-scroll-container" className="flex-1 bg-white overflow-y-auto p-4 lg:p-10 pb-32 lg:pb-24 h-[calc(100dvh-136px)] lg:h-[calc(100vh-125px)] scroll-smooth category-scrollbar">
          <div className="space-y-16">
            {categories.map((cat) => (
              <div key={cat.id} id={`category-${cat.id}`} className="scroll-mt-6 lg:scroll-mt-10">
                <h2 className="text-lg lg:text-2xl font-bold text-gray-900 mb-6 lg:mb-8">All {cat.name}</h2>
                
                <div className="grid grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-y-8 gap-x-2 lg:gap-8">
                  {cat.subcategories?.flatMap((sub: any, idx: number) => {
                    const subItem = (
                      <Link href={`/category/${cat.slug}?sub=${sub.slug}`} key={sub.id || `sub-${idx}`} className="flex flex-col items-center group cursor-pointer">
                        <div className="w-[72px] h-[72px] lg:w-36 lg:h-36 rounded-full bg-white overflow-hidden mb-2 group-hover:shadow-md transition-all flex items-center justify-center border border-gray-100 p-1 lg:p-2">
                           <img src={sub.imageUrl || '/turbo_charger.png'} alt={sub.name} className="w-full h-full object-cover rounded-full hover:scale-105 transition-transform" />
                        </div>
                        <span className="text-[11px] lg:text-[15px] text-center font-medium text-gray-800 leading-tight group-hover:text-primary transition-colors mt-1 max-w-[80%] lg:max-w-full">
                          {sub.name}
                        </span>
                      </Link>
                    );
                    
                    const childrenItems = sub.children ? sub.children.map((child: any) => (
                      <Link href={`/category/${cat.slug}?sub=${sub.slug}&child=${child.slug}`} key={child.id} className="flex flex-col items-center group cursor-pointer">
                        <div className="w-[72px] h-[72px] lg:w-36 lg:h-36 rounded-full bg-white overflow-hidden mb-2 group-hover:shadow-md transition-all flex items-center justify-center border border-gray-100 p-1 lg:p-2">
                           <img src={child.imageUrl || '/turbo_charger.png'} alt={child.name} className="w-full h-full object-cover rounded-full hover:scale-105 transition-transform" />
                        </div>
                        <span className="text-[11px] lg:text-[15px] text-center font-medium text-gray-800 leading-tight group-hover:text-primary transition-colors mt-1 max-w-[80%] lg:max-w-full">
                          {child.name}
                        </span>
                      </Link>
                    )) : [];
                    
                    return [subItem, ...childrenItems];
                  })}
                  
                  {(!cat.subcategories || cat.subcategories.length === 0) && (
                    <div className="col-span-full text-center py-8 text-gray-500 text-sm">
                      No subcategories found in {cat.name}.
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
        </>
      )}
      </div>
      
    </div>
  );
}
