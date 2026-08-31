"use client";
import React, { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import ImageUploader from './ImageUploader';
import { Plus, Trash2 } from 'lucide-react';

const productSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  slug: z.string().min(2, 'Slug is required'),
  description: z.string(),
  categoryId: z.string().min(1, 'Category is required'),
  brandId: z.string().min(1, 'Brand is required'),
  price: z.coerce.number().min(0, 'Price must be positive'),
  offerPrice: z.coerce.number().optional(),
  images: z.array(z.string()).min(1, 'At least one image is required'),
  status: z.enum(['active', 'draft']),
  sizeVariants: z.array(z.object({
    size: z.string().min(1, 'Size is required'),
    sku: z.string().min(1, 'SKU is required'),
    quantity: z.coerce.number().min(0, 'Quantity must be positive'),
  })),
  highlights: z.array(z.object({
    name: z.string(),
    value: z.string(),
  })),
  moreInfo: z.object({
    manufactureInfo: z.string(),
    importerInfo: z.string(),
    packerInfo: z.string(),
    netWeightValue: z.coerce.number(),
    netWeightUnit: z.enum(['g', 'kg', 'ml', 'l']),
    supplierInfo: z.string(),
    contactInfo: z.string(),
    legalDisclaimer: z.string(),
  })
});

type ProductFormValues = z.infer<typeof productSchema>;

interface ProductFormProps {
  initialData?: Partial<ProductFormValues>;
  onSubmit: (data: ProductFormValues) => void;
  onCancel: () => void;
}

