"use client";
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Search, X, Check, Loader2, ListTree, ChevronRight } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { Category } from '@/types';

interface CategoryMultiSelectProps {
  value: string[];
  onChange: (value: string[]) => void;
  maxSelections?: number;
}

export default function CategoryMultiSelect({ value = [], onChange, maxSelections = 5 }: CategoryMultiSelectProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  
  const dropdownRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch all active categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data, error } = await supabase
          .from('categories')
          .select('*')
          .eq('isDeleted', false)
          .eq('isActive', true);
          
        if (error) throw error;
        setCategories(data as Category[]);
      } catch (err) {
        console.error("Error fetching categories:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, [supabase]);

  // Build full paths for each category (e.g., "Men › Footwear › Loafers")
  const categoryPaths = useMemo(() => {
    const buildPath = (category: Category, allCats: Category[]): string => {
      if (!category.parentId) return category.name;
      const parent = allCats.find(c => c.id === category.parentId);
      if (!parent) return category.name;
      return `${buildPath(parent, allCats)} › ${category.name}`;
    };

    return categories.map(cat => ({
      id: cat.id,
      name: cat.name,
      path: buildPath(cat, categories)
    })).sort((a, b) => a.path.localeCompare(b.path));
  }, [categories]);

  // Filter based on search query
  const filteredCategories = useMemo(() => {
    if (!search.trim()) return categoryPaths;
    const lowerSearch = search.toLowerCase();
    return categoryPaths.filter(c => c.path.toLowerCase().includes(lowerSearch));
  }, [search, categoryPaths]);

  const handleSelect = (categoryId: string) => {
    // value might be undefined if first time
    const safeValue = value || [];
    
    if (safeValue.includes(categoryId)) {
      // Remove
      onChange(safeValue.filter(id => id !== categoryId));
    } else {
      // Add (if under max)
      if (safeValue.length < maxSelections) {
        onChange([...safeValue, categoryId]);
      }
    }
    // Clear search but keep dropdown open
    setSearch('');
  };

  const removeCategory = (categoryId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onChange((value || []).filter(id => id !== categoryId));
  };

  const isMaxReached = (value || []).length >= maxSelections;

  return (
    <div className="relative w-full" ref={dropdownRef}>
      {/* Selection Box */}
      <div 
        className={`min-h-[52px] w-full p-2 rounded-xl border transition-all shadow-sm bg-white cursor-text flex flex-wrap gap-2 items-center ${
          isOpen ? 'border-[#6A43FB]/50 ring-2 ring-[#6A43FB]/20' : 'border-gray-200 hover:border-gray-300'
        }`}
        onClick={() => setIsOpen(true)}
      >
        {/* Selected Pills */}
        {(value || []).map(id => {
          const cat = categoryPaths.find(c => c.id === id);
          if (!cat) return null;
          return (
            <div key={id} className="flex items-center gap-1.5 bg-[#6A43FB]/10 text-[#6A43FB] border border-[#6A43FB]/20 px-2.5 py-1.5 rounded-lg text-xs font-bold shadow-sm">
              <ListTree size={12} className="opacity-70" />
              <span className="truncate max-w-[200px]">{cat.name}</span>
              <button 
                type="button"
                onClick={(e) => removeCategory(id, e)}
                className="hover:bg-[#6A43FB]/20 p-0.5 rounded-full transition-colors ml-1"
              >
                <X size={12} />
              </button>
            </div>
          );
        })}
        
        {/* Search Input */}
        <div className="flex-1 min-w-[120px] flex items-center relative">
          {!isMaxReached ? (
            <input 
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setIsOpen(true);
              }}
              onFocus={() => setIsOpen(true)}
              placeholder={(value || []).length === 0 ? "Search and select categories..." : "Add another..."}
              className="w-full bg-transparent border-none outline-none text-sm p-1.5 text-gray-700 placeholder:text-gray-400"
            />
          ) : (
            <span className="text-xs font-medium text-orange-500 bg-orange-50 px-2 py-1 rounded-md ml-1 border border-orange-100">
              Maximum {maxSelections} categories reached
            </span>
          )}
        </div>
        
        <div className="text-gray-400 pr-2">
          {loading ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
        </div>
      </div>

      {/* Dropdown Menu */}
      {isOpen && !isMaxReached && (
        <div className="absolute z-50 bottom-full mb-2 w-full bg-white rounded-2xl shadow-[0_-10px_40px_-10px_rgba(0,0,0,0.15)] border border-gray-100 max-h-[320px] overflow-y-auto custom-scrollbar overflow-hidden">
          {loading ? (
            <div className="p-8 flex flex-col items-center justify-center text-gray-400">
              <Loader2 size={24} className="animate-spin mb-2 text-[#6A43FB]/50" />
              <p className="text-sm font-medium">Loading categories...</p>
            </div>
          ) : filteredCategories.length > 0 ? (
            <div className="p-2 space-y-1">
              {filteredCategories.map(cat => {
                const isSelected = (value || []).includes(cat.id);
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => handleSelect(cat.id)}
                    className={`w-full text-left px-4 py-3 rounded-xl text-sm transition-all flex items-start justify-between group ${
                      isSelected 
                        ? 'bg-[#E6F9F0] text-[#1E955E] font-medium' 
                        : 'hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    <div className="flex-1 pr-4">
                      {/* We split by ' › ' to render the path with pretty chevrons */}
                      <div className="flex flex-wrap items-center text-xs gap-1 opacity-70 mb-1 text-gray-500">
                        {cat.path.split(' › ').slice(0, -1).map((part, i, arr) => (
                          <React.Fragment key={i}>
                            <span className={i === 0 ? "font-semibold" : ""}>{part}</span>
                            <ChevronRight size={10} className="mt-0.5" />
                          </React.Fragment>
                        ))}
                      </div>
                      <span className={`font-bold text-sm ${isSelected ? 'text-[#1E955E]' : 'text-gray-800'}`}>
                        {cat.name}
                      </span>
                    </div>
                    {isSelected && (
                      <div className="flex-shrink-0 w-5 h-5 bg-[#3ED08C] rounded-full flex items-center justify-center shadow-sm mt-1">
                        <Check size={12} className="text-white" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="p-8 text-center">
              <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3">
                <Search size={20} className="text-gray-300" />
              </div>
              <p className="text-sm font-bold text-gray-700">No categories found</p>
              <p className="text-xs text-gray-400 mt-1">Try a different search term</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
