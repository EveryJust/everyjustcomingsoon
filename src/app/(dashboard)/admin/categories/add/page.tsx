"use client";
import React from 'react';
import { useRouter } from 'next/navigation';
import CategoryForm from '@/components/Admin/Categories/CategoryForm';

export default function AddCategoryPage() {
  const router = useRouter();
  const [categories, setCategories] = React.useState<{id: string, name: string}[]>([]);

  React.useEffect(() => {
    // TODO: Fetch parent categories from Supabase
    // const { data } = await supabase.from('categories').select('id, name').eq('parentId', null);
    // setCategories(data || []);
  }, []);

  const handleSubmit = async (data: any) => {
    console.log("Submitting new category:", data);
    // TODO: Supabase insertion logic
    router.push('/admin/categories');
  };

  return (
    <div className="max-w-3xl mx-auto pb-10 mt-8">
      <div className="mb-6">
         <h1 className="text-2xl font-black text-gray-800 tracking-tight">Add New Category</h1>
         <p className="text-sm text-gray-500 font-medium mt-1">Create a new category to organize your products.</p>
      </div>
      
      <CategoryForm 
        categories={categories}
        onSubmit={handleSubmit} 
        onCancel={() => router.push('/admin/categories')} 
      />
    </div>
  );
}
