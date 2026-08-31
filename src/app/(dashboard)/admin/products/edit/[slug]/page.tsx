"use client";
import React, { useEffect, useState } from 'react';
import ProductForm from '@/components/Admin/Products/ProductForm';
import { useRouter, useParams } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import toast from 'react-hot-toast';

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const [productData, setProductData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function fetchProduct() {
      if (!params.slug) return;
      
      const { data: product, error } = await supabase
        .from('products')
        .select(`
          *,
          product_categories ( category_id ),
          product_variants ( size, sku, quantity )
        `)
        .eq('slug', params.slug)
        .single();

      if (error || !product) {
        toast.error('Failed to load product');
        console.error(error);
        router.push('/admin/products');
        return;
      }

      // Map DB data to form format
      setProductData({
        ...product,
        categoryIds: product.product_categories?.map((pc: any) => pc.category_id) || [],
        sizeVariants: product.product_variants?.length > 0 ? product.product_variants : [{ size: 'Free Size', sku: '', quantity: 100 }],
        offerPrice: product.offer_price || 0,
        brandId: product.brand_id || '',
        isFreeSize: product.is_free_size,
        images: product.images || [],
        highlights: product.highlights || [],
        additionalDetails: product.additional_details || [],
        moreInfo: product.more_info || { netWeightUnit: 'g' }
      });
      setLoading(false);
    }
    fetchProduct();
  }, [params.slug, router, supabase]);

  const handleSubmit = async (data: any) => {
    const toastId = toast.loading('Updating product...');
    try {
      // 1. Update product main table
      const { error: productError } = await supabase
        .from('products')
        .update({
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
        .eq('id', productData.id);

      if (productError) throw new Error(`Product error: ${productError.message}`);

      // 2. Update Categories (delete all then insert new)
      await supabase.from('product_categories').delete().eq('product_id', productData.id);
      if (data.categoryIds && data.categoryIds.length > 0) {
        const categoryInserts = data.categoryIds.map((categoryId: string) => ({
          product_id: productData.id,
          category_id: categoryId
        }));
        const { error: catError } = await supabase.from('product_categories').insert(categoryInserts);
        if (catError) throw new Error(`Categories error: ${catError.message}`);
      }

      // 3. Update Variants (delete all then insert new)
      await supabase.from('product_variants').delete().eq('product_id', productData.id);
      if (data.sizeVariants && data.sizeVariants.length > 0) {
        const variantInserts = data.sizeVariants.map((variant: any) => ({
          product_id: productData.id,
          size: variant.size,
          sku: variant.sku,
          quantity: variant.quantity
        }));
        const { error: varError } = await supabase.from('product_variants').insert(variantInserts);
        if (varError) {
          if (varError.code === '23505' && varError.message.includes('product_variants_sku_key')) {
            throw new Error(`The SKU you entered is already in use by another product. SKUs must be unique.`);
          }
          throw new Error(`Variants error: ${varError.message}`);
        }
      }

      toast.success('Product updated successfully!', { id: toastId });
      router.push('/admin/products');
    } catch (error: any) {
      console.error("Error updating product:", error);
      toast.error(`Failed to update: ${error.message || "Unknown error"}`, { id: toastId });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-10 h-10 border-4 border-[#6A43FB] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto pb-10">
      <div className="mb-6">
         <h1 className="text-2xl font-black text-gray-800 tracking-tight">Edit Product</h1>
         <p className="text-sm text-gray-500 font-medium mt-1">Update the details for this item.</p>
      </div>
      
      <div className="mt-8">
        <ProductForm 
          initialData={productData}
          onSubmit={handleSubmit} 
          onCancel={() => router.push('/admin/products')} 
        />
      </div>
    </div>
  );
}
