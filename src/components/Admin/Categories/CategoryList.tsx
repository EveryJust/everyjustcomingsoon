"use client";
import React, { useState } from 'react';
import { Edit2, Trash2, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';
import { Category } from '@/types';
import ConfirmationDialog from '@/components/Admin/ConfirmationDialog';

interface CategoryListProps {
  categories: Category[];
  onToggleActive: (id: string, currentStatus: boolean) => void;
  onDelete: (id: string) => void;
}

export default function CategoryList({ categories, onToggleActive, onDelete }: CategoryListProps) {
  const [deleteCategoryId, setDeleteCategoryId] = useState<string | null>(null);

  // Safely build a tree even if some parents are filtered out
  const activeCategories = categories.filter(c => !c.isDeleted);
  const activeIds = new Set(activeCategories.map(c => c.id));
  
  // Roots are either nodes with no parent, or nodes whose parent is not in the current filtered list
  const rootCategories = activeCategories.filter(c => !c.parentId || !activeIds.has(c.parentId));

  const buildTreeSafe = (cats: Category[], currentRoots: Category[]): (Category & { children: any[] })[] => {
    return currentRoots.map(root => ({
      ...root,
      children: buildTreeSafe(cats, cats.filter(c => c.parentId === root.id))
    }));
  };

  const categoryTree = buildTreeSafe(activeCategories, rootCategories);

  const renderCategoryRow = (category: any, depth = 0) => {
    return (
      <React.Fragment key={category.id}>
        <div className="flex items-center justify-between p-4 border-b border-gray-100 hover:bg-gray-50/50 transition-colors group">
          <div className="flex items-center gap-4" style={{ paddingLeft: `${depth * 2}rem` }}>
            {depth > 0 && <div className="w-2 h-2 rounded-full bg-gray-300"></div>}
            
            {category.imageUrl ? (
              <div className="w-10 h-10 rounded-lg bg-gray-100 flex-shrink-0 flex items-center justify-center p-1 border border-gray-200">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={category.imageUrl} alt={category.name} className="w-full h-full object-contain" />
              </div>
            ) : (
              <div className="w-10 h-10 rounded-lg bg-gray-50 flex-shrink-0 border border-gray-200 flex items-center justify-center">
                <span className="text-gray-400 text-xs font-bold">No Img</span>
              </div>
            )}

            <div>
              <p className="font-bold text-gray-800">{category.name}</p>
              <p className="text-xs text-gray-500 font-mono">/{category.slug}</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <span className={`px-3 py-1 rounded-full text-xs font-bold ${category.isActive ? 'bg-[#E6F9F0] text-[#3ED08C]' : 'bg-gray-100 text-gray-500'}`}>
              {category.isActive ? 'Listed' : 'Unlisted'}
            </span>
            
            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button 
                onClick={() => onToggleActive(category.id, category.isActive)}
                className="p-2 text-gray-500 hover:text-[#6A43FB] hover:bg-[#6A43FB]/10 rounded-lg transition-colors"
                title={category.isActive ? "Unlist Category" : "List Category"}
              >
                {category.isActive ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
              
              <Link 
                href={`/admin/categories/edit/${category.slug}`}
                className="p-2 text-gray-500 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
              >
                <Edit2 size={18} />
              </Link>
              
              <button 
                onClick={() => setDeleteCategoryId(category.id)}
                className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        </div>
        
        {/* Render Children Recursively */}
        {category.children.map((child: any) => renderCategoryRow(child, depth + 1))}
      </React.Fragment>
    );
  };

  return (
    <>
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 bg-gray-50/50">
          <h3 className="font-bold text-gray-800">Category Hierarchy</h3>
          <p className="text-xs text-gray-500 mt-1">Manage main categories and their sub-categories.</p>
        </div>
        
        <div className="flex flex-col">
          {categoryTree.length > 0 ? (
            categoryTree.map(cat => renderCategoryRow(cat, 0))
          ) : (
            <div className="p-8 text-center text-gray-400 font-medium">
              No categories found. Click "Add Category" to create one.
            </div>
          )}
        </div>
      </div>

      <ConfirmationDialog 
        isOpen={deleteCategoryId !== null}
        title="Delete Category"
        message="Are you sure you want to delete this category? This will hide it from the storefront and admin panel. This action is reversible in the database."
        confirmText="Delete"
        isDestructive={true}
        onConfirm={() => {
          if (deleteCategoryId) onDelete(deleteCategoryId);
        }}
        onCancel={() => setDeleteCategoryId(null)}
      />
    </>
  );
}
