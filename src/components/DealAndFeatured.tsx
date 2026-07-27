import React from 'react';
import HorizontalProductCard from './HorizontalProductCard';

export default function DealAndFeatured() {
  const featuredProducts = [
    {
      id: 1,
      image: '/dash_camera.png', // Placeholder
      title: 'AUTO-VOX 9.8ft Extension Cord Dash Cam Rear',
      price: '$53.00',
      originalPrice: '$57.00',
      discount: '-7%',
      rating: 0,
      status: 'ADD TO CART' as const
    },
    {
      id: 2,
      image: '/promo_bottom_banner.png', // Placeholder
      title: 'New Upgraded 1-Piece Rear Driveshaft & Parts',
      price: '$15.00',
      rating: 0,
      status: 'ADD TO CART' as const
    },
    {
      id: 3,
      image: '/dash_camera.png', // Placeholder (Halo headlights)
      title: 'SUPAREE 7 Round LED Headlights RGB Halo Angel',
      price: '$12.00',
      rating: 0,
      status: 'OPTIONS' as const
    },
    {
      id: 4,
      image: '/promo_top_banner.png', // Placeholder (Oil)
      title: 'Pennzoil Platinum High Mileage Synthetic Motor Oil',
      price: '$72.00',
      originalPrice: '$79.00',
      discount: '-9%',
      rating: 0,
      status: 'ADD TO CART' as const
    },
    {
      id: 5,
      image: '/turbo_charger.png', // Placeholder (Battery)
      title: 'New Hi-Power Maintenance Free Battery (Super Power)',
      price: '$165.00',
      rating: 0,
      status: 'OPTIONS' as const
    },
    {
      id: 6,
      image: '/turbo_charger.png', // Placeholder
      title: 'Savini Forged SV64-XC Wheels Rims On Sale',
      price: '$35.00',
      originalPrice: '$39.00',
      discount: '-10%',
      rating: 0,
      status: 'ADD TO CART' as const
    }
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 py-12 mb-12">
      
      {/* Deal Of The Week (Left Column) */}
      <div className="flex flex-col">
        <div className="flex items-center justify-between mb-6">
           <h2 className="text-xl font-bold text-gray-900">Deal Of The Week</h2>
           <div className="flex gap-2">
             <button className="w-6 h-6 bg-gray-100 hover:bg-primary hover:text-white rounded-full flex items-center justify-center text-gray-500 transition-colors cursor-pointer">
               <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
             </button>
             <button className="w-6 h-6 bg-gray-100 hover:bg-primary hover:text-white rounded-full flex items-center justify-center text-gray-500 transition-colors cursor-pointer">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
             </button>
           </div>
        </div>

        <div className="bg-white border border-primary rounded-sm p-6 flex flex-col h-full shadow-sm relative group">
           <div className="absolute top-6 left-6 z-10">
              <span className="bg-primary text-white text-xs font-bold px-2 py-1 rounded-sm">
                -14%
              </span>
           </div>
           
           <div className="aspect-square relative w-full mb-6 mt-4">
              <div className="absolute inset-0 bg-contain bg-center bg-no-repeat transition-transform duration-500 group-hover:scale-105" style={{ backgroundImage: "url('/turbo_charger.png')" }} />
           </div>

           <div className="text-center flex flex-col items-center">
              <h3 className="text-gray-900 font-semibold text-sm mb-3 line-clamp-2 px-4 hover:text-primary cursor-pointer">
                Alternator Bosch Fits Ford Hollandd Models
              </h3>
              
              <div className="flex items-center gap-1 mb-2">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className={`w-3.5 h-3.5 ${i < 0 ? 'text-gray-400' : 'text-gray-200'}`} fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>

              <div className="flex items-center gap-2 mb-6">
                <span className="text-gray-400 text-sm line-through">$58.00</span>
                <span className="text-primary font-bold text-lg">$50.00</span>
              </div>

              {/* Countdown Timer */}
              <div className="flex gap-2 mb-6 justify-center">
                 <div className="flex flex-col items-center border border-gray-200 px-3 py-1.5 rounded-sm">
                   <span className="font-bold text-gray-900 leading-none">492</span>
                   <span className="text-[10px] text-gray-500 uppercase mt-1">Days</span>
                 </div>
                 <span className="font-bold text-gray-400 mt-1">:</span>
                 <div className="flex flex-col items-center border border-gray-200 px-3 py-1.5 rounded-sm">
                   <span className="font-bold text-gray-900 leading-none">05</span>
                   <span className="text-[10px] text-gray-500 uppercase mt-1">Hour</span>
                 </div>
                 <span className="font-bold text-gray-400 mt-1">:</span>
                 <div className="flex flex-col items-center border border-gray-200 px-3 py-1.5 rounded-sm">
                   <span className="font-bold text-gray-900 leading-none">20</span>
                   <span className="text-[10px] text-gray-500 uppercase mt-1">Min</span>
                 </div>
                 <span className="font-bold text-primary mt-1">:</span>
                 <div className="flex flex-col items-center border border-primary px-3 py-1.5 rounded-sm text-primary">
                   <span className="font-bold leading-none">10</span>
                   <span className="text-[10px] uppercase mt-1">Sec</span>
                 </div>
              </div>

              <button className="w-full bg-primary text-white font-bold text-xs uppercase tracking-wider py-3 rounded-sm hover:bg-primary/90 transition-colors">
                ADD TO CART
              </button>
           </div>
        </div>
      </div>

      {/* Featured Products (Right Columns) */}
      <div className="lg:col-span-2 flex flex-col">
        <div className="flex items-center justify-between mb-6">
           <h2 className="text-xl font-bold text-gray-900">Featured Products</h2>
           <div className="flex gap-2">
             <button className="w-6 h-6 bg-gray-100 hover:bg-primary hover:text-white rounded-full flex items-center justify-center text-gray-500 transition-colors cursor-pointer">
               <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
             </button>
             <button className="w-6 h-6 bg-gray-100 hover:bg-primary hover:text-white rounded-full flex items-center justify-center text-gray-500 transition-colors cursor-pointer">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
             </button>
           </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
          {featuredProducts.map((product) => (
            <HorizontalProductCard 
              key={product.id}
              image={product.image}
              title={product.title}
              price={product.price}
              originalPrice={product.originalPrice}
              discount={product.discount}
              rating={product.rating}
              status={product.status}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
