"use client";
import React, { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, EyeOff } from 'lucide-react';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/client';
import toast from 'react-hot-toast';

export default function ProductList() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('products')
      .select(`
        id,
        name,
        slug,
        price,
        status,
        images,
        product_categories( categories(name) ),
        product_variants( quantity )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      toast.error('Failed to load products');
      console.error(error);
    } else if (data) {
      const mapped = data.map(p => ({
        id: p.id,
        name: p.name,
        slug: p.slug,
        price: p.price,
        status: p.status,
        image: p.images?.[0] || '',
        category: p.product_categories?.map((pc: any) => pc.categories?.name).filter(Boolean).join(', ') || 'Uncategorized',
        stock: p.product_variants?.reduce((sum: number, v: any) => sum + (v.quantity || 0), 0) || 0
      }));
      setProducts(mapped);
    }
    setLoading(false);
  };

  const deleteProduct = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    
    const toastId = toast.loading('Deleting product...');
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) {
      toast.error(`Delete failed: ${error.message}`, { id: toastId });
    } else {
      toast.success('Product deleted', { id: toastId });
      setProducts(products.filter(p => p.id !== id));
    }
  };

  const toggleStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'draft' : 'active';
    const toastId = toast.loading('Updating status...');
    const { error } = await supabase.from('products').update({ status: newStatus }).eq('id', id);
    if (error) {
      toast.error(`Update failed: ${error.message}`, { id: toastId });
    } else {
      toast.success(`Product marked as ${newStatus}`, { id: toastId });
      setProducts(products.map(p => p.id === id ? { ...p, status: newStatus } : p));
    }
  };

  return (
    <div className="mb-10">
      <div className="flex justify-between items-center mb-8">
        <div>
           <h3 className="font-black text-gray-800 text-3xl tracking-tight">Product Inventory</h3>
           <p className="text-sm text-gray-500 font-medium mt-1">Manage all your store items here.</p>
        </div>
        <Link 
           href="/admin/products/add"
           className="bg-[#6A43FB] hover:bg-[#5926EC] text-white px-6 py-3 rounded-xl text-sm font-bold shadow-lg shadow-[#6A43FB]/30 flex items-center gap-2 transition-all"
        >
          <Plus size={18} />
          Add Product
        </Link>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64 bg-white rounded-3xl shadow-sm border border-gray-100">
          <div className="w-10 h-10 border-4 border-[#6A43FB] border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : products.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center shadow-sm border border-gray-100 flex flex-col items-center">
          <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
            <EyeOff className="text-gray-300" size={32} />
          </div>
          <h3 className="text-lg font-bold text-gray-800 mb-2">No products found</h3>
          <p className="text-gray-400 font-medium mb-6">You haven't listed any items in your store yet.</p>
          <Link href="/admin/products/add" className="text-[#6A43FB] font-bold hover:underline">
            + Create your first product
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
          {products.map((product) => (
            <div key={product.id} className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 group flex flex-col relative">
              {/* Image Hero (Square aspect for tighter look) */}
              <div className="relative aspect-square bg-gray-50 overflow-hidden">
                {product.image ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-100/50">
                    <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">No Image</span>
                  </div>
                )}
                
                {/* Minimal Badges */}
                <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                  <span className={`px-2.5 py-1 rounded-lg text-[9px] font-bold uppercase tracking-widest backdrop-blur-md shadow-sm ${product.status === 'active' ? 'bg-black/70 text-white' : 'bg-white/90 text-gray-700'}`}>
                    {product.status}
                  </span>
                  {product.stock <= 0 && (
                    <span className="px-2.5 py-1 rounded-lg text-[9px] font-bold uppercase tracking-widest bg-red-500/90 text-white backdrop-blur-md shadow-sm">
                      Out of Stock
                    </span>
                  )}
                </div>

                {/* Hover Actions Overlay */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2 backdrop-blur-[2px]">
                  <Link href={`/admin/products/${product.slug}`} className="w-9 h-9 bg-white text-gray-800 rounded-full flex items-center justify-center hover:scale-110 hover:text-[#6A43FB] transition-all shadow-lg" title="View Details">
                     <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
                  </Link>
                  <Link href={`/admin/products/edit/${product.slug}`} className="w-9 h-9 bg-white text-gray-800 rounded-full flex items-center justify-center hover:scale-110 hover:text-[#6A43FB] transition-all shadow-lg" title="Edit">
                     <Edit2 size={16} strokeWidth={2.5} />
                  </Link>
                  <button onClick={() => toggleStatus(product.id, product.status)} className="w-9 h-9 bg-white text-gray-800 rounded-full flex items-center justify-center hover:scale-110 hover:text-yellow-600 transition-all shadow-lg" title={product.status === 'active' ? 'Set Draft' : 'Set Active'}>
                     <EyeOff size={16} strokeWidth={2.5} />
                  </button>
                  <button onClick={() => deleteProduct(product.id)} className="w-9 h-9 bg-white text-gray-800 rounded-full flex items-center justify-center hover:scale-110 hover:text-red-500 transition-all shadow-lg" title="Delete">
                     <Trash2 size={16} strokeWidth={2.5} />
                  </button>
                </div>
              </div>

              {/* Clean Minimalist Content */}
              <div className="p-4 flex-1 flex flex-col bg-white z-10 relative">
                <div className="text-[10px] font-bold text-[#6A43FB] mb-1.5 uppercase tracking-wider line-clamp-1">
                  {product.category}
                </div>
                
                <h3 className="font-bold text-gray-900 text-[13px] leading-snug mb-3 line-clamp-2 group-hover:text-[#6A43FB] transition-colors">{product.name}</h3>
                
                <div className="mt-auto pt-3 flex items-end justify-between border-t border-gray-50">
                  <div>
                    <div className="font-black text-gray-900 text-[15px] tracking-tight">₹{product.price.toFixed(2)}</div>
                  </div>
                  <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">
                    {product.stock > 0 ? `${product.stock} in stock` : 'Sold out'}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
