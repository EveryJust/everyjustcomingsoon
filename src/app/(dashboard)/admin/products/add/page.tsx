"use client";
import React, { Suspense } from 'react';
import ProductForm from '@/components/Admin/Products/ProductForm';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import toast from 'react-hot-toast';

function AddProductContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const draftId = searchParams.get('draftId');
  const supabase = createClient();

  const handleSubmit = async (data: any) => {
    const toastId = toast.loading('Saving product to database...');
    try {
      // 1. Insert the main product
      const { data: product, error: productError } = await supabase
        .from('products')
        .insert({
          name: data.name,
          slug: data.slug,
          description: data.description || null,
          price: data.price,
          offer_price: data.offerPrice || null,
          brand_id: data.brandId || null,
          status: data.status,
          is_free_size: data.isFreeSize,
          images: data.images,
          highlights: data.highlights,
          additional_details: data.additionalDetails,
          more_info: data.moreInfo,
        })
        .select()
        .single();

      if (productError) {
        throw new Error(`Product error: ${productError.message}`);
      }

      // 2. Insert category relationships
      if (data.categoryIds && data.categoryIds.length > 0) {
        const categoryInserts = data.categoryIds.map((categoryId: string) => ({
          product_id: product.id,
          category_id: categoryId
        }));
        const { error: catError } = await supabase.from('product_categories').insert(categoryInserts);
        if (catError) {
          await supabase.from('products').delete().eq('id', product.id); // Rollback
          throw new Error(`Categories error: ${catError.message}`);
        }
      }

      // 3. Insert inventory variants
      if (data.sizeVariants && data.sizeVariants.length > 0) {
        const variantInserts = data.sizeVariants.map((variant: any) => ({
          product_id: product.id,
          size: variant.size,
          sku: variant.sku,
          quantity: variant.quantity
        }));
        const { error: varError } = await supabase.from('product_variants').insert(variantInserts);
        if (varError) {
          await supabase.from('products').delete().eq('id', product.id); // Rollback
          if (varError.code === '23505' && varError.message.includes('product_variants_sku_key')) {
            throw new Error(`The SKU you entered is already in use by another product. SKUs must be unique.`);
          }
          throw new Error(`Variants error: ${varError.message}`);
        }
      }

      // 4. Clear the draft once successfully submitted
      if (draftId) {
        await supabase.from('product_drafts').delete().eq('id', draftId);
      } else {
        // Fallback cleanup just in case
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await supabase.from('product_drafts').delete().eq('user_id', user.id);
        }
      }

      toast.success('Product saved successfully!', { id: toastId });
      router.push('/admin/products');
    } catch (error: any) {
      console.error("Error saving product:", error);
      toast.error(`Failed to save: ${error.message || "Unknown error"}`, { id: toastId });
    }
  };

  return (
    <div className="max-w-4xl mx-auto pb-10">
      <div className="mb-6">
         <h1 className="text-2xl font-black text-gray-800 tracking-tight">Add New Product</h1>
         <p className="text-sm text-gray-500 font-medium mt-1">Fill out the details below to list a new item in your store.</p>
      </div>
      
      <div className="mt-8">
        <ProductForm 
          draftId={draftId || undefined}
          onSubmit={handleSubmit} 
          onCancel={() => router.push('/admin/products')} 
        />
      </div>
    </div>
  );
}

export default function AddProductPage() {
  return (
    <Suspense fallback={<div className="p-10 text-center">Loading...</div>}>
      <AddProductContent />
    </Suspense>
  );
}
