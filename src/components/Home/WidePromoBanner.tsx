import React from 'react';

export default function WidePromoBanner() {
  return (
    <div className="w-full relative rounded-sm overflow-hidden min-h-[250px] shadow-sm mb-12 flex items-center">
      <div 
        className="absolute inset-0 bg-cover bg-center bg-gray-900" 
        style={{ backgroundImage: "url('/main_hero_banner.png')" }} 
      />
      <div className="absolute inset-0 bg-black/50" />
      
      <div className="relative z-10 px-8 lg:px-16 py-12 flex flex-col items-start justify-center text-left">
        <div className="bg-primary text-white text-xs font-bold px-3 py-1.5 mb-6 rounded-sm uppercase tracking-wider">
          DISCOUNT UP TO 40 % OFF
        </div>
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-white uppercase leading-tight tracking-tight max-w-xl">
          CAR REAR BACK PILLAR LED <br/>BRAKE LIGHT
        </h2>
      </div>
    </div>
  );
}
