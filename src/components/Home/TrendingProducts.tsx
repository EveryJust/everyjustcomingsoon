import React from 'react';
import ProductCard from '../ProductCard';

export default function TrendingProducts() {
  const products = [
    {
      id: 1,
      image: '/dash_camera.png',
      title: 'Thinkware F770 2CH FHD Wi-Fi Dash Camera',
      price: '$150.00',
      rating: 0,
      status: 'ADD TO CART' as const
    },
    {
      id: 2,
      image: '/turbo_charger.png',
      title: 'Savini Forged SV64-XC Wheels Rims On Sale',
      price: '$35.00',
      originalPrice: '$39.00',
      discount: '-10%',
      rating: 0,
      status: 'ADD TO CART' as const
    },
    {
      id: 3,
      image: '/promo_top_banner.png', // using existing placeholder
      title: 'OMP Car Steering Aluminum Spacer Quick Steering',
      price: '$70.00',
      originalPrice: '$77.00',
      rating: 0,
      status: 'OPTIONS' as const
    },
    {
      id: 4,
      image: '/promo_top_banner.png', // using existing placeholder
      title: 'New Upgraded 1-Piece Rear Driveshaft & Parts',
      price: '$15.00',
      rating: 0,
      status: 'ADD TO CART' as const
    },
    {
      id: 5,
      image: '/promo_bottom_banner.png', // using existing placeholder
      title: 'ESP Brakes 4301521R-BKCZ Brake System 1 Pack',
      price: '$45.00',
      rating: 0,
      status: 'SOLD OUT' as const
    }
  ];

  return (
    <div className="py-8 sm:py-12 border-t border-gray-200 mt-8 sm:mt-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <h2 className="text-2xl font-bold text-gray-900">Trending Products</h2>
        <div className="flex flex-wrap gap-2 text-sm font-semibold tracking-wide">
          <button className="bg-primary text-white px-4 py-2 rounded-sm cursor-pointer">
            BODY PARTS
          </button>
          <button className="bg-white border border-gray-200 text-gray-600 hover:text-primary px-4 py-2 rounded-sm transition-colors cursor-pointer">
            ENGINE PARTS
          </button>
          <button className="bg-white border border-gray-200 text-gray-600 hover:text-primary px-4 py-2 rounded-sm transition-colors cursor-pointer">
            ACCESSORIES
          </button>
        </div>
      </div>

      <div className="relative">
        {/* Left Arrow */}
        <button className="absolute -left-4 top-1/2 -translate-y-1/2 w-8 h-8 bg-white border border-gray-200 rounded-full flex items-center justify-center text-gray-500 hover:text-primary hover:border-primary shadow-sm z-10 hidden sm:flex cursor-pointer transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        </button>

        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {products.map((product) => (
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

        {/* Right Arrow */}
        <button className="absolute -right-4 top-1/2 -translate-y-1/2 w-8 h-8 bg-white border border-gray-200 rounded-full flex items-center justify-center text-gray-500 hover:text-primary hover:border-primary shadow-sm z-10 hidden sm:flex cursor-pointer transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
        </button>
      </div>
    </div>
  );
}
