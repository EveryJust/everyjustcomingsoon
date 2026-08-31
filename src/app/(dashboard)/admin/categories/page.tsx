"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import CategoryList from '@/components/Admin/Categories/CategoryList';
import { Category } from '@/types';
import { createClient } from '@/utils/supabase/client';

import { Search, Filter, ArrowUpDown } from 'lucide-react';
import AdminDropdown from '@/components/Admin/AdminDropdown';

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Filter & Sort State
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  const supabase = createClient();

  const fetchCategories = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('categories')
      .select('*');
      
    if (error) {
      console.error("Error fetching categories:", error);
    } else if (data) {
      setCategories(data);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    // Optimistic UI update
    setCategories(prev => 
      prev.map(c => c.id === id ? { ...c, isActive: !currentStatus } : c)
    );
    // Real DB update
    await supabase.from('categories').update({ isActive: !currentStatus }).eq('id', id);
  };

  const handleDelete = async (id: string) => {
    // Optimistic UI update
    setCategories(prev => 
      prev.map(c => c.id === id ? { ...c, isDeleted: true } : c)
    );
    // Real DB update
    await supabase.from('categories').update({ isDeleted: true }).eq('id', id);
  };

  // Compute filtered & sorted categories
  const filteredCategories = categories.filter(category => {
    if (category.isDeleted) return false;
    
    // Search match
    const matchesSearch = category.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          category.slug.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;
    
    // Status match
    if (statusFilter === 'active' && !category.isActive) return false;
    if (statusFilter === 'draft' && category.isActive) return false;
    
    return true;
  }).sort((a, b) => {
    if (sortBy === 'newest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    if (sortBy === 'oldest') return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    if (sortBy === 'name-asc') return a.name.localeCompare(b.name);
    if (sortBy === 'name-desc') return b.name.localeCompare(a.name);
    return 0;
  });

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

      {/* Control Bar */}
      <div className="bg-white p-4 rounded-3xl shadow-sm border border-gray-100 mb-6 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96">
          <input 
            type="text" 
            placeholder="Search categories..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-full border border-gray-200 focus:border-[#6A43FB]/50 focus:ring-2 focus:ring-[#6A43FB]/20 outline-none transition-all shadow-sm text-sm font-medium"
          />
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2 min-w-[160px]">
            <Filter size={16} className="text-gray-400" />
            <div className="flex-1">
              <AdminDropdown 
                value={statusFilter}
                onChange={setStatusFilter}
                options={[
                  { label: 'All Status', value: 'all' },
                  { label: 'Listed Only', value: 'active' },
                  { label: 'Unlisted Only', value: 'draft' }
                ]}
              />
            </div>
          </div>
          
          <div className="flex items-center gap-2 min-w-[160px]">
            <ArrowUpDown size={16} className="text-gray-400" />
            <div className="flex-1">
              <AdminDropdown 
                value={sortBy}
                onChange={setSortBy}
                options={[
                  { label: 'Newest First', value: 'newest' },
                  { label: 'Oldest First', value: 'oldest' },
                  { label: 'Name (A-Z)', value: 'name-asc' },
                  { label: 'Name (Z-A)', value: 'name-desc' }
                ]}
              />
            </div>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#6A43FB]"></div>
        </div>
      ) : (
        <CategoryList 
          categories={filteredCategories}
          onToggleActive={handleToggleActive}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}
