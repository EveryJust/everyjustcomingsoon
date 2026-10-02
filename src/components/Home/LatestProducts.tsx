import React from 'react';
import ProductCard from '../ProductCard';
import { createClient } from '@/utils/supabase/server';

export default async function LatestProducts() {
  const supabase = await createClient();
  const { data: latestProductsData, error } = await supabase
    .from('products')
    .select('*')
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(10);

  const latestProducts = latestProductsData || [];

  if (latestProducts.length === 0) {
    return null;
  }

  return (
    <div className="py-8 sm:py-12 border-t border-gray-200 mt-8 sm:mt-12">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Latest Products</h2>
          <p className="text-xs text-gray-500 mt-1">Recently added to our catalog</p>
        </div>
      </div>

      {/* Pure Product Cards Grid - No Static Banners */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
        {latestProducts.map((product) => (
          <ProductCard 
            key={product.id}
            product={product}
          />
        ))}
      </div>
    </div>
  );
}
