import React from 'react';

export default function SalesChart() {
  return (
    <div className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] h-64 relative flex flex-col justify-end">
        <div className="flex justify-between items-center mb-4 absolute top-6 left-6 right-6">
            <div>
               <h3 className="font-bold text-gray-800 text-lg">Sales Overview</h3>
               <p className="text-xs text-gray-400">Monthly revenue</p>
            </div>
            <div className="flex gap-4 items-center">
                <div className="flex items-center gap-2 text-xs font-bold text-gray-500">
                    <span className="w-3 h-3 rounded-full bg-[#6A43FB]"></span>
                    Income
                </div>
                <div className="flex items-center gap-2 text-xs font-bold text-gray-500">
                    <span className="w-3 h-3 rounded-full bg-[#3ED08C]"></span>
                    Expenses
                </div>
            </div>
        </div>
        
        {/* Grid overlay */}
        <div className="absolute inset-0 grid grid-cols-5 p-6 pb-10 pt-20 opacity-10 pointer-events-none">
           <div className="border-r border-gray-800"></div><div className="border-r border-gray-800"></div><div className="border-r border-gray-800"></div><div className="border-r border-gray-800"></div><div></div>
        </div>

        {/* SVG Area (Income) */}
        <svg className="absolute bottom-10 left-0 w-full h-32" preserveAspectRatio="none" viewBox="0 0 100 100">
           <path d="M0,100 L0,50 Q10,30 20,40 T40,30 T60,60 T80,20 T100,50 L100,100 Z" fill="url(#purpleGrad)" />
           <path d="M0,50 Q10,30 20,40 T40,30 T60,60 T80,20 T100,50" fill="none" stroke="#6A43FB" strokeWidth="3" />
           <defs>
               <linearGradient id="purpleGrad" x1="0" x2="0" y1="0" y2="1">
                   <stop offset="0%" stopColor="#6A43FB" stopOpacity="0.4" />
                   <stop offset="100%" stopColor="#6A43FB" stopOpacity="0" />
               </linearGradient>
           </defs>
        </svg>

        <div className="w-full flex justify-between text-[10px] font-bold text-gray-400 px-2 mt-4 z-10">
          <span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span><span>May</span><span>Jun</span>
       </div>
    </div>
  );
}
