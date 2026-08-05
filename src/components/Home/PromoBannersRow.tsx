import React from 'react';

export default function PromoBannersRow() {
  const banners = [
    {
      id: 1,
      title: 'DISC BRAKE',
      subtitle: 'FOR ANY VEHICLE',
      price: 'From $240',
      bgColor: 'bg-white', // using white/light gray as base
      textColor: 'text-gray-900',
      isPrimaryBg: false,
      image: '/promo_bottom_banner.png',
    },
    {
      id: 2,
      title: 'REAR SHOCK',
      subtitle: 'TEMPLEHORSE 280MM',
      price: 'From $150',
      bgColor: 'bg-primary',
      textColor: 'text-white',
      isPrimaryBg: true,
      image: '/promo_top_banner.png', // reusing existing
    },
    {
      id: 3,
      title: 'BLUE WHEEL',
      subtitle: 'XP/RANGER XP 900',
      price: 'From $199',
      bgColor: 'bg-white', // using white/light gray
      textColor: 'text-gray-900',
      isPrimaryBg: false,
      image: '/promo_top_banner.png', // reusing existing
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-10 mt-10">
      {banners.map((banner) => (
        <div 
          key={banner.id} 
          className={`relative rounded-sm overflow-hidden flex flex-col justify-center p-8 min-h-[220px] shadow-sm group ${banner.bgColor}`}
        >
          {/* Background Image (right-aligned, half opacity/contain or similar if we had specific cutouts. For now just use absolute positioning) */}
          <div 
            className="absolute right-0 top-0 bottom-0 w-1/2 bg-contain bg-right bg-no-repeat transition-transform duration-500 group-hover:scale-105" 
            style={{ backgroundImage: `url('${banner.image}')`, mixBlendMode: banner.isPrimaryBg ? 'luminosity' : 'normal' }} 
          />
          
          <div className="relative z-10 w-2/3">
            <span className={`text-sm font-semibold mb-2 block ${banner.isPrimaryBg ? 'text-white/90' : 'text-primary'}`}>
              {banner.price}
            </span>
            <h3 className={`text-3xl font-black mb-2 tracking-tight ${banner.textColor}`}>
              {banner.title}
            </h3>
            <p className={`text-xs font-semibold mb-6 uppercase tracking-wider ${banner.isPrimaryBg ? 'text-white/90' : 'text-gray-600'}`}>
              {banner.subtitle}
            </p>
            <a 
              href="#" 
              className={`inline-block border-b-2 pb-1 text-sm font-semibold transition-colors ${
                banner.isPrimaryBg 
                  ? 'border-white text-white hover:border-transparent' 
                  : 'border-primary text-primary hover:text-gray-900 hover:border-gray-900'
              }`}
            >
              SHOP NOW
            </a>
          </div>
        </div>
      ))}
    </div>
  );
}
