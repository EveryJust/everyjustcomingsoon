import React from 'react';
import ProductCard from '../ProductCard';
import { createClient } from '@/utils/supabase/server';
import { formatCurrency } from '@/utils/currency';

export default async function LatestProducts() {
  const supabase = await createClient();
  const { data: latestProductsData, error } = await supabase
    .from('products')
    .select('*')
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(4);

  const latestProducts = latestProductsData || [];


  return (
    <div className="py-8 sm:py-12 border-t border-gray-200 mt-8 sm:mt-12">
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
        <div className="lg:col-span-1 relative rounded-sm overflow-hidden min-h-[250px] sm:min-h-[400px] flex flex-col group shadow-md bg-gray-900">
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
        <div className="lg:col-span-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-4">
           {latestProducts.map((product) => {
             // Calculate discount if both prices exist
             let discountStr;
             let currentPrice = product.offer_price || product.price;
             let originalPrice = product.offer_price ? product.price : undefined;
             if (originalPrice && currentPrice < originalPrice) {
               const diff = originalPrice - currentPrice;
               const percent = Math.round((diff / originalPrice) * 100);
               discountStr = `${percent}% off`;
             }

            return (
              <ProductCard 
                key={product.id}
                product={product}
              />
            );
          })}
        </div>

      </div>
    </div>
  );
}
