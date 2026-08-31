"use client";
import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { Edit2, ArrowLeft, Package, Tag, Info, AlertTriangle } from 'lucide-react';
import Link from 'next/link';

export default function ProductDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function fetchProduct() {
      if (!params.slug) return;
      
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          product_categories ( categories (name) ),
          product_variants ( size, sku, quantity )
        `)
        .eq('slug', params.slug)
        .single();

      if (error || !data) {
        console.error(error);
        router.push('/admin/products');
        return;
      }
      setProduct(data);
      setLoading(false);
    }
    fetchProduct();
  }, [params.slug, router, supabase]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[70vh]">
        <div className="w-12 h-12 border-4 border-[#6A43FB] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!product) return null;

  const totalStock = product.product_variants?.reduce((sum: number, v: any) => sum + (v.quantity || 0), 0) || 0;
  const categories = product.product_categories?.map((pc: any) => pc.categories?.name).filter(Boolean).join(', ') || 'Uncategorized';

  return (
    <div className="max-w-5xl mx-auto pb-12">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <button onClick={() => router.push('/admin/products')} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500">
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-3xl font-black text-gray-800 tracking-tight flex items-center gap-3">
              {product.name}
              <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${product.status === 'active' ? 'bg-[#E6F9F0] text-[#3ED08C]' : 'bg-gray-200 text-gray-500'}`}>
                {product.status}
              </span>
            </h1>
            <p className="text-sm text-gray-500 font-medium mt-1">Slug: {product.slug}</p>
          </div>
        </div>
        <Link 
          href={`/admin/products/edit/${product.slug}`}
          className="bg-[#6A43FB] hover:bg-[#5926EC] text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-[#6A43FB]/30 flex items-center gap-2 transition-all"
        >
          <Edit2 size={18} /> Edit Product
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Images & Primary Info */}
        <div className="lg:col-span-2 space-y-8">
          {/* Main Image Gallery */}
          <div className="bg-white rounded-3xl p-2 shadow-sm border border-gray-100">
            <div className="aspect-[16/9] md:aspect-[21/9] rounded-2xl bg-gray-100 overflow-hidden relative">
              {product.images && product.images.length > 0 ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400 font-bold">No Image</div>
              )}
            </div>
            {product.images && product.images.length > 1 && (
              <div className="flex gap-4 p-4 overflow-x-auto">
                {product.images.slice(1).map((img: string, i: number) => (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img key={i} src={img} alt={`Gallery ${i}`} className="w-24 h-24 rounded-xl object-cover border-2 border-transparent hover:border-[#6A43FB] transition-colors cursor-pointer" />
                ))}
              </div>
            )}
          </div>

          {/* Description */}
          {product.description && (
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Info className="text-[#6A43FB]" size={20} /> Description
              </h3>
              <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">{product.description}</p>
            </div>
          )}

          {/* Highlights & Additional Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {product.highlights && product.highlights.length > 0 && (
              <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <Tag className="text-[#6A43FB]" size={20} /> Highlights
                </h3>
                <ul className="space-y-3">
                  {product.highlights.map((h: any, i: number) => (
                    <li key={i} className="flex gap-2">
                      <span className="font-bold text-gray-700 min-w-[100px]">{h.name}:</span>
                      <span className="text-gray-600">{h.value}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {product.additional_details && product.additional_details.length > 0 && (
              <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <AlertTriangle className="text-[#6A43FB]" size={20} /> Specifications
                </h3>
                <ul className="space-y-3">
                  {product.additional_details.map((d: any, i: number) => (
                    <li key={i} className="flex gap-2">
                      <span className="font-bold text-gray-700 min-w-[100px]">{d.name}:</span>
                      <span className="text-gray-600">{d.value}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Pricing & Inventory */}
        <div className="space-y-8">
          {/* Price Card */}
          <div className="bg-gradient-to-br from-[#6A43FB] to-[#5926EC] rounded-3xl p-8 text-white shadow-lg shadow-[#6A43FB]/20">
            <h3 className="text-white/80 font-bold mb-2">Selling Price</h3>
            <div className="text-5xl font-black mb-4">₹{product.price.toFixed(2)}</div>
            
            {product.offer_price && (
              <div className="flex items-center gap-2 bg-white/10 p-3 rounded-xl backdrop-blur-sm">
                <span className="font-bold text-white/80">Offer Price:</span>
                <span className="font-black text-yellow-300">₹{product.offer_price.toFixed(2)}</span>
              </div>
            )}
            
            <div className="mt-6 pt-6 border-t border-white/20">
              <div className="text-sm font-bold text-white/80 mb-1">Categories</div>
              <div className="font-medium text-white">{categories}</div>
            </div>
          </div>

          {/* Inventory Card */}
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
            <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <Package className="text-[#3ED08C]" size={20} /> Inventory
            </h3>
            
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl mb-6 border border-gray-100">
              <span className="font-bold text-gray-600">Total Stock</span>
              <span className={`text-2xl font-black ${totalStock > 0 ? 'text-[#3ED08C]' : 'text-red-500'}`}>
                {totalStock}
              </span>
            </div>

            <h4 className="font-bold text-gray-700 mb-3 text-sm uppercase tracking-wider">Variants</h4>
            <div className="space-y-3">
              {product.product_variants?.map((v: any, i: number) => (
                <div key={i} className="flex items-center justify-between p-3 border border-gray-100 rounded-xl hover:border-gray-200 transition-colors">
                  <div>
                    <div className="font-bold text-gray-800">{v.size}</div>
                    <div className="text-xs text-gray-400 font-mono mt-0.5">{v.sku}</div>
                  </div>
                  <div className={`font-black ${v.quantity > 0 ? 'text-gray-800' : 'text-red-500'}`}>
                    {v.quantity} qty
                  </div>
                </div>
              ))}
              {(!product.product_variants || product.product_variants.length === 0) && (
                <div className="text-sm text-gray-400 italic">No variants configured.</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
