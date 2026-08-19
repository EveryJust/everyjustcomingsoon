'use client';
import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import { CURRENCIES } from '../utils/currency';
import { LANGUAGES } from '../utils/language';
import Dropdown from './Dropdown';

export default function TopBar() {
  const [currency, setCurrency] = useState(CURRENCIES[0].code);
  const [language, setLanguage] = useState(LANGUAGES[0].code);

  const currencyOptions = CURRENCIES.map(c => ({ 
    label: (
      <span className="flex items-center gap-2">
        <img src={c.flag} alt={`${c.code} flag`} className="w-[18px] h-auto object-cover rounded-[2px]" />
        <span>{c.code} {c.symbol}</span>
      </span>
    ),  
    value: c.code 
  }));
  const languageOptions = LANGUAGES.map(l => ({ 
    label: (
      <span className="flex items-center gap-2">
        <img src={l.flag} alt={`${l.code} flag`} className="w-[18px] h-auto object-cover rounded-[2px]" />
        <span>{l.name}</span>
      </span>
    ),  
    value: l.code 
  }));

  const pathname = usePathname();
  const isHiddenOnMobile = pathname?.startsWith('/product/') || pathname === '/categories';

  return (
    <div className={`bg-gray-100 border-b border-gray-200 text-xs py-2 px-2 lg:px-6 ${isHiddenOnMobile ? 'hidden lg:block' : ''}`}>
      <div className="max-w-7xl mx-auto flex flex-row justify-between items-center text-gray-600 overflow-hidden w-full gap-2">
        {/* Left Side: Scrolling Text and Static Link on mobile */}
        <div className="flex-1 flex items-center overflow-hidden relative mr-2">
          <div className="flex-1 overflow-hidden mask-edges mr-1">
            <div className="animate-marquee lg:animate-none lg:w-auto lg:transform-none lg:whitespace-normal">
              <span className="pr-8 lg:pr-1">Get Upto 25% Cashback On First Order: GET25OFF -</span>
              <span className="pr-8 lg:hidden">Get Upto 25% Cashback On First Order: GET25OFF -</span>
            </div>
          </div>
          <a href="#" className="font-semibold underline hover:text-primary whitespace-nowrap flex-shrink-0 z-10">SHOP NOW</a>
        </div>
        
        {/* Right Side: Selectors */}
        <div className="flex items-center justify-end gap-2 lg:gap-4 flex-shrink-0 bg-gray-100 z-10 pl-2">
          <a href="/orders" className="hidden lg:block hover:text-primary whitespace-nowrap">Track Order</a>
          <span className="hidden lg:inline text-gray-300">|</span>
          <a href="/help" className="hidden lg:block hover:text-primary whitespace-nowrap">Help Center</a>
          <span className="hidden lg:inline text-gray-300">|</span>
          <Dropdown 
            options={currencyOptions}
            value={currency}
            onChange={setCurrency}
            variant="minimal"
          />
          <span className="text-gray-300">|</span>
          <Dropdown 
            options={languageOptions}
            value={language}
            onChange={setLanguage}
            variant="minimal"
          />
        </div>
      </div>
    </div>
  );
}
