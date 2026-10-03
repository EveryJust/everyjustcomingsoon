import React from 'react';
import MobileHero from '@/components/MobileHero';
import TrendingProducts from '@/components/Home/TrendingProducts';

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
                <span className="text-primary font-bold text-lg lg:text-xl mb-2 lg:mb-4">Official Store</span>
                <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black text-gray-900 leading-tight mb-2 lg:mb-4 uppercase tracking-tighter">
                  Express Delivery<br/>On All Orders
                </h2>
                <p className="text-gray-800 font-semibold tracking-wider mb-6 lg:mb-8 text-sm sm:text-base lg:text-lg">
                  GENUINE PRODUCTS • VERIFIED MERCHANTS
                </p>
                <div>
                  <a href="#all-products" className="inline-block bg-primary text-white font-bold px-6 py-2 lg:px-8 lg:py-3 rounded-md hover:bg-primary/90 transition-all hover:shadow-lg hover:-translate-y-0.5">
                    EXPLORE PRODUCTS
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
                  <h3 className="text-2xl lg:text-3xl font-bold text-white mb-2 uppercase">Verified Quality</h3>
                  <p className="text-white/70 text-xs lg:text-sm mb-4 lg:mb-6 uppercase tracking-wider">Top Brands & Certified Sellers</p>
                  <div>
                    <a href="#all-products" className="inline-block border-b-2 border-primary text-white font-semibold pb-1 hover:text-primary transition-colors">
                      VIEW CATALOG
                    </a>
                  </div>
                </div>
              </div>

              {/* Bottom Promo */}
              <div className="flex-1 min-h-[160px] sm:min-h-[200px] relative rounded-lg overflow-hidden shadow-lg group bg-yellow-400">
                <div className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105" style={{ backgroundImage: "url('/promo_bottom_banner.png')" }} />
                <div className="absolute inset-0 bg-gradient-to-r from-[#f5b300]/90 to-transparent p-6 lg:p-8 flex flex-col justify-center">
                  <h3 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2 uppercase">Best Deals</h3>
                  <p className="text-gray-800 text-xs lg:text-sm mb-4 lg:mb-6 uppercase tracking-wider">Curated Collections & Offers</p>
                  <div>
                    <a href="#all-products" className="inline-block border-b-2 border-gray-900 text-gray-900 font-semibold pb-1 hover:text-white hover:border-white transition-colors">
                      SHOP NOW
                    </a>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Products Section (Live Supabase Products) */}
          <TrendingProducts />

        </div>
      </main>
    </div>
  );
}
