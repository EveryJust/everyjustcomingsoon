import React from 'react';

export default function TopBar() {
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
          <select className="bg-transparent outline-none cursor-pointer hover:text-primary">
            <option>USD $</option>
            <option>EUR €</option>
          </select>
          <span className="text-gray-300">|</span>
          <select className="bg-transparent outline-none cursor-pointer hover:text-primary">
            <option>English</option>
            <option>Spanish</option>
          </select>
        </div>
      </div>
    </div>
  );
}
