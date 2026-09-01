import React from 'react';
import Image from 'next/image';
import MobileHero from '@/components/MobileHero';
import TrendingProducts from '@/components/Home/TrendingProducts';

import LatestProducts from '@/components/Home/LatestProducts';
import ShopByCategories from '@/components/Home/ShopByCategories';
import FeaturesRow from '@/components/Home/FeaturesRow';
import WidePromoBanner from '@/components/Home/WidePromoBanner';
import DealAndFeatured from '@/components/Home/DealAndFeatured';
import Testimonials from '@/components/Home/Testimonials';
import LatestBlog from '@/components/Home/LatestBlog';
import AllProducts from '@/components/Home/AllProducts';

export default function Home() {
  return (
    <div className="text-gray-900 font-sans">

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto py-0 lg:py-8 overflow-hidden">
        
        {/* Mobile App-like Hero Section */}
        <MobileHero />

        {/* Content Wrapper for standard padding */}
        <div className="px-4 sm:px-6 lg:px-4">

        {/* Hero Grid (Desktop Only) */}
        <div className="hidden lg:grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
          
          {/* Main Banner (Spans 2 columns) */}
          <div className="lg:col-span-2 relative rounded-lg overflow-hidden h-[250px] sm:h-[400px] lg:h-[500px] shadow-lg group bg-gray-200">
            <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('/main_hero_banner.png')" }} />
            <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/80 to-transparent flex flex-col justify-center p-6 sm:p-8 lg:p-12">
              <span className="text-primary font-bold text-lg lg:text-xl mb-2 lg:mb-4">Starting From ₹199</span>
              <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black text-gray-900 leading-tight mb-2 lg:mb-4 uppercase tracking-tighter">
                Two Day Shipping<br/>On All Orders
              </h2>
              <p className="text-gray-800 font-semibold tracking-wider mb-6 lg:mb-8 text-sm sm:text-base lg:text-lg">
                DISCOUNT ALL DEALS – 40% OFF
              </p>
              <div>
                <a href="#" className="inline-block bg-primary text-white font-bold px-6 py-2 lg:px-8 lg:py-3 rounded-md hover:bg-primary/90 transition-all hover:shadow-lg hover:-translate-y-0.5">
                  SHOP NOW
                </a>
              </div>
            </div>
          </div>

          {/* Side Banners (Stacked) */}
          <div className="flex flex-col gap-6 h-auto lg:h-[500px]">
            {/* Top Promo */}
            <div className="flex-1 min-h-[160px] sm:min-h-[200px] relative rounded-lg overflow-hidden shadow-lg group bg-gray-900">
              <div className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105" style={{ backgroundImage: "url('/promo_top_banner.png')" }} />
              <div className="absolute inset-0 bg-black/40 p-6 lg:p-8 flex flex-col justify-center">
                <span className="text-white/80 font-medium mb-1">From ₹149</span>
                <h3 className="text-2xl lg:text-3xl font-bold text-white mb-2 uppercase">Pro Wheel</h3>
                <p className="text-white/70 text-xs lg:text-sm mb-4 lg:mb-6 uppercase tracking-wider">Black Rhino Primm</p>
                <div>
                  <a href="#" className="inline-block border-b-2 border-primary text-white font-semibold pb-1 hover:text-primary transition-colors">
                    SHOP NOW
                  </a>
                </div>
              </div>
            </div>

            {/* Bottom Promo */}
            <div className="flex-1 min-h-[160px] sm:min-h-[200px] relative rounded-lg overflow-hidden shadow-lg group bg-yellow-400">
              <div className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105" style={{ backgroundImage: "url('/promo_bottom_banner.png')" }} />
              <div className="absolute inset-0 bg-gradient-to-r from-[#f5b300]/90 to-transparent p-6 lg:p-8 flex flex-col justify-center">
                <span className="text-gray-800 font-medium mb-1">From ₹240</span>
                <h3 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2 uppercase">Buy Brake</h3>
                <p className="text-gray-800 text-xs lg:text-sm mb-4 lg:mb-6 uppercase tracking-wider">Spin-On Lube Filter</p>
                <div>
                  <a href="#" className="inline-block border-b-2 border-gray-900 text-gray-900 font-semibold pb-1 hover:text-white hover:border-white transition-colors">
                    SHOP NOW
                  </a>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Brands Carousel (Static mockup) */}
        <div className="hidden lg:block border-t border-gray-200 py-10 mt-10">
          <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10 lg:gap-20 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
            {/* Using text logos for mockup since we didn't generate 7 images */}
            <span className="text-2xl sm:text-3xl font-black tracking-tighter uppercase text-red-600">Honda</span>
            <span className="text-2xl sm:text-3xl font-black tracking-tighter uppercase text-blue-800">Nissan</span>
            <span className="text-2xl sm:text-3xl font-black tracking-tighter uppercase text-blue-600">Subaru</span>
            <span className="text-2xl sm:text-3xl font-black tracking-tighter uppercase text-gray-800">Cadillac</span>
            <span className="text-2xl sm:text-3xl font-black tracking-tighter uppercase text-gray-900">Infiniti</span>
            <span className="text-2xl sm:text-3xl font-black tracking-tighter uppercase text-red-700">KIA</span>
            <span className="text-2xl sm:text-3xl font-black tracking-tighter uppercase text-blue-700">Ford</span>
          </div>
        </div>

        {/* Trending Products Section */}
        <TrendingProducts />



        {/* Latest Products Section */}
        <LatestProducts />

        {/* Shop By Categories Section */}
        <ShopByCategories />

        {/* All Products Section */}
        <AllProducts />

        {/* Features Row */}
        <FeaturesRow />

        {/* Wide Promo Banner */}
        <WidePromoBanner />

        {/* Deal Of The Week & Featured Products */}
        <DealAndFeatured />

        {/* Testimonials */}
        <Testimonials />

        {/* Latest Blog */}
        <LatestBlog />
        
        </div>
      </main>
    </div>
  );
}
