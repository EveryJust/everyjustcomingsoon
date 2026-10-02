'use client';

import React from 'react';
import { ShoppingBag, Award, TrendingUp } from 'lucide-react';
import { Order } from '@/utils/supabase/adminData';
import { formatCurrency } from '@/utils/currency';

interface TopProductsProps {
  orders: Order[];
}

export default function TopProducts({ orders }: TopProductsProps) {
  // Aggregate products from order items
  const productSalesMap = new Map<string, { name: string; sales: number; revenue: number; image: string; category: string }>();

  orders.forEach(order => {
    (order.order_items || []).forEach(item => {
      const existing = productSalesMap.get(item.product_name) || {
        name: item.product_name,
        sales: 0,
        revenue: 0,
        image: item.product_image || '/dash_camera.png',
        category: 'Accessories'
      };
      existing.sales += item.quantity || 1;
      existing.revenue += Number(item.total_price || (item.unit_price * item.quantity) || 0);
      productSalesMap.set(item.product_name, existing);
    });
  });

  let topList = Array.from(productSalesMap.values()).sort((a, b) => b.revenue - a.revenue);

  const medalColors = ['bg-amber-400 text-amber-900', 'bg-slate-300 text-slate-800', 'bg-amber-600 text-white'];

  return (
    <div className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 h-full flex flex-col justify-between">
      <div className="flex justify-between items-center mb-5">
        <div>
          <h3 className="font-bold text-gray-900 text-lg">Top Performing Products</h3>
          <p className="text-xs text-gray-400 mt-0.5">Ranked by gross sales volume</p>
        </div>
        <div className="p-2 rounded-xl bg-purple-50 text-[#6A43FB]">
          <TrendingUp size={18} />
        </div>
      </div>
      
      <div className="space-y-3.5 flex-1 flex flex-col justify-center">
        {topList.length === 0 ? (
          <div className="py-12 text-center">
            <div className="w-12 h-12 rounded-2xl bg-gray-50 text-gray-400 mx-auto flex items-center justify-center mb-3">
              <ShoppingBag size={22} />
            </div>
            <p className="text-xs font-bold text-gray-700">No Sales Recorded Yet</p>
            <p className="text-[11px] text-gray-400 mt-1 max-w-[200px] mx-auto">
              Bestselling products will automatically appear as real orders are placed.
            </p>
          </div>
        ) : (
          topList.slice(0, 4).map((product, idx) => (
          <div 
            key={idx} 
            className="flex items-center justify-between p-3 rounded-2xl hover:bg-gray-50 transition-all border border-transparent hover:border-gray-100 group"
          >
            <div className="flex items-center gap-3.5">
              <div className="relative">
                <div className="w-12 h-12 rounded-xl bg-gray-100 overflow-hidden border border-gray-200 flex-shrink-0 flex items-center justify-center p-1">
                  <img 
                    src={product.image} 
                    alt={product.name} 
                    className="w-full h-full object-contain group-hover:scale-105 transition-transform" 
                  />
                </div>
                {idx < 3 && (
                  <span className={`absolute -top-1.5 -left-1.5 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black shadow-sm ${medalColors[idx]}`}>
                    {idx + 1}
                  </span>
                )}
              </div>
              <div className="min-w-0 max-w-[150px] sm:max-w-[190px]">
                <h4 className="font-bold text-sm text-gray-800 truncate group-hover:text-primary transition-colors">
                  {product.name}
                </h4>
                <p className="text-[11px] text-gray-400 font-medium truncate">{product.category}</p>
              </div>
            </div>
            <div className="text-right flex-shrink-0">
              <h4 className="font-black text-sm text-gray-900">{formatCurrency(product.revenue)}</h4>
              <p className="text-[11px] text-emerald-600 font-semibold">{product.sales} sold</p>
            </div>
          </div>
        ))
      )}
      </div>
    </div>
  );
}
