'use client';
import React, { useEffect, useState } from 'react';
import { useWishlistStore } from '@/store/useWishlistStore';
import ProductCard from '@/components/ProductCard';
import { createClient } from '@/utils/supabase/client';

export default function WishlistClient() {
  const { items } = useWishlistStore();
  const [mounted, setMounted] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const fetchWishlistProducts = async () => {
      if (!mounted) return;
      if (items.length === 0) {
        setProducts([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      const supabase = createClient();
      const ids = items.map(item => item.id);
      
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .in('id', ids)
        .eq('status', 'active');
        
      if (!error && data) {
        setProducts(data);
      }
      setLoading(false);
    };

    fetchWishlistProducts();
  }, [mounted, items]);

  if (!mounted) return null;

  if (items.length === 0) {
    return (
      <div className="text-center mt-20">
        <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
        <p className="text-gray-500 mb-6 text-lg">Your wishlist is empty.</p>
        <a href="/" className="inline-block bg-primary text-white font-bold py-3 px-8 rounded-sm uppercase tracking-widest hover:bg-primary/90 transition-all hover:shadow-lg">
          Start Shopping
        </a>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
