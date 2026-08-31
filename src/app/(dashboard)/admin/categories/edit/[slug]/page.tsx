"use client";
import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import CategoryForm from '@/components/Admin/Categories/CategoryForm';
import { createClient } from '@/utils/supabase/client';

export default function EditCategoryPage() {
  const router = useRouter();
  const params = useParams();
  const [categoryData, setCategoryData] = useState<any>(null);
  const [parentCategories, setParentCategories] = useState<{id: string, name: string}[]>([]);
  const supabase = createClient();

  useEffect(() => {
    const fetchCategoryAndParents = async () => {
      // 1. Fetch the category by slug
      const { data: catData, error: catError } = await supabase
        .from('categories')
        .select('*')
        .eq('slug', params.slug)
        .single();
        
      if (catData) setCategoryData(catData);
      
      // 2. Fetch potential parent categories
      const { data: parentData } = await supabase
        .from('categories')
        .select('id, name')
        .is('parentId', null)
        .neq('slug', params.slug); // Prevent setting itself as parent
        
      if (parentData) setParentCategories(parentData);
    };
    
    if (params.slug) {
      fetchCategoryAndParents();
    }
  }, [params.slug]);

  const handleSubmit = async (data: any) => {
    if (!categoryData) return;
    console.log("Updating category:", categoryData.id, data);
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
