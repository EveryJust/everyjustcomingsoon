import React from 'react';

interface MobileLocationStripProps {
  location: string;
  pincode: string;
  onClick: () => void;
}

export default function MobileLocationStrip({ location, pincode, onClick }: MobileLocationStripProps) {
  return (
    <div 
      onClick={onClick}
      className="px-4 py-2 bg-gray-50 flex items-center gap-2 text-sm text-gray-700 font-bold cursor-pointer"
    >
      <div className="text-blue-500">
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
        </svg>
      </div>
      <span>Delivering to {location} - {pincode}</span>
      <svg className="w-4 h-4 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
      </svg>
    </div>
  );
}
