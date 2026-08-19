import React from 'react';

const HORIZONTAL_CATEGORIES = [
  { id: 1, title: 'For You', bgClass: 'bg-gradient-to-br from-pink-400 to-pink-500', isSelected: true, icon: '🛍️' },
  { id: 2, title: 'Recently Viewed', bgClass: 'bg-purple-200 text-purple-800', isSelected: false, icon: '⏱️' },
  { id: 3, title: 'Soft Furnishings', bgClass: 'bg-gray-200', isSelected: false, icon: '🛏️' },
  { id: 4, title: 'Viral', bgClass: 'bg-indigo-100', isSelected: false, icon: '✨' },
  { id: 5, title: 'Home Improvement', bgClass: 'bg-green-100', isSelected: false, icon: '🛠️' },
];

export default function SquareCategoriesList() {
  return (
    <div className="flex overflow-x-auto gap-4 py-6 scrollbar-hide snap-x mx-4">
      {HORIZONTAL_CATEGORIES.map((cat) => (
        <div key={cat.id} className="snap-start flex flex-col items-center gap-2 min-w-[80px]">
          <div className={`relative w-20 h-24 rounded-2xl flex flex-col items-center justify-center p-2 shadow-sm border-2 ${cat.isSelected ? 'border-pink-500 shadow-pink-200 shadow-md' : 'border-transparent'} bg-white`}>
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-2xl mb-1 ${cat.bgClass}`}>
              {cat.icon}
            </div>
            <span className={`text-[10px] font-bold text-center leading-tight ${cat.isSelected ? 'text-pink-600' : 'text-gray-600'}`}>
              {cat.title}
            </span>
            
            {cat.isSelected && (
              <div className="absolute -bottom-2 bg-pink-600 text-white w-5 h-5 rounded-full flex items-center justify-center border-2 border-white">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
