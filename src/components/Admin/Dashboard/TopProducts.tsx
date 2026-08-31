import React from 'react';
import { ShoppingBag } from 'lucide-react';

export default function TopProducts() {
  const products = [
    { name: 'Wireless Headphones', category: 'Electronics', price: '₹120', sales: 345, color: 'bg-purple-500' },
    { name: 'Cotton T-Shirt', category: 'Clothing', price: '₹25', sales: 290, color: 'bg-green-500' },
    { name: 'Smart Watch', category: 'Electronics', price: '₹199', sales: 210, color: 'bg-yellow-500' },
    { name: 'Running Shoes', category: 'Footwear', price: '₹85', sales: 150, color: 'bg-pink-500' },
  ];

  return (
    <div className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-bold text-gray-800 text-lg">Top Products</h3>
      </div>
      
      <div className="space-y-4 flex-1">
        {products.map((product, idx) => (
          <div key={idx} className="flex items-center justify-between p-3 rounded-2xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100">
            <div className="flex items-center gap-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-md ${product.color}`}>
                <ShoppingBag size={18} />
              </div>
              <div>
                <h4 className="font-bold text-sm text-gray-800">{product.name}</h4>
                <p className="text-xs text-gray-400 font-medium">{product.category}</p>
              </div>
            </div>
            <div className="text-right">
              <h4 className="font-bold text-sm text-gray-800">{product.price}</h4>
              <p className="text-xs text-gray-400 font-medium">{product.sales} sales</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
