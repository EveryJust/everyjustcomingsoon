import React from 'react';

export default function BrandsPage() {
  const mockBrands = [
    { id: 1, name: "Nexus Electronics", category: "Electronics & Gadgets", description: "Top tier consumer electronics and smart home devices.", logoColor: "bg-blue-600" },
    { id: 2, name: "Urban Threads", category: "Clothes & Apparel", description: "Sustainable and trendy urban street fashion.", logoColor: "bg-emerald-600" },
    { id: 3, name: "Vitality Health", category: "Health & Wellness", description: "Organic supplements and holistic wellness products.", logoColor: "bg-orange-500" },
    { id: 4, name: "Luxe Timepieces", category: "Jewelry & Watches", description: "Precision crafted luxury watches and accessories.", logoColor: "bg-gray-900" },
    { id: 5, name: "GigaToys", category: "Toys & Kids", description: "Educational and fun toys for all ages.", logoColor: "bg-red-500" },
    { id: 6, name: "HomeHaven", category: "Home & Kitchen", description: "Modern furniture and essential home decor.", logoColor: "bg-indigo-600" },
    { id: 7, name: "Tread & Trail", category: "Sports & Outdoors", description: "High-performance outdoor and camping gear.", logoColor: "bg-teal-700" },
    { id: 8, name: "Gourmet Pantry", category: "Groceries & Gourmet Food", description: "Artisan snacks and premium imported foods.", logoColor: "bg-amber-700" },
  ];

  return (
    <div className="font-sans text-gray-900 bg-white">
      {/* Hero Banner */}
      <div className="bg-gray-900 text-white relative overflow-hidden py-20 lg:py-32">
        <div className="absolute inset-0 bg-cover bg-center opacity-30" style={{ backgroundImage: "url('/main_hero_banner.png')" }} />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <span className="text-primary font-bold tracking-widest uppercase mb-4 block">Partner Network</span>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black uppercase tracking-tight mb-6">
            Our Brands & Businesses
          </h1>
          <p className="text-gray-300 max-w-2xl mx-auto text-lg sm:text-xl font-medium">
            Explore premium storefronts from verified global sellers. Discover unique products crafted by top-tier businesses.
          </p>
        </div>
      </div>

      {/* Stats/Benefits Bar */}
      <div className="bg-primary py-8 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-1 md:grid-cols-3 gap-8 text-center text-white">
          <div>
            <h3 className="text-4xl font-black mb-2">500+</h3>
            <p className="font-semibold uppercase tracking-wider text-sm text-white/90">Verified Brands</p>
          </div>
          <div>
            <h3 className="text-4xl font-black mb-2">1M+</h3>
            <p className="font-semibold uppercase tracking-wider text-sm text-white/90">Products Listed</p>
          </div>
          <div>
            <h3 className="text-4xl font-black mb-2">100%</h3>
            <p className="font-semibold uppercase tracking-wider text-sm text-white/90">Quality Guarantee</p>
          </div>
        </div>
      </div>

      {/* Brands Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-20">
        <div className="flex justify-between items-end mb-12">
          <div>
            <h2 className="text-3xl font-black text-gray-900 uppercase">Featured Stores</h2>
            <div className="w-20 h-1 bg-primary mt-4"></div>
          </div>
          
          <div className="hidden sm:block">
            <select className="border-2 border-gray-200 text-gray-700 font-bold rounded-sm px-4 py-2 focus:outline-none focus:border-primary cursor-pointer bg-white">
              <option>All Categories</option>
              <option>Electronics</option>
              <option>Fashion</option>
              <option>Home & Living</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {mockBrands.map((brand) => (
            <div key={brand.id} className="bg-white border border-gray-100 rounded-lg p-6 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.1)] transition-all duration-300 group flex flex-col h-full hover:-translate-y-1 cursor-pointer">
              {/* Logo Placeholder */}
              <div className={`w-16 h-16 rounded-lg ${brand.logoColor} text-white flex items-center justify-center text-2xl font-black mb-6 shadow-sm`}>
                {brand.name.charAt(0)}
              </div>
              
              <span className="text-xs font-bold text-primary uppercase tracking-wider mb-2 block">{brand.category}</span>
              <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-primary transition-colors">{brand.name}</h3>
              <p className="text-gray-500 text-sm mb-8 flex-grow">{brand.description}</p>
              
              <button className="w-full py-3 border-2 border-gray-900 text-gray-900 font-bold text-sm tracking-wider uppercase rounded-sm group-hover:bg-gray-900 group-hover:text-white transition-colors mt-auto">
                View Store
              </button>
            </div>
          ))}
        </div>
        
        <div className="mt-12 text-center">
           <button className="bg-gray-100 text-gray-800 font-bold px-8 py-3 rounded-sm uppercase tracking-wider hover:bg-gray-200 transition-colors">
             Load More Brands
           </button>
        </div>
      </div>

      {/* CTA Section for Businesses */}
      <div className="bg-gray-50 py-24 border-t border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl md:text-5xl font-black text-gray-900 uppercase tracking-tight mb-6">
            Grow Your Business With Us
          </h2>
          <p className="text-gray-600 text-lg mb-10 max-w-2xl mx-auto">
            Join thousands of successful sellers on EveryJust. Get access to a massive customer base, powerful seller tools, and dedicated support to scale your brand.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-primary text-white font-black px-10 py-4 rounded-sm uppercase tracking-wider hover:bg-primary/90 transition-all hover:shadow-lg hover:-translate-y-0.5">
              Start Selling Today
            </button>
            <button className="bg-white border-2 border-gray-300 text-gray-800 font-bold px-10 py-4 rounded-sm uppercase tracking-wider hover:border-gray-900 transition-all">
              Learn More
            </button>
          </div>
        </div>
      </div>

    </div>
  );
}
