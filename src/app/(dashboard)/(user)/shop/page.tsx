import React from 'react';
import ProductCard from '@/components/ProductCard';
import { MAJOR_CATEGORIES } from '@/utils/category';

export default function ShopPage() {
  // Mock Data for the grid
  const mockProducts = Array.from({ length: 12 }).map((_, i) => ({
    id: i,
    title: `Premium Item ${i + 1} - High Quality Material`,
    price: `$${(Math.random() * 100 + 20).toFixed(2)}`,
    originalPrice: Math.random() > 0.5 ? `$${(Math.random() * 50 + 150).toFixed(2)}` : undefined,
    rating: Math.floor(Math.random() * 3) + 3,
    status: Math.random() > 0.8 ? 'SOLD OUT' : 'ADD TO CART',
    discount: Math.random() > 0.7 ? '-20%' : undefined,
    image: ['/dash_camera.png', '/turbo_charger.png', '/promo_top_banner.png', '/promo_bottom_banner.png'][i % 4]
  })) as any;

  return (
    <div className="font-sans text-gray-900 bg-white">
      {/* Page Header */}
      <div className="bg-gray-100 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 lg:py-20 text-center">
          <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tight text-gray-900 mb-4">
            Shop Our Collection
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto text-lg">
            Discover thousands of premium products from verified brands and trusted sellers worldwide.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 flex flex-col lg:flex-row gap-10">
        
        {/* Sidebar */}
        <aside className="w-full lg:w-1/4 flex-shrink-0">
          {/* Categories Filter */}
          <div className="mb-10">
            <h3 className="font-bold text-lg uppercase mb-4 pb-2 border-b border-gray-200">Categories</h3>
            <ul className="space-y-3">
              {MAJOR_CATEGORIES.map((cat) => (
                <li key={cat.id}>
                  <a href={`/category/${cat.slug}`} className="text-gray-600 hover:text-primary transition-colors font-medium text-sm flex items-center justify-between">
                    <span>{cat.name}</span>
                    <svg className="w-4 h-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Price Filter */}
          <div className="mb-10">
            <h3 className="font-bold text-lg uppercase mb-4 pb-2 border-b border-gray-200">Filter By Price</h3>
            <div className="space-y-4">
              <input type="range" className="w-full accent-primary" min="0" max="1000" />
              <div className="flex items-center justify-between text-sm text-gray-600 font-medium">
                <span>$0</span>
                <span>$1000+</span>
              </div>
              <button className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold py-2 rounded-sm text-xs tracking-wider transition-colors">
                APPLY FILTER
              </button>
            </div>
          </div>
          
          {/* Brands Filter */}
          <div className="mb-10">
            <h3 className="font-bold text-lg uppercase mb-4 pb-2 border-b border-gray-200">Top Brands</h3>
            <div className="space-y-3">
              {['Nike', 'Sony', 'Samsung', 'Lego', 'Under Armour'].map((brand) => (
                <label key={brand} className="flex items-center gap-3 cursor-pointer group">
                  <input type="checkbox" className="w-4 h-4 rounded-sm border-gray-300 text-primary focus:ring-primary accent-primary" />
                  <span className="text-sm font-medium text-gray-600 group-hover:text-primary transition-colors">{brand}</span>
                </label>
              ))}
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="w-full lg:w-3/4">
          
          {/* Toolbar */}
          <div className="flex flex-col sm:flex-row justify-between items-center bg-gray-50 p-4 rounded-sm border border-gray-100 mb-8 gap-4">
            <p className="text-sm text-gray-500 font-medium">Showing 1–12 of 145 results</p>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500 font-medium">Sort by:</span>
              <select className="border border-gray-300 text-gray-700 text-sm rounded-sm px-3 py-1.5 focus:outline-none focus:border-primary cursor-pointer bg-white">
                <option>Default Sorting</option>
                <option>Sort by Popularity</option>
                <option>Sort by Latest</option>
                <option>Price: Low to High</option>
                <option>Price: High to Low</option>
              </select>
            </div>
          </div>

          {/* Product Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
            {mockProducts.map((product: any) => (
              <ProductCard
                key={product.id}
                image={product.image}
                title={product.title}
                price={product.price}
                originalPrice={product.originalPrice}
                discount={product.discount}
                rating={product.rating}
                status={product.status}
              />
            ))}
          </div>

          {/* Pagination */}
          <div className="mt-12 flex justify-center gap-2">
            <button className="w-10 h-10 flex items-center justify-center rounded-sm bg-primary text-white font-bold hover:bg-primary/90 transition-colors">1</button>
            <button className="w-10 h-10 flex items-center justify-center rounded-sm border border-gray-200 text-gray-600 font-bold hover:border-primary hover:text-primary transition-colors">2</button>
            <button className="w-10 h-10 flex items-center justify-center rounded-sm border border-gray-200 text-gray-600 font-bold hover:border-primary hover:text-primary transition-colors">3</button>
            <button className="w-10 h-10 flex items-center justify-center rounded-sm border border-gray-200 text-gray-600 font-bold hover:border-primary hover:text-primary transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            </button>
          </div>

        </main>
      </div>
    </div>
  );
}
