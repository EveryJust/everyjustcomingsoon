"use client";
import React, { useState, useMemo } from 'react';
import { Edit2, Trash2, Eye, EyeOff, ChevronRight, ChevronDown, ListTree, FolderMinus } from 'lucide-react';
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
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

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

  const categoryTree = useMemo(() => buildTreeSafe(activeCategories, rootCategories), [activeCategories, rootCategories]);

  // Extract all IDs that have children for the "Expand All" function
  const allParentIds = useMemo(() => {
    const parentIds = new Set<string>();
    activeCategories.forEach(cat => {
      if (activeCategories.some(c => c.parentId === cat.id)) {
        parentIds.add(cat.id);
      }
    });
    return parentIds;
  }, [activeCategories]);

  const toggleExpand = (id: string) => {
    setExpandedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const expandAll = () => setExpandedIds(new Set(allParentIds));
  const collapseAll = () => setExpandedIds(new Set());

  const renderCategoryRow = (category: any, depth = 0) => {
    const hasChildren = category.children && category.children.length > 0;
    const isExpanded = expandedIds.has(category.id);

    return (
      <div key={category.id} className="flex flex-col w-full">
        <div 
          className={`flex items-center justify-between p-4 border-b border-gray-100 hover:bg-gray-50/50 transition-colors group ${depth === 0 ? 'bg-white' : ''}`}
        >
          <div className="flex items-center gap-3">
            {/* Toggle Button for Parents */}
            <div className="w-6 flex items-center justify-center">
              {hasChildren ? (
                <button 
                  onClick={() => toggleExpand(category.id)}
                  className="p-1 rounded hover:bg-gray-200 text-gray-500 transition-colors"
                >
                  {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                </button>
              ) : (
                <div className="w-1.5 h-1.5 rounded-full bg-gray-300 ml-2"></div>
              )}
            </div>
            
            {/* Image Thumbnail */}
            {category.imageUrl ? (
              <div className="w-10 h-10 rounded-lg bg-gray-100 flex-shrink-0 flex items-center justify-center p-1 border border-gray-200">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={category.imageUrl} alt={category.name} className="w-full h-full object-contain" />
              </div>
            ) : (
              <div className="w-10 h-10 rounded-lg bg-gray-50 flex-shrink-0 border border-gray-200 flex items-center justify-center">
                <span className="text-gray-400 text-xs font-bold">Img</span>
              </div>
            )}

            {/* Title & Slug */}
            <div className={!category.isActive ? 'opacity-50' : ''}>
              <p className="font-bold text-gray-800">{category.name}</p>
              <p className="text-xs text-gray-400 font-mono">/{category.slug}</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <span className={`px-3 py-1 rounded-full text-[10px] uppercase tracking-wider font-bold ${category.isActive ? 'bg-[#E6F9F0] text-[#3ED08C]' : 'bg-gray-100 text-gray-500'}`}>
              {category.isActive ? 'Listed' : 'Unlisted'}
            </span>
            
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button 
                onClick={() => onToggleActive(category.id, category.isActive)}
                className="p-2 text-gray-500 hover:text-[#6A43FB] hover:bg-[#6A43FB]/10 rounded-lg transition-colors"
                title={category.isActive ? "Unlist Category" : "List Category"}
              >
                {category.isActive ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
              
              <Link 
                href={`/admin/categories/edit/${category.slug}`}
                className="p-2 text-gray-500 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
              >
                <Edit2 size={16} />
              </Link>
              
              <button 
                onClick={() => setDeleteCategoryId(category.id)}
                className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        </div>
        
        {/* Render Children if expanded */}
        {hasChildren && isExpanded && (
          <div className="flex flex-col ml-9 border-l-2 border-gray-100">
            {category.children.map((child: any) => renderCategoryRow(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-gray-800">Category Hierarchy</h3>
            <p className="text-xs text-gray-500 mt-1">Manage main categories and their sub-categories.</p>
          </div>
          
          {categoryTree.length > 0 && (
            <div className="flex items-center gap-2">
              <button 
                onClick={expandAll}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:text-[#6A43FB] transition-colors shadow-sm"
              >
                <ListTree size={14} /> Expand All
              </button>
              <button 
                onClick={collapseAll}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:text-[#6A43FB] transition-colors shadow-sm"
              >
                <FolderMinus size={14} /> Collapse All
              </button>
            </div>
          )}
        </div>
        
        <div className="flex flex-col w-full">
          {categoryTree.length > 0 ? (
            categoryTree.map(cat => renderCategoryRow(cat, 0))
          ) : (
            <div className="p-12 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                <ListTree className="text-gray-300" size={32} />
              </div>
              <h3 className="font-bold text-gray-700 text-lg">No Categories Found</h3>
              <p className="text-gray-400 text-sm mt-1 max-w-sm">
                There are no categories matching your current filters, or you haven't created any yet.
              </p>
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