export default function ProductForm({ initialData, onSubmit, onCancel }: ProductFormProps) {
  const [activeTab, setActiveTab] = useState<'basic' | 'variants' | 'media' | 'info'>('basic');

  const { register, control, handleSubmit, formState: { errors }, watch, setValue } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: initialData || {
      images: [],
      sizeVariants: [],
      highlights: [],
      status: 'draft',
      moreInfo: {
        netWeightUnit: 'g'
      }
    }
  });

  const { fields: sizeFields, append: appendSize, remove: removeSize } = useFieldArray({ control, name: 'sizeVariants' });
  const { fields: highlightFields, append: appendHighlight, remove: removeHighlight } = useFieldArray({ control, name: 'highlights' });
  
  const currentImages = watch('images');

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col h-full">
      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-6">
        {['basic', 'media', 'variants', 'info'].map((tab) => (
          <button
            key={tab}
            type="button"
            className={`px-6 py-3 font-semibold text-sm capitalize transition-colors ${
              activeTab === tab 
                ? 'border-b-2 border-[#6A43FB] text-[#6A43FB]' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab(tab as any)}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto pr-4 space-y-6">
        {/* BASIC TAB */}
        {activeTab === 'basic' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Product Name</label>
                <input {...register('name')} className="w-full p-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#6A43FB]/20 outline-none" />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Slug</label>
                <input {...register('slug')} className="w-full p-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#6A43FB]/20 outline-none" />
                {errors.slug && <p className="text-red-500 text-xs mt-1">{errors.slug.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Price</label>
                <input type="number" step="0.01" {...register('price')} className="w-full p-2.5 rounded-lg border border-gray-300 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Offer Price</label>
                <input type="number" step="0.01" {...register('offerPrice')} className="w-full p-2.5 rounded-lg border border-gray-300 outline-none" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Description</label>
              <textarea {...register('description')} rows={4} className="w-full p-2.5 rounded-lg border border-gray-300 outline-none" />
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Category ID</label>
                <input {...register('categoryId')} className="w-full p-2.5 rounded-lg border border-gray-300 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Brand ID</label>
                <input {...register('brandId')} className="w-full p-2.5 rounded-lg border border-gray-300 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Status</label>
                <select {...register('status')} className="w-full p-2.5 rounded-lg border border-gray-300 outline-none">
                  <option value="draft">Draft</option>
                  <option value="active">Active (Listed)</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* MEDIA TAB */}
        {activeTab === 'media' && (
          <div>
             <h3 className="text-lg font-bold text-gray-800 mb-4">Product Images</h3>
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
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-800">Size Variants</h3>
              <button type="button" onClick={() => appendSize({ size: '', sku: '', quantity: 0 })} className="text-sm bg-[#E6F9F0] text-[#3ED08C] px-3 py-1.5 rounded-lg font-bold flex items-center gap-1">
                 <Plus size={16} /> Add Size
              </button>
            </div>
            
            {sizeFields.map((field, index) => (
              <div key={field.id} className="flex items-end gap-4 mb-4 bg-gray-50 p-4 rounded-xl border border-gray-100">
                <div className="flex-1">
                  <label className="block text-xs font-bold text-gray-500 mb-1">Size</label>
                  <input {...register(`sizeVariants.${index}.size`)} placeholder="e.g. XL, 10, One Size" className="w-full p-2 text-sm rounded border border-gray-300" />
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-bold text-gray-500 mb-1">SKU</label>
                  <input {...register(`sizeVariants.${index}.sku`)} placeholder="SKU-123" className="w-full p-2 text-sm rounded border border-gray-300" />
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-bold text-gray-500 mb-1">Quantity</label>
                  <input type="number" {...register(`sizeVariants.${index}.quantity`)} className="w-full p-2 text-sm rounded border border-gray-300" />
                </div>
                <button type="button" onClick={() => removeSize(index)} className="p-2 text-red-500 hover:bg-red-50 rounded">
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
            {sizeFields.length === 0 && <p className="text-sm text-gray-400 italic">No variants added yet.</p>}
          </div>
        )}

        {/* INFO TAB */}
        {activeTab === 'info' && (
          <div className="space-y-6">
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-gray-800">Highlights</h3>
                <button type="button" onClick={() => appendHighlight({ name: '', value: '' })} className="text-sm bg-[#E6F9F0] text-[#3ED08C] px-3 py-1.5 rounded-lg font-bold flex items-center gap-1">
                  <Plus size={16} /> Add Highlight
                </button>
              </div>
              {highlightFields.map((field, index) => (
                <div key={field.id} className="flex gap-4 mb-2">
                  <input {...register(`highlights.${index}.name`)} placeholder="Name (e.g. Material)" className="flex-1 p-2 text-sm rounded border border-gray-300" />
                  <input {...register(`highlights.${index}.value`)} placeholder="Value (e.g. 100% Cotton)" className="flex-1 p-2 text-sm rounded border border-gray-300" />
                  <button type="button" onClick={() => removeHighlight(index)} className="p-2 text-red-500"><Trash2 size={18} /></button>
                </div>
              ))}
            </div>

            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Fixed Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Manufacture Info</label>
                  <input {...register('moreInfo.manufactureInfo')} className="w-full p-2.5 rounded-lg border border-gray-300 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Packer Info</label>
                  <input {...register('moreInfo.packerInfo')} className="w-full p-2.5 rounded-lg border border-gray-300 text-sm" />
                </div>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <label className="block text-sm font-bold text-gray-700 mb-1">Net Weight</label>
                    <input type="number" {...register('moreInfo.netWeightValue')} className="w-full p-2.5 rounded-lg border border-gray-300 text-sm" />
                  </div>
                  <div className="w-24">
                    <label className="block text-sm font-bold text-gray-700 mb-1">Unit</label>
                    <select {...register('moreInfo.netWeightUnit')} className="w-full p-2.5 rounded-lg border border-gray-300 text-sm">
                      <option value="g">g</option>
                      <option value="kg">kg</option>
                      <option value="ml">ml</option>
                      <option value="l">l</option>
                    </select>
                  </div>
                </div>
                <div>
                   <label className="block text-sm font-bold text-gray-700 mb-1">Legal Disclaimer</label>
                   <textarea {...register('moreInfo.legalDisclaimer')} rows={2} className="w-full p-2.5 rounded-lg border border-gray-300 text-sm" />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="mt-8 pt-4 border-t border-gray-200 flex justify-end gap-4">
        <button type="button" onClick={onCancel} className="px-6 py-2.5 rounded-full font-bold text-gray-600 hover:bg-gray-100 transition-colors">
          Cancel
        </button>
        <button type="submit" className="px-6 py-2.5 rounded-full font-bold text-white bg-[#6A43FB] hover:bg-[#5926EC] transition-colors shadow-lg shadow-[#6A43FB]/30">
          Save Product
        </button>
      </div>
    </form>
  );
}
