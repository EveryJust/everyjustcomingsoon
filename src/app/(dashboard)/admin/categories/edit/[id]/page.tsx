"use client";
import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import CategoryForm from '@/components/Admin/Categories/CategoryForm';

export default function EditCategoryPage() {
  const router = useRouter();
  const params = useParams();
  const [categoryData, setCategoryData] = useState<any>(null);

  useEffect(() => {
    // TODO: Fetch real category data from Supabase using params.id
    setCategoryData({
       name: 'Example Category',
       slug: 'example-category',
       isActive: true,
       parentId: null
    });
  }, [params.id]);

  const handleSubmit = async (data: any) => {
    console.log("Updating category:", params.id, data);
    // TODO: Supabase update logic
    router.push('/admin/categories');
  };

  // Mock parent categories for dropdown
  const mockCategories = [
    { id: '1', name: 'Electronics' },
    { id: '2', name: 'Smartphones' }
  ];

  if (!categoryData) {
    return <div className="p-8 text-center text-gray-400">Loading category...</div>;
  }

  return (
    <div className="max-w-3xl mx-auto pb-10 mt-8">
      <div className="mb-6">
         <h1 className="text-2xl font-black text-gray-800 tracking-tight">Edit Category</h1>
         <p className="text-sm text-gray-500 font-medium mt-1">Update the details for this category.</p>
      </div>
      
      <CategoryForm 
        initialData={categoryData}
        categories={mockCategories}
        onSubmit={handleSubmit} 
        onCancel={() => router.push('/admin/categories')} 
      />
    </div>
  );
}
