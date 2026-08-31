"use client";
import React from 'react';
import ProductForm from '@/components/Admin/Products/ProductForm';
import { useRouter } from 'next/navigation';

export default function AddProductPage() {
  const router = useRouter();

  const handleSubmit = async (data: any) => {
    console.log("Submitting new product:", data);
    // TODO: Supabase insertion logic
    router.push('/admin/products');
  };

  return (
    <div className="max-w-4xl mx-auto pb-10">
      <div className="mb-6">
         <h1 className="text-2xl font-black text-gray-800 tracking-tight">Add New Product</h1>
         <p className="text-sm text-gray-500 font-medium mt-1">Fill out the details below to list a new item in your store.</p>
      </div>
      
      <div className="mt-8">
        <ProductForm 
          onSubmit={handleSubmit} 
          onCancel={() => router.push('/admin/products')} 
        />
      </div>
    </div>
  );
}
