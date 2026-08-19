'use client';
import React, { useState } from 'react';
import LocationModal from './LocationModal';

import MobileLocationStrip from './MobileLocationStrip';
import SquareCategoriesList from './Home/SquareCategoriesList';
import RoundCategoriesList from './Home/RoundCategoriesList';

export default function MobileHero() {
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [deliveryPincode, setDeliveryPincode] = useState('679327');
  const [deliveryLocation, setDeliveryLocation] = useState('Nilambur');

  return (
    <div className="lg:hidden mb-8 w-full overflow-hidden">
      {/* Search Bar */}
      <div className="px-4 py-3">
        <div className="flex items-center bg-white border border-gray-300 rounded-lg overflow-hidden shadow-sm">
          <div className="pl-3 text-gray-400">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          </div>
          <input 
            type="text" 
            placeholder="Search by Keyword or Product ID" 
            className="flex-1 px-3 py-2.5 outline-none text-sm text-gray-700 bg-transparent"
          />
          <div className="flex items-center gap-2 pr-3 text-gray-400">
            <button><svg className="w-5 h-5 hover:text-primary transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg></button>
            <button><svg className="w-5 h-5 hover:text-primary transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg></button>
          </div>
        </div>
      </div>

      {/* Location Strip */}
      <MobileLocationStrip 
        location={deliveryLocation}
        pincode={deliveryPincode}
        onClick={() => setIsLocationModalOpen(true)}
      />

      {/* Background Gradient for Horizontal Areas */}
      <div className="bg-gradient-to-b from-white to-pink-50/50 pb-4">
        
        {/* Square Categories (Horizontal Scroll) */}
        <SquareCategoriesList />

        {/* Round Categories (Horizontal Scroll) */}
        <RoundCategoriesList />
      </div>

      <LocationModal 
        isOpen={isLocationModalOpen} 
        onClose={() => setIsLocationModalOpen(false)} 
        currentPincode={deliveryPincode}
        onSetLocation={(pincode, location) => {
          setDeliveryPincode(pincode);
          setDeliveryLocation(location);
        }}
      />
    </div>
  );
}
