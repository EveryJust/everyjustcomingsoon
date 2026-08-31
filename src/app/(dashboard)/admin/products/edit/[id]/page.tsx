"use client";
import React, { useEffect, useState } from 'react';
import ProductForm from '@/components/Admin/Products/ProductForm';
import { useRouter, useParams } from 'next/navigation';

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const [productData, setProductData] = useState<any>(null);

  useEffect(() => {
    // TODO: Fetch real product data from Supabase using params.id
    // For now, simulating a fetch so the form renders properly
    setProductData({
       name: 'Example Product to Edit',
       status: 'draft',
       images: [],
       moreInfo: {
          netWeightUnit: 'g'
       }
    });
  }, [params.id]);

  const handleSubmit = async (data: any) => {
    console.log("Updating product:", params.id, data);
    // TODO: Supabase update logic
    router.push('/admin/products');
  };

  if (!productData) {
    return <div className="p-8 text-center text-gray-400">Loading product...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto pb-10">
      <div className="mb-6">
         <h1 className="text-2xl font-black text-gray-800 tracking-tight">Edit Product</h1>
         <p className="text-sm text-gray-500 font-medium mt-1">Update the details for this item.</p>
      </div>
      
      <div className="mt-8">
        <ProductForm 
          initialData={productData}
          onSubmit={handleSubmit} 
          onCancel={() => router.push('/admin/products')} 
        />
      </div>
    </div>
  );
}
