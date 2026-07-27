import React from 'react';

export default function Newsletter() {
  return (
    <div className="w-full bg-primary py-12 px-6">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
        
        {/* Left: Icon and Text */}
        <div className="flex items-center gap-6">
          <div className="text-white">
             <svg className="w-14 h-14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
             </svg>
          </div>
          <div>
            <h3 className="text-white text-2xl lg:text-3xl font-bold mb-1">
              Join Our Newsletter For $10 Off
            </h3>
            <p className="text-white/90 text-sm font-medium">
              Subscribe to our latest newsletter get news about upcoming sales
            </p>
          </div>
        </div>

        {/* Right: Input and Button */}
        <div className="w-full md:w-auto flex-1 max-w-lg flex items-center">
          <input 
            type="email" 
            placeholder="Email" 
            className="w-full h-12 px-4 rounded-l-sm outline-none text-gray-900 border-none bg-white"
          />
          <button className="h-12 px-8 bg-gray-100 hover:bg-gray-200 text-gray-900 font-bold text-sm tracking-wider rounded-r-sm transition-colors border-l border-gray-200">
            SUBSCRIBE
          </button>
        </div>

      </div>
    </div>
  );
}
