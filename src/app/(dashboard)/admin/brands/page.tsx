"use client";
import React from 'react';
import { Tag } from 'lucide-react';

export default function BrandsPage() {
  return (
    <div className="flex flex-col items-center justify-center h-[70vh]">
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 flex flex-col items-center max-w-md text-center">
        <div className="w-16 h-16 bg-[#F9BC16]/10 rounded-full flex items-center justify-center mb-6">
          <Tag size={32} className="text-[#F9BC16]" />
        </div>
        <h1 className="text-2xl font-black text-gray-800 tracking-tight mb-2">Brands Coming Soon</h1>
        <p className="text-gray-500 font-medium mb-8">
          The Brand Management module is currently under development. Soon, you will be able to organize your products by their respective manufacturers and brands.
        </p>
        <span className="px-6 py-2 bg-[#F0F2F5] text-gray-500 font-bold rounded-full text-sm">
          Under Construction
        </span>
      </div>
    </div>
  );
}
