"use client";
import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import CategoryForm from '@/components/Admin/Categories/CategoryForm';

export default function EditCategoryPage() {
  const router = useRouter();
  const params = useParams();
  const [categoryData, setCategoryData] = useState<any>(null);
  const [parentCategories, setParentCategories] = useState<{id: string, name: string}[]>([]);

  useEffect(() => {
    // TODO: Fetch real category data and parent categories from Supabase using params.id
    // setCategoryData(data);
    // setParentCategories(parentsData);
  }, [params.id]);

  const handleSubmit = async (data: any) => {
    console.log("Updating category:", params.id, data);
    // TODO: Supabase update logic
    router.push('/admin/categories');
  };

  if (!categoryData) {
    return (
      <div className="p-8 flex justify-center mt-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#6A43FB]"></div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto pb-10 mt-8">
      <div className="mb-6">
         <h1 className="text-2xl font-black text-gray-800 tracking-tight">Edit Category</h1>
         <p className="text-sm text-gray-500 font-medium mt-1">Update the details for this category.</p>
      </div>
      
      <CategoryForm 
        initialData={categoryData}
        categories={parentCategories}
        onSubmit={handleSubmit} 
        onCancel={() => router.push('/admin/categories')} 
      />
    </div>
  );
}
