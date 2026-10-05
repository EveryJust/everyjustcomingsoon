import React from 'react';
import { Metadata } from 'next';
import { createClient } from '@/utils/supabase/server';
import EveryJustStoreClient from './EveryJustStoreClient';

export const metadata: Metadata = {
  title: 'EveryJust Official Store | Genuine Products & Fast Delivery',
  description: 'Shop directly from EveryJust Official Flagship Store with 4.9 rating. Explore curated electronics, lifestyle fashion, and essentials with 100% authenticity and express delivery.',
  openGraph: {
    title: 'EveryJust Official Store',
    description: 'Explore verified products directly from EveryJust with 4.9 customer rating, pan-India express shipping and 7-day returns.',
    url: 'https://everyjust.com/brand/everyjust',
    siteName: 'EveryJust',
  }
};

export default async function EveryJustBrandPage() {
  const supabase = await createClient();

  // Initially all active products are under EveryJust
  const { data: productsData, error } = await supabase
    .from('products')
    .select('*')
    .eq('status', 'active')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching EveryJust products:', error.message);
  }

  // If status is active has few or no products, also fetch all as fallback so the catalog is never empty
  let products = productsData || [];
  if (products.length === 0) {
    const { data: allProducts } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });
    products = allProducts || [];
  }

  return <EveryJustStoreClient products={products} />;
}
