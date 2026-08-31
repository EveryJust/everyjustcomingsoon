"use client";
import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import AdminDropdown from '@/components/Admin/AdminDropdown';
import SingleImageUploader from './SingleImageUploader';
import { generateSlugSuggestions } from '@/utils/slug';
import { categorySchema, type CategoryFormValues } from '@/validations/category';

interface CategoryFormProps {
  initialData?: Partial<CategoryFormValues>;
  onSubmit: (data: CategoryFormValues) => void;
  onCancel: () => void;
  categories: { id: string; name: string }[]; // For parent category selection
}

export default function CategoryForm({ initialData, onSubmit, onCancel, categories }: CategoryFormProps) {
  const [slugStatus, setSlugStatus] = useState<'idle' | 'checking' | 'available' | 'taken'>('idle');
  const [slugSuggestions, setSlugSuggestions] = useState<string[]>([]);

  const { register, control, handleSubmit, formState: { errors }, watch, setValue } = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    mode: 'onChange',
    defaultValues: initialData || {
      imageUrl: '',
      isActive: true,
      parentId: null
    }
  });

  const watchSlug = watch('slug');

  // Simulated live slug uniqueness check
  useEffect(() => {
    if (!watchSlug || watchSlug.length < 2 || errors.slug) {
      setSlugStatus('idle');
      setSlugSuggestions([]);
      return;
    }

    setSlugStatus('checking');
    const timer = setTimeout(() => {
      // Simulate API call delay
      if (watchSlug === 'test-category') {
        setSlugStatus('taken');
        setSlugSuggestions(generateSlugSuggestions(watchSlug));
      } else {
        setSlugStatus('available');
        setSlugSuggestions([]);
      }
    }, 600);

    return () => clearTimeout(timer);
  }, [watchSlug, errors.slug]);

  const currentImage = watch('imageUrl');

  // Map categories for the dropdown
  const parentOptions = [
    { label: 'None (Main Category)', value: '' },
    ...categories.map(c => ({ label: c.name, value: c.id }))
  ];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col">
      <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 mb-8">
        <h2 className="text-xl font-bold text-gray-800 mb-6">Category Details</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Category Name</label>
            <input 
              {...register('name')} 
              className="w-full p-3 rounded-xl border border-gray-200 focus:border-[#6A43FB]/50 focus:ring-2 focus:ring-[#6A43FB]/20 outline-none transition-all shadow-sm" 
              placeholder="e.g., Electronics"
            />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
          </div>
          
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Slug</label>
            <div className="relative">
              <input 
                {...register('slug')} 
                className="w-full p-3 rounded-xl border border-gray-200 focus:border-[#6A43FB]/50 focus:ring-2 focus:ring-[#6A43FB]/20 outline-none transition-all shadow-sm pr-24" 
                placeholder="e.g., electronics"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center">
                {slugStatus === 'checking' && <span className="text-xs font-bold text-gray-400">Checking...</span>}
                {slugStatus === 'available' && <span className="text-xs font-bold text-[#3ED08C] bg-[#E6F9F0] px-2 py-1 rounded-md">Available</span>}
                {slugStatus === 'taken' && <span className="text-xs font-bold text-red-500 bg-red-50 px-2 py-1 rounded-md">Taken</span>}
              </div>
            </div>
            {errors.slug && <p className="text-red-500 text-xs mt-1">{errors.slug.message}</p>}
            {!errors.slug && slugStatus === 'taken' && (
              <div className="mt-2">
                <p className="text-red-500 text-xs mb-1.5 font-medium">This slug is already in use. Try one of these:</p>
                <div className="flex flex-wrap gap-2">
                  {slugSuggestions.map((suggestion) => (
                    <button
                      key={suggestion}
                      type="button"
                      onClick={() => setValue('slug', suggestion, { shouldValidate: true, shouldDirty: true })}
                      className="text-xs font-bold bg-white text-[#6A43FB] border border-[#6A43FB]/30 px-3 py-1.5 rounded-full hover:bg-[#6A43FB]/5 transition-colors"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-bold text-gray-700 mb-1">Description</label>
          <textarea 
            {...register('description')} 
            rows={3} 
            className="w-full p-3 rounded-xl border border-gray-200 focus:border-[#6A43FB]/50 focus:ring-2 focus:ring-[#6A43FB]/20 outline-none transition-all shadow-sm" 
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Parent Category</label>
            <p className="text-xs text-gray-400 mb-2">Leave as None to create a main category.</p>
            <Controller
              name="parentId"
              control={control}
              render={({ field }) => (
                <AdminDropdown
                  value={field.value || ''}
                  onChange={(val) => field.onChange(val === '' ? null : val)}
                  options={parentOptions}
                />
              )}
            />
          </div>
          
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Status</label>
            <p className="text-xs text-gray-400 mb-2">Unlisted categories will not appear on the storefront.</p>
            <Controller
              name="isActive"
              control={control}
              render={({ field }) => (
                <AdminDropdown
                  value={field.value ? 'true' : 'false'}
                  onChange={(val) => field.onChange(val === 'true')}
                  options={[
                    { label: 'Active (Listed)', value: 'true' },
                    { label: 'Draft (Unlisted)', value: 'false' }
                  ]}
                />
              )}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1">Category Image</label>
          <p className="text-xs text-gray-400 mb-4">Upload a transparent PNG to be displayed on category cards.</p>
          <SingleImageUploader 
            image={currentImage}
            onChange={(url) => setValue('imageUrl', url, { shouldValidate: true })}
            onRemove={() => setValue('imageUrl', '', { shouldValidate: true })}
          />
          {errors.imageUrl && <p className="text-red-500 text-xs mt-2">{errors.imageUrl.message}</p>}
        </div>
      </div>

      <div className="flex justify-end gap-4">
        <button type="button" onClick={onCancel} className="px-8 py-3 rounded-xl font-bold text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 transition-colors shadow-sm">
          Cancel
        </button>
        <button type="submit" className="px-8 py-3 rounded-xl font-bold text-white bg-[#6A43FB] hover:bg-[#5926EC] transition-colors shadow-lg shadow-[#6A43FB]/30">
          Save Category
        </button>
      </div>
    </form>
  );
}
