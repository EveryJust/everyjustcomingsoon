import React from 'react';
import ProductCard from '../ProductCard';
import { createClient } from '@/utils/supabase/server';

export default async function AllProducts() {
  const supabase = await createClient();
  const { data: allProductsData, error } = await supabase
    .from('products')
    .select('*')
    .eq('status', 'active')
    .order('created_at', { ascending: false });

  const allProducts = allProductsData || [];

  return (
    <div className="py-8 sm:py-12 border-t border-gray-200 mt-8 sm:mt-12" id="all-products">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl md:text-3xl font-black text-gray-900 uppercase tracking-tight">Shop All Products</h2>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
        {allProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
