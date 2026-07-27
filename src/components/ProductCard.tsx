import React from 'react';

interface ProductCardProps {
  image: string;
  title: string;
  price: string;
  originalPrice?: string;
  discount?: string;
  rating?: number;
  status: 'ADD TO CART' | 'OPTIONS' | 'SOLD OUT';
}

export default function ProductCard({
  image,
  title,
  price,
  originalPrice,
  discount,
  rating = 0,
  status
}: ProductCardProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-sm p-4 group relative flex flex-col h-full hover:shadow-lg transition-shadow">
      {/* Badges / Top Right Actions */}
      <div className="absolute top-4 left-4 right-4 flex justify-between items-start z-10">
        {discount && (
          <span className="bg-primary text-white text-xs font-bold px-2 py-1 rounded-sm">
            {discount}
          </span>
        )}
        <div className="ml-auto flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button className="bg-white rounded-full p-1.5 shadow border border-gray-100 hover:text-primary transition-colors cursor-pointer">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
          </button>
          <button className="bg-white rounded-full p-1.5 shadow border border-gray-100 hover:text-primary transition-colors cursor-pointer">
             <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
          </button>
        </div>
      </div>

      {/* Image */}
      <div className="aspect-square relative w-full mb-6">
        <div className="absolute inset-0 bg-contain bg-center bg-no-repeat" style={{ backgroundImage: `url('${image}')` }} />
      </div>

      {/* Content */}
      <div className="flex flex-col flex-grow text-left">
        <h3 className="text-gray-900 font-semibold text-sm mb-2 hover:text-primary cursor-pointer line-clamp-2">
          {title}
        </h3>
        
        {/* Rating Stars (mock) */}
        <div className="flex items-center gap-1 mb-3">
          {[...Array(5)].map((_, i) => (
            <svg key={i} className={`w-3.5 h-3.5 ${i < rating ? 'text-gray-400' : 'text-gray-200'}`} fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          ))}
        </div>

        {/* Price */}
        <div className="flex items-center gap-2 mb-4 mt-auto">
          {originalPrice && (
            <span className="text-gray-400 text-sm line-through">{originalPrice}</span>
          )}
          <span className="text-primary font-bold text-lg">{price}</span>
        </div>

        {/* Action Button */}
        <button 
          className={`w-full py-2.5 font-bold text-xs tracking-wider transition-colors cursor-pointer ${
            status === 'OPTIONS' ? 'bg-primary text-white hover:bg-primary/90' :
            status === 'SOLD OUT' ? 'bg-gray-100 text-gray-500 cursor-not-allowed' :
            'bg-gray-100 text-gray-800 hover:bg-primary hover:text-white'
          }`}
          disabled={status === 'SOLD OUT'}
        >
          {status}
        </button>
      </div>
    </div>
  );
}
