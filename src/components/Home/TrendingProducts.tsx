import React from 'react';
import ProductCard from '../ProductCard';
import { createClient } from '@/utils/supabase/server';
import { formatCurrency } from '@/utils/currency';

export default async function TrendingProducts() {
  const supabase = await createClient();
  const { data: productsData, error } = await supabase
    .from('products')
    .select('*')
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(10);

  const products = productsData || [];

  return (
    <div className="pt-0 pb-4 lg:py-12 lg:border-t border-gray-200 lg:mt-12">
      <div className="hidden lg:flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Trending Products</h2>
          <p className="text-xs text-gray-500 mt-1">Popular picks from our storefront</p>
        </div>
      </div>

      <div className="relative">
        {/* Left Arrow */}
        <button className="absolute -left-4 top-1/2 -translate-y-1/2 w-8 h-8 bg-white border border-gray-200 rounded-full flex items-center justify-center text-gray-500 hover:text-primary hover:border-primary shadow-sm z-10 hidden sm:flex cursor-pointer transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        </button>

        {/* Product Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-4">
          {products.map((product) => {
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

        {/* Right Arrow */}
        <button className="absolute -right-4 top-1/2 -translate-y-1/2 w-8 h-8 bg-white border border-gray-200 rounded-full flex items-center justify-center text-gray-500 hover:text-primary hover:border-primary shadow-sm z-10 hidden sm:flex cursor-pointer transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
        </button>
      </div>
    </div>
  );
}
