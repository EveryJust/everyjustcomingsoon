"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import CategoryList from '@/components/Admin/Categories/CategoryList';
import { Category } from '@/types';

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // TODO: Fetch real categories from Supabase here
    // const { data } = await supabase.from('categories').select('*');
    // setCategories(data || []);
    setIsLoading(false);
  }, []);

  const handleToggleActive = (id: string, currentStatus: boolean) => {
    setCategories(prev => 
      prev.map(c => c.id === id ? { ...c, isActive: !currentStatus } : c)
    );
  };

  const handleDelete = (id: string) => {
    // Soft delete
    setCategories(prev => 
      prev.map(c => c.id === id ? { ...c, isDeleted: true } : c)
    );
  };

  return (
    <div className="max-w-5xl mx-auto pb-10">
      <div className="flex justify-between items-end mb-8">
        <div>
           <h1 className="text-2xl font-black text-gray-800 tracking-tight">Categories</h1>
           <p className="text-sm text-gray-500 font-medium mt-1">Organize your products with hierarchical categories.</p>
        </div>
        <Link 
          href="/admin/categories/add" 
          className="bg-[#6A43FB] hover:bg-[#5926EC] text-white px-6 py-2.5 rounded-full font-bold flex items-center gap-2 transition-colors shadow-lg shadow-[#6A43FB]/30"
        >
          <Plus size={20} />
          Add Category
        </Link>
      </div>

      <CategoryList 
        categories={categories}
        onToggleActive={handleToggleActive}
        onDelete={handleDelete}
      />
    </div>
  );
}
