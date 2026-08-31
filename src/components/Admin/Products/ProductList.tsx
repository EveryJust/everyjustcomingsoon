"use client";
import React from 'react';
import { Plus, Edit2, Trash2, EyeOff } from 'lucide-react';
import Link from 'next/link';

export default function ProductList() {
  // Empty data as requested to remove fake data
  const products: any[] = [];

  return (
    <div className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] min-h-[500px]">
      <div className="flex justify-between items-center mb-6">
        <div>
           <h3 className="font-bold text-gray-800 text-lg">Product Inventory</h3>
           <p className="text-sm text-gray-400">Manage all your store items here.</p>
        </div>
        <Link 
           href="/admin/products/add"
           className="bg-[#6A43FB] hover:bg-[#5926EC] text-white px-5 py-2.5 rounded-full text-sm font-bold shadow-lg shadow-[#6A43FB]/30 flex items-center gap-2 transition-all"
        >
          <Plus size={18} />
          Add Product
        </Link>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="text-xs text-gray-400 uppercase tracking-wider border-b border-gray-100">
              <th className="pb-3 font-semibold px-4">Product</th>
              <th className="pb-3 font-semibold">Category</th>
              <th className="pb-3 font-semibold">Price</th>
              <th className="pb-3 font-semibold">Status</th>
              <th className="pb-3 font-semibold text-right px-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-12 text-center text-gray-400 font-medium">
                  No products found. Click "Add Product" to create one.
                </td>
              </tr>
            ) : (
              products.map((product) => (
                <tr key={product.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors group">
                  <td className="py-4 px-4 flex items-center gap-3">
                     <div className="w-12 h-12 rounded-xl bg-gray-100 overflow-hidden">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={product.image} alt={product.name} className="w-full h-full object-cover opacity-80" />
                     </div>
                     <span className="text-sm font-bold text-gray-800 max-wxs truncate">{product.name}</span>
                  </td>
                  <td className="py-4 text-sm font-medium text-gray-500">{product.category}</td>
                  <td className="py-4 text-sm font-bold text-gray-800">${product.price.toFixed(2)}</td>
                  <td className="py-4">
                     <span className={`px-3 py-1 rounded-full text-xs font-bold ${product.status === 'active' ? 'bg-[#E6F9F0] text-[#3ED08C]' : 'bg-gray-100 text-gray-500'}`}>
                        {product.status.toUpperCase()}
                     </span>
                  </td>
                  <td className="py-4 px-4 text-right">
                     <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Link href={`/admin/products/edit/${product.id}`} className="p-2 text-gray-400 hover:text-[#6A43FB] hover:bg-[#6A43FB]/10 rounded-lg transition-colors" title="Edit">
                           <Edit2 size={16} />
                        </Link>
                        <button className="p-2 text-gray-400 hover:text-yellow-500 hover:bg-yellow-50 rounded-lg transition-colors" title="Unlist">
                           <EyeOff size={16} />
                        </button>
                        <button className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
                           <Trash2 size={16} />
                        </button>
                     </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
