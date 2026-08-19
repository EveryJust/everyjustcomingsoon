'use client';
import React, { useState } from 'react';

interface LocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPincode: string;
  onSetLocation: (pincode: string, address: string) => void;
}

export default function LocationModal({ isOpen, onClose, currentPincode, onSetLocation }: LocationModalProps) {
  const [pincodeInput, setPincodeInput] = useState('');

  // if (!isOpen) return null; // Removed early return for transition

  const handleApplyPincode = () => {
    if (pincodeInput.length >= 6) {
      onSetLocation(pincodeInput, `Location for ${pincodeInput}`);
      onClose();
    }
  };

  const savedAddresses = [
    { id: 1, name: 'Home', address: '123 Main St, Apartment 4B', pincode: '679327' },
    { id: 2, name: 'Work', address: 'Tech Park, Building C, 5th Floor', pincode: '560001' },
  ];

  return (
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-black/50 z-[1000] backdrop-blur-sm transition-opacity duration-300 ${isOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`}
        onClick={onClose}
      />
      
      {/* Modal / Bottom Sheet */}
      <div className={`fixed bottom-0 left-0 w-full bg-gray-50 rounded-t-2xl z-[1010] shadow-2xl flex flex-col max-h-[85vh] transform transition-all duration-300 ease-in-out ${isOpen ? 'translate-y-0 opacity-100 visible' : 'translate-y-full opacity-0 invisible'}`}>
        {/* Header */}
        <div className="bg-white p-4 rounded-t-2xl flex items-center justify-between border-b border-gray-200">
          <div>
            <h3 className="font-bold text-gray-900 text-lg">Choose your location</h3>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-800 bg-gray-100 rounded-full">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        
        <div className="p-4 overflow-y-auto pb-safe">
          <p className="text-xs text-gray-500 mb-4">
            Select a delivery location to see product availability and delivery options
          </p>

          {/* Saved Addresses */}
          <div className="space-y-3 mb-6">
            {savedAddresses.map((addr) => (
              <div 
                key={addr.id} 
                onClick={() => {
                  onSetLocation(addr.pincode, addr.name);
                  onClose();
                }}
                className={`bg-white border rounded-lg p-4 flex gap-3 cursor-pointer hover:border-primary transition-colors ${currentPincode === addr.pincode ? 'border-primary ring-1 ring-primary' : 'border-gray-200'}`}
              >
                <div className="mt-0.5 text-primary">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 text-sm">{addr.name} - {addr.pincode}</h4>
                  <p className="text-xs text-gray-500 mt-1">{addr.address}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-4 mb-6">
            <div className="h-px bg-gray-300 flex-1" />
            <span className="text-xs font-semibold text-gray-400 uppercase">Or</span>
            <div className="h-px bg-gray-300 flex-1" />
          </div>

          {/* Enter Pincode */}
          <div>
            <label className="block text-sm font-bold text-gray-800 mb-2">Enter a pincode</label>
            <div className="flex gap-2">
              <input 
                type="text" 
                maxLength={6}
                value={pincodeInput}
                onChange={(e) => setPincodeInput(e.target.value.replace(/\D/g, ''))}
                placeholder="e.g. 679327" 
                className="flex-1 bg-white border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              />
              <button 
                onClick={handleApplyPincode}
                disabled={pincodeInput.length < 6}
                className="bg-primary text-white font-bold px-6 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-opacity cursor-pointer"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
