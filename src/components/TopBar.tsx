'use client';
import React, { useState } from 'react';
import { CURRENCIES } from '../utils/currency';
import { LANGUAGES } from '../utils/language';
import Dropdown from './Dropdown';

export default function TopBar() {
  const [currency, setCurrency] = useState(CURRENCIES[0].code);
  const [language, setLanguage] = useState(LANGUAGES[0].code);

  const currencyOptions = CURRENCIES.map(c => ({ label: `${c.code} ${c.symbol}`, value: c.code }));
  const languageOptions = LANGUAGES.map(l => ({ label: l.name, value: l.code }));

  return (
    <div className="bg-gray-100 border-b border-gray-200 text-xs py-2 px-6">
      <div className="max-w-7xl mx-auto flex justify-between items-center text-gray-600">
        <div>
          Get Upto 25% Cashback On First Order: GET25OFF - <a href="#" className="font-semibold underline hover:text-primary">SHOP NOW</a>
        </div>
        <div className="flex items-center gap-4">
          <a href="#" className="hover:text-primary">Track Order</a>
          <span className="text-gray-300">|</span>
          <a href="#" className="hover:text-primary">Help Center</a>
          <span className="text-gray-300">|</span>
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
