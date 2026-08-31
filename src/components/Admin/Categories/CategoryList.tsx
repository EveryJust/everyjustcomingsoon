"use client";
import React, { useState, useMemo } from 'react';
import { Edit2, Trash2, Eye, EyeOff, ChevronRight, ChevronDown, ListTree, FolderMinus, Image as ImageIcon } from 'lucide-react';
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

  // Render a compact sub-category row with an image space
  const renderSubCategory = (category: any, depth: number) => {
    const hasChildren = category.children && category.children.length > 0;
    const isExpanded = expandedIds.has(category.id);

    return (
      <div key={category.id} className="flex flex-col w-full">
        <div className="flex items-center justify-between py-2 px-2 hover:bg-[#6A43FB]/5 rounded-xl transition-all duration-200 group border border-transparent hover:border-[#6A43FB]/10">
          <div className="flex items-center gap-2.5 flex-1 min-w-0">
            <div className="w-5 flex items-center justify-center flex-shrink-0">
              {hasChildren ? (
                <button 
                  onClick={() => toggleExpand(category.id)}
                  className="p-1 rounded-md hover:bg-[#6A43FB]/10 text-[#6A43FB] transition-colors"
                >
                  {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                </button>
              ) : (
                <div className="w-1 h-1 rounded-full bg-gray-300 ml-1"></div>
              )}
            </div>
            
            {/* Sub-category Image */}
            <div className="flex-shrink-0">
              {category.imageUrl ? (
                <div className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center p-0.5 border border-gray-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={category.imageUrl} alt={category.name} className="w-full h-full object-contain rounded-md" />
                </div>
              ) : (
                <div className="w-8 h-8 rounded-lg bg-gray-50/80 border border-dashed border-gray-200 flex items-center justify-center group-hover:border-[#6A43FB]/30 transition-colors">
                  <ImageIcon size={12} className="text-gray-300 group-hover:text-[#6A43FB]/50" />
                </div>
              )}
            </div>

            <div className={`flex flex-col min-w-0 flex-1 ${!category.isActive ? 'opacity-50' : ''}`}>
              <p className="font-semibold text-gray-700 text-[13px] truncate">{category.name}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity pl-2">
            <button 
              onClick={() => onToggleActive(category.id, category.isActive)}
              className="p-1.5 text-gray-400 hover:text-[#6A43FB] hover:bg-white rounded-lg transition-colors shadow-sm bg-transparent hover:shadow-[0_2px_8px_-2px_rgba(106,67,251,0.2)]"
              title={category.isActive ? "Unlist" : "List"}
            >
              {category.isActive ? <EyeOff size={13} /> : <Eye size={13} />}
            </button>
            <Link 
              href={`/admin/categories/edit/${category.slug}`}
              className="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-white rounded-lg transition-colors shadow-sm bg-transparent hover:shadow-[0_2px_8px_-2px_rgba(59,130,246,0.2)]"
            >
              <Edit2 size={13} />
            </Link>
            <button 
              onClick={() => setDeleteCategoryId(category.id)}
              className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-white rounded-lg transition-colors shadow-sm bg-transparent hover:shadow-[0_2px_8px_-2px_rgba(239,68,68,0.2)]"
            >
              <Trash2 size={13} />
            </button>
          </div>
        </div>
        
        {/* Render Children if expanded */}
        {hasChildren && isExpanded && (
          <div className="flex flex-col ml-[1.6rem] pl-2 border-l-2 border-[#6A43FB]/10 mt-1 mb-1 space-y-0.5">
            {category.children.map((child: any) => renderSubCategory(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  // Render a Top-Level Category as a Card
  const renderCategoryCard = (category: any) => {
    const hasChildren = category.children && category.children.length > 0;
    
    return (
      <div key={category.id} className="bg-white rounded-3xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)] border border-gray-100/80 overflow-hidden flex flex-col transition-all duration-300 hover:shadow-[0_12px_40px_-8px_rgba(106,67,251,0.12)] hover:border-[#6A43FB]/20 group">
        {/* Card Header with stylish gradient */}
        <div className="p-5 border-b border-gray-50 flex items-start justify-between bg-gradient-to-br from-white via-gray-50/30 to-[#6A43FB]/[0.02] relative overflow-hidden">
          {/* Decorative background blur */}
          <div className="absolute -right-8 -top-8 w-24 h-24 bg-[#6A43FB]/5 rounded-full blur-2xl group-hover:bg-[#6A43FB]/10 transition-colors duration-500"></div>
          
          <div className="flex items-start gap-4 relative z-10">
            {category.imageUrl ? (
              <div className="w-14 h-14 rounded-2xl bg-white shadow-[0_2px_10px_-2px_rgba(0,0,0,0.06)] flex-shrink-0 flex items-center justify-center p-1.5 border border-gray-100/80">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={category.imageUrl} alt={category.name} className="w-full h-full object-contain rounded-xl" />
              </div>
            ) : (
              <div className="w-14 h-14 rounded-2xl bg-gray-50/50 flex-shrink-0 border border-dashed border-gray-200 flex items-center justify-center shadow-sm">
                <ImageIcon size={20} className="text-gray-300" />
              </div>
            )}
            <div>
              <h3 className="font-black text-gray-800 text-lg leading-tight tracking-tight group-hover:text-[#6A43FB] transition-colors">{category.name}</h3>
              <p className="text-xs text-gray-400 font-mono mt-1 opacity-70">/{category.slug}</p>
              <div className="mt-2.5 flex items-center gap-2">
                <span className={`inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-[10px] uppercase tracking-wider font-bold ${category.isActive ? 'bg-[#E6F9F0] text-[#3ED08C] shadow-[0_0_10px_rgba(62,208,140,0.1)]' : 'bg-gray-100 text-gray-500'}`}>
                  {category.isActive ? 'Active' : 'Hidden'}
                </span>
                {hasChildren && (
                  <span className="text-[10px] font-bold text-gray-400 bg-gray-50 px-2 rounded-full py-0.5 border border-gray-100">
                    {category.children.length} Subs
                  </span>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-1 bg-white/80 backdrop-blur-sm p-1 rounded-xl shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)] border border-gray-100/80 relative z-10">
            <button 
              onClick={() => onToggleActive(category.id, category.isActive)}
              className="p-1.5 text-gray-400 hover:text-[#6A43FB] hover:bg-[#6A43FB]/10 rounded-lg transition-colors"
              title={category.isActive ? "Unlist" : "List"}
            >
              {category.isActive ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
            <Link 
              href={`/admin/categories/edit/${category.slug}`}
              className="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
            >
              <Edit2 size={15} />
            </Link>
            <button 
              onClick={() => setDeleteCategoryId(category.id)}
              className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
            >
              <Trash2 size={15} />
            </button>
          </div>
        </div>
        
        {/* Card Body - Subcategories */}
        <div className="p-3.5 flex-1 bg-white">
          {hasChildren ? (
            <div className="space-y-0.5 max-h-[280px] overflow-y-auto pr-1.5 custom-scrollbar">
              {category.children.map((child: any) => renderSubCategory(child, 1))}
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center py-8 text-center text-gray-300">
              <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center mb-3">
                <FolderMinus size={20} className="text-gray-300" />
              </div>
              <p className="text-xs font-semibold text-gray-400">No sub-categories</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h3 className="font-bold text-gray-800 text-xl tracking-tight">Category Catalog</h3>
          <p className="text-sm text-gray-500 mt-1">Manage top-level departments and drill down into sub-categories.</p>
        </div>
        
        {categoryTree.length > 0 && (
          <div className="flex items-center gap-2">
            <button 
              onClick={expandAll}
              className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 hover:text-[#6A43FB] hover:border-[#6A43FB]/30 hover:shadow-[0_4px_12px_-4px_rgba(106,67,251,0.15)] transition-all"
            >
              <ListTree size={15} /> Expand All
            </button>
            <button 
              onClick={collapseAll}
              className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 hover:text-[#6A43FB] hover:border-[#6A43FB]/30 hover:shadow-[0_4px_12px_-4px_rgba(106,67,251,0.15)] transition-all"
            >
              <FolderMinus size={15} /> Collapse All
            </button>
          </div>
        )}
      </div>

      {categoryTree.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {categoryTree.map(cat => renderCategoryCard(cat))}
        </div>
      ) : (
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-16 flex flex-col items-center justify-center text-center">
          <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-5">
            <ListTree className="text-gray-300" size={40} />
          </div>
          <h3 className="font-black text-gray-800 text-xl">No Categories Found</h3>
          <p className="text-gray-400 text-sm mt-2 max-w-sm">
            There are no categories matching your current filters, or you haven't created any yet.
          </p>
        </div>
      )}

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
