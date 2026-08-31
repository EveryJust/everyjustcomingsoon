"use client";
import React, { useState } from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import ImageUploader from './ImageUploader';
import AdminDropdown from '@/components/Admin/AdminDropdown';
import { Plus, Trash2 } from 'lucide-react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { generateSlugSuggestions } from '@/utils/slug';

import { productSchema, type ProductFormValues } from '@/validations/product';

interface ProductFormProps {
  initialData?: Partial<ProductFormValues>;
  onSubmit: (data: ProductFormValues) => void;
  onCancel: () => void;
}

export default function ProductForm({ initialData, onSubmit, onCancel }: ProductFormProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const tabQuery = searchParams.get('tab');
  const validTabs = ['basic', 'media', 'variants', 'info'];
  const activeTab = validTabs.includes(tabQuery as string) ? tabQuery : 'basic';

  const handleTabChange = (tab: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('tab', tab);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const { register, control, handleSubmit, formState: { errors }, watch, setValue } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    mode: 'onChange',
    defaultValues: initialData || {
      images: [],
      sizeVariants: [],
      highlights: [],
      additionalDetails: [],
      status: 'draft',
      moreInfo: {
        netWeightUnit: 'g'
      }
    }
  });

  const watchSlug = watch('slug');

  // State for live slug uniqueness check
  const [slugStatus, setSlugStatus] = useState<'idle' | 'checking' | 'available' | 'taken'>('idle');
  const [slugSuggestions, setSlugSuggestions] = useState<string[]>([]);

  // Simulated live slug uniqueness check
  React.useEffect(() => {
    if (!watchSlug || watchSlug.length < 2 || errors.slug) {
      setSlugStatus('idle');
      setSlugSuggestions([]);
      return;
    }

    setSlugStatus('checking');
    const timer = setTimeout(() => {
      // Simulate API call delay
      if (watchSlug === 'test-product') {
        setSlugStatus('taken');
        setSlugSuggestions(generateSlugSuggestions(watchSlug));
      } else {
        setSlugStatus('available');
        setSlugSuggestions([]);
      }
    }, 600);

    return () => clearTimeout(timer);
  }, [watchSlug, errors.slug]);

  const { fields: sizeFields, append: appendSize, remove: removeSize } = useFieldArray({ control, name: 'sizeVariants' });
  const { fields: highlightFields, append: appendHighlight, remove: removeHighlight } = useFieldArray({ control, name: 'highlights' });
  const { fields: additionalDetailFields, append: appendAdditionalDetail, remove: removeAdditionalDetail } = useFieldArray({ control, name: 'additionalDetails' });
  
  const currentImages = watch('images');

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col">
      {/* Tabs as Pill Buttons */}
      <div className="flex gap-3 mb-6">
        {['basic', 'media', 'variants', 'info'].map((tab) => (
          <button
            key={tab}
            type="button"
            className={`px-6 py-2.5 rounded-full font-bold text-sm capitalize transition-all ${
              activeTab === tab 
                ? 'bg-[#6A43FB] text-white shadow-lg shadow-[#6A43FB]/30 scale-105' 
                : 'bg-white text-gray-500 hover:bg-gray-50 border border-gray-200'
            }`}
            onClick={() => handleTabChange(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Content Wrapped in a Native Card */}
      <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 mb-8">
        {/* BASIC TAB */}
        {activeTab === 'basic' && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Product Name</label>
                <input {...register('name')} className="w-full p-3 rounded-xl border border-gray-200 focus:border-[#6A43FB]/50 focus:ring-2 focus:ring-[#6A43FB]/20 outline-none transition-all shadow-sm" />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Slug</label>
                <div className="relative">
                  <input {...register('slug')} className="w-full p-3 rounded-xl border border-gray-200 focus:border-[#6A43FB]/50 focus:ring-2 focus:ring-[#6A43FB]/20 outline-none transition-all shadow-sm pr-24" />
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

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Price</label>
                <input type="number" step="0.01" {...register('price')} className="w-full p-3 rounded-xl border border-gray-200 focus:border-[#6A43FB]/50 focus:ring-2 focus:ring-[#6A43FB]/20 outline-none transition-all shadow-sm" />
                {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Offer Price</label>
                <input type="number" step="0.01" {...register('offerPrice')} className="w-full p-3 rounded-xl border border-gray-200 focus:border-[#6A43FB]/50 focus:ring-2 focus:ring-[#6A43FB]/20 outline-none transition-all shadow-sm" />
                {errors.offerPrice && <p className="text-red-500 text-xs mt-1">{errors.offerPrice.message}</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Description</label>
              <textarea {...register('description')} rows={4} className="w-full p-3 rounded-xl border border-gray-200 focus:border-[#6A43FB]/50 focus:ring-2 focus:ring-[#6A43FB]/20 outline-none transition-all shadow-sm" />
            </div>
            
            <div className="grid grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Category ID</label>
                <input {...register('categoryId')} className="w-full p-3 rounded-xl border border-gray-200 focus:border-[#6A43FB]/50 focus:ring-2 focus:ring-[#6A43FB]/20 outline-none transition-all shadow-sm" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Brand ID</label>
                <input {...register('brandId')} className="w-full p-3 rounded-xl border border-gray-200 focus:border-[#6A43FB]/50 focus:ring-2 focus:ring-[#6A43FB]/20 outline-none transition-all shadow-sm" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Status</label>
                <Controller
                  name="status"
                  control={control}
                  render={({ field }) => (
                    <AdminDropdown
                      value={field.value}
                      onChange={field.onChange}
                      options={[
                        { label: 'Draft', value: 'draft' },
                        { label: 'Active (Listed)', value: 'active' }
                      ]}
                    />
                  )}
                />
              </div>
            </div>
          </div>
        )}

        {/* MEDIA TAB */}
        {activeTab === 'media' && (
          <div>
             <h3 className="text-xl font-bold text-gray-800 mb-6">Product Images</h3>
             <ImageUploader 
               images={currentImages} 
               onChange={(urls) => setValue('images', urls, { shouldValidate: true })} 
             />
             {errors.images && <p className="text-red-500 text-xs mt-2">{errors.images.message}</p>}
          </div>
        )}

        {/* VARIANTS TAB */}
        {activeTab === 'variants' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-800">Size Variants</h3>
              <button type="button" onClick={() => appendSize({ size: '', sku: '', quantity: 0 })} className="text-sm bg-[#3ED08C] hover:bg-[#32B879] transition-colors text-white px-4 py-2 rounded-xl font-bold flex items-center gap-1 shadow-md shadow-[#3ED08C]/30">
                 <Plus size={16} /> Add Size
              </button>
            </div>
            
            {sizeFields.map((field, index) => (
              <div key={field.id} className="flex items-end gap-4 mb-4 bg-gray-50/50 p-4 rounded-2xl border border-gray-100 transition-all hover:border-gray-200">
                <div className="flex-1">
                  <label className="block text-xs font-bold text-gray-500 mb-1">Size</label>
                  <input {...register(`sizeVariants.${index}.size`)} placeholder="e.g. XL, 10, One Size" className="w-full p-2.5 text-sm rounded-lg border border-gray-200 outline-none focus:border-[#6A43FB]/50" />
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-bold text-gray-500 mb-1">SKU</label>
                  <input {...register(`sizeVariants.${index}.sku`)} placeholder="SKU-123" className="w-full p-2.5 text-sm rounded-lg border border-gray-200 outline-none focus:border-[#6A43FB]/50" />
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-bold text-gray-500 mb-1">Quantity</label>
                  <input type="number" {...register(`sizeVariants.${index}.quantity`)} className="w-full p-2.5 text-sm rounded-lg border border-gray-200 outline-none focus:border-[#6A43FB]/50" />
                </div>
                <button type="button" onClick={() => removeSize(index)} className="p-2.5 text-red-500 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors">
                  <Trash2 size={20} />
                </button>
              </div>
            ))}
            {sizeFields.length === 0 && <p className="text-sm text-gray-400 italic">No variants added yet.</p>}
          </div>
        )}

        {/* INFO TAB */}
        {activeTab === 'info' && (
          <div className="space-y-8">
            <div>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-800">Highlights</h3>
                <button type="button" onClick={() => appendHighlight({ name: '', value: '' })} className="text-sm bg-[#3ED08C] hover:bg-[#32B879] transition-colors text-white px-4 py-2 rounded-xl font-bold flex items-center gap-1 shadow-md shadow-[#3ED08C]/30">
                  <Plus size={16} /> Add Highlight
                </button>
              </div>
              {highlightFields.map((field, index) => (
                <div key={field.id} className="flex gap-4 mb-3">
                  <input {...register(`highlights.${index}.name`)} placeholder="Name (e.g. Material)" className="flex-1 p-3 text-sm rounded-xl border border-gray-200 outline-none focus:border-[#6A43FB]/50 transition-all" />
                  <input {...register(`highlights.${index}.value`)} placeholder="Value (e.g. 100% Cotton)" className="flex-1 p-3 text-sm rounded-xl border border-gray-200 outline-none focus:border-[#6A43FB]/50 transition-all" />
                  <button type="button" onClick={() => removeHighlight(index)} className="p-3 text-red-500 hover:bg-red-50 rounded-xl transition-colors"><Trash2 size={20} /></button>
                </div>
              ))}
              {highlightFields.length === 0 && <p className="text-sm text-gray-400 italic">No highlights added yet.</p>}
            </div>

            <div className="border-t border-gray-100 pt-8">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-800">Additional Details</h3>
                <button type="button" onClick={() => appendAdditionalDetail({ name: '', value: '' })} className="text-sm bg-[#3ED08C] hover:bg-[#32B879] transition-colors text-white px-4 py-2 rounded-xl font-bold flex items-center gap-1 shadow-md shadow-[#3ED08C]/30">
                  <Plus size={16} /> Add Detail
                </button>
              </div>
              {additionalDetailFields.map((field, index) => (
                <div key={field.id} className="flex gap-4 mb-3">
                  <input {...register(`additionalDetails.${index}.name`)} placeholder="Name (e.g. Care Instructions)" className="flex-1 p-3 text-sm rounded-xl border border-gray-200 outline-none focus:border-[#6A43FB]/50 transition-all" />
                  <input {...register(`additionalDetails.${index}.value`)} placeholder="Value (e.g. Machine Wash Cold)" className="flex-1 p-3 text-sm rounded-xl border border-gray-200 outline-none focus:border-[#6A43FB]/50 transition-all" />
                  <button type="button" onClick={() => removeAdditionalDetail(index)} className="p-3 text-red-500 hover:bg-red-50 rounded-xl transition-colors"><Trash2 size={20} /></button>
                </div>
              ))}
              {additionalDetailFields.length === 0 && <p className="text-sm text-gray-400 italic">No additional details added yet.</p>}
            </div>

            <div className="border-t border-gray-100 pt-8">
              <h3 className="text-xl font-bold text-gray-800 mb-6">Fixed Information</h3>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Manufacture Info</label>
                  <input {...register('moreInfo.manufactureInfo')} className="w-full p-3 rounded-xl border border-gray-200 text-sm outline-none focus:border-[#6A43FB]/50 transition-all shadow-sm" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Packer Info</label>
                  <input {...register('moreInfo.packerInfo')} className="w-full p-3 rounded-xl border border-gray-200 text-sm outline-none focus:border-[#6A43FB]/50 transition-all shadow-sm" />
                </div>
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="block text-sm font-bold text-gray-700 mb-1">Net Weight / Volume</label>
                    <input type="number" {...register('moreInfo.netWeightValue')} className="w-full p-3 rounded-xl border border-gray-200 text-sm outline-none focus:border-[#6A43FB]/50 transition-all shadow-sm h-[48px]" />
                  </div>
                  <div className="w-[120px]">
                    <label className="block text-sm font-bold text-gray-700 mb-1">Unit</label>
                    <Controller
                      name="moreInfo.netWeightUnit"
                      control={control}
                      render={({ field }) => (
                        <div className="grid grid-cols-2 gap-2">
                          {['g', 'kg', 'ml', 'l'].map((unit) => (
                            <button
                              key={unit}
                              type="button"
                              onClick={() => field.onChange(unit)}
                              className={`py-1.5 text-xs font-bold rounded-full border transition-all flex items-center justify-center ${
                                field.value === unit 
                                  ? 'bg-[#6A43FB] text-white border-[#6A43FB] shadow-md shadow-[#6A43FB]/30' 
                                  : 'bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100 hover:border-gray-300'
                              }`}
                            >
                              {unit}
                            </button>
                          ))}
                        </div>
                      )}
                    />
                  </div>
                </div>
                <div>
                   <label className="block text-sm font-bold text-gray-700 mb-1">Legal Disclaimer</label>
                   <textarea {...register('moreInfo.legalDisclaimer')} rows={2} className="w-full p-3 rounded-xl border border-gray-200 text-sm outline-none focus:border-[#6A43FB]/50 transition-all shadow-sm" />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Floating Footer Actions */}
      <div className="flex justify-end gap-4">
        <button type="button" onClick={onCancel} className="px-8 py-3 rounded-xl font-bold text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 transition-colors shadow-sm">
          Cancel
        </button>
        <button type="submit" className="px-8 py-3 rounded-xl font-bold text-white bg-[#6A43FB] hover:bg-[#5926EC] transition-colors shadow-lg shadow-[#6A43FB]/30">
          Save Product
        </button>
      </div>
    </form>
  );
}
