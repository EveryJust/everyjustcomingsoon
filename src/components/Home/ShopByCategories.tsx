import React from 'react';
import { MAJOR_CATEGORIES } from '../../utils/category';

export default function ShopByCategories() {
  // Use a subset or all of them depending on design, but let's map them all
  const categories = MAJOR_CATEGORIES.map((cat, index) => ({
    id: cat.id,
    title: cat.name,
    // Cycle through placeholder images for now
    image: ['/promo_bottom_banner.png', '/promo_top_banner.png', '/dash_camera.png', '/turbo_charger.png'][index % 4],
    links: cat.subcategories || [],
  }));

  return (
    <div className="py-10 sm:py-16 mt-10 sm:mt-16 relative overflow-hidden bg-gray-50/80 -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-12 lg:px-12 rounded-lg">
      {/* Subtle Background Pattern Mock */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
           style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
      
      <div className="max-w-7xl mx-auto relative z-10">
        <h2 className="text-2xl font-bold text-gray-900 mb-8">Shop By Categories</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category) => (
            <div 
              key={category.id} 
              className="bg-white p-6 rounded-sm shadow-sm hover:shadow-md transition-shadow flex items-center gap-6 border border-gray-100"
            >
              {/* Image Section */}
              <div className="w-24 sm:w-1/3 flex-shrink-0 aspect-square relative flex items-center justify-center">
                 {/* Using background image to simulate the product cutouts */}
                 <div className="absolute inset-0 bg-contain bg-center bg-no-repeat transition-transform duration-300 hover:scale-110" 
                      style={{ backgroundImage: `url('${category.image}')` }} />
              </div>
              
              {/* Content Section */}
              <div className="flex-1 flex flex-col">
                <h3 className="font-bold text-gray-900 text-lg mb-3">
                  {category.title}
                </h3>
                <ul className="flex flex-col gap-2 mb-4">
                  {category.links.map((link, index) => (
                    <li key={index}>
                      <a href="#" className="text-sm text-gray-500 hover:text-primary transition-colors">
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
                <a 
                  href="#" 
                  className="text-sm font-bold text-primary hover:text-gray-900 transition-colors uppercase tracking-wide border-b-2 border-primary hover:border-gray-900 pb-0.5 self-start"
                >
                  VIEW MORE
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
