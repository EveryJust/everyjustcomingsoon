import React from 'react';
import Link from 'next/link';

interface HorizontalProductCardProps {
  id?: string | number;
  slug?: string;
  image: string;
  title: string;
  price: string;
  originalPrice?: string;
  discount?: string;
  rating?: number;
  status: 'ADD TO CART' | 'OPTIONS' | 'SOLD OUT' | string;
}

export default function HorizontalProductCard({
  id = 1,
  slug,
  image,
  title,
  price,
  originalPrice,
  discount,
  rating = 0,
  status
}: HorizontalProductCardProps) {
  return (
    <Link href={`/product/${slug || id}`} className="bg-white border border-gray-100 rounded-sm p-4 flex gap-4 h-full shadow-sm hover:shadow-md transition-shadow group relative">
      
      {/* Discount Badge */}
      {discount && (
        <div className="absolute top-4 left-4 z-10">
          <span className="bg-primary text-white text-[10px] font-bold px-1.5 py-0.5 rounded-sm">
            {discount}
          </span>
        </div>
      )}

      {/* Image */}
      <div className="w-1/3 flex-shrink-0 relative">
        <div className="absolute inset-0 bg-contain bg-center bg-no-repeat transition-transform duration-300 group-hover:scale-105" style={{ backgroundImage: `url('${image}')` }} />
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col justify-center text-left py-1">
        <h3 className="text-gray-900 font-semibold text-xs mb-1.5 hover:text-primary cursor-pointer line-clamp-2 leading-snug">
          {title}
        </h3>
        
        {/* Rating Stars */}
        <div className="flex items-center gap-0.5 mb-2">
          {[...Array(5)].map((_, i) => (
            <svg key={i} className={`w-2.5 h-2.5 ${i < rating ? 'text-gray-400' : 'text-gray-200'}`} fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          ))}
        </div>

        {/* Price */}
        <div className="flex items-center gap-2 mb-2">
          {originalPrice && (
            <span className="text-gray-400 text-xs line-through">{originalPrice}</span>
          )}
          <span className="text-primary font-bold text-sm">{price}</span>
        </div>

        {/* Action Button */}
        <div>
           <button 
             className={`text-[10px] font-bold uppercase tracking-wider pb-0.5 transition-colors border-b-2 ${
               status === 'SOLD OUT' 
               ? 'text-gray-400 border-gray-200 cursor-not-allowed' 
               : 'text-gray-900 border-gray-900 hover:text-primary hover:border-primary cursor-pointer'
             }`}
             disabled={status === 'SOLD OUT'}
           >
             {status}
           </button>
        </div>
      </div>
    </Link>
  );
}
