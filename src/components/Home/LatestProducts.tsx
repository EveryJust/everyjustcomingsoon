import React from 'react';
import ProductCard from '../ProductCard';

export default function LatestProducts() {
  const latestProducts = [
    {
      id: 1,
      image: '/promo_top_banner.png', // Placeholder
      title: 'Pilot Automotive Universal Fit Black with Red Trim',
      price: '$17.00',
      originalPrice: '$19.00',
      discount: '-11%',
      rating: 0,
      status: 'ADD TO CART' as const
    },
    {
      id: 2,
      image: '/dash_camera.png', // Placeholder
      title: 'SUPAREE 7 Round LED Headlights RGB Halo Angel',
      price: '$12.00',
      rating: 0,
      status: 'OPTIONS' as const
    },
    {
      id: 3,
      image: '/turbo_charger.png', // Placeholder
      title: 'Thrustmaster TH8S Shifter Add-On Manual Ge',
      price: '$90.00',
      originalPrice: '$97.00',
      discount: '-7%',
      rating: 0,
      status: 'ADD TO CART' as const
    },
    {
      id: 4,
      image: '/promo_bottom_banner.png', // Placeholder
      title: 'New Upgraded 1-Piece Rear Driveshaft & Parts',
      price: '$15.00',
      rating: 0,
      status: 'ADD TO CART' as const
    }
  ];

  return (
    <div className="py-12 border-t border-gray-200 mt-12">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Latest Products</h2>
        <div className="flex gap-2">
          {/* Navigation Arrows for slider feel */}
          <button className="w-8 h-8 bg-gray-100 hover:bg-primary hover:text-white rounded-full flex items-center justify-center text-gray-500 transition-colors cursor-pointer">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          </button>
          <button className="w-8 h-8 bg-gray-100 hover:bg-primary hover:text-white rounded-full flex items-center justify-center text-gray-500 transition-colors cursor-pointer">
             <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        
        {/* Large Vertical Promo Banner */}
        <div className="lg:col-span-1 relative rounded-sm overflow-hidden min-h-[400px] flex flex-col group shadow-md bg-gray-900">
          <div 
            className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105" 
            style={{ backgroundImage: "url('/main_hero_banner.png')" }} // Using hero banner as placeholder for red car
          />
          <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-start p-6 text-center">
             <span className="bg-[#E86C15] text-white text-xs font-bold px-3 py-1 mb-4 rounded-sm">
                UP TO 30% DISCOUNT
             </span>
             <h3 className="text-2xl font-black text-white uppercase leading-tight tracking-tight">
               RUBBER TUBELESS<br/>TYRE FOR CAR
             </h3>
          </div>
        </div>

        {/* Product Cards Grid */}
        <div className="lg:col-span-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
           {latestProducts.map((product) => (
            <ProductCard 
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
