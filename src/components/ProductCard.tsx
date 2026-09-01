'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { formatCurrency } from '@/utils/currency';
import { useCartStore } from '@/store/useCartStore';
import { useWishlistStore } from '@/store/useWishlistStore';
import toast from 'react-hot-toast';

interface ProductCardProps {
  product: any;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCartStore();
  const { toggleWishlist, isInWishlist } = useWishlistStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const currentPrice = product.offer_price || product.price;
  const originalPrice = product.offer_price ? product.price : undefined;
  
  let discountStr;
  if (originalPrice && currentPrice < originalPrice) {
    const diff = originalPrice - currentPrice;
    const percent = Math.round((diff / originalPrice) * 100);
    discountStr = `${percent}% off`;
  }

  const image = product.images && product.images.length > 0 ? product.images[0] : '/dash_camera.png';
  const rating = 4.1;
  const reviewsCount = 3800;
  
  const isWishlisted = mounted ? isInWishlist(product.id) : false;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    addItem({
      id: product.id,
      slug: product.slug,
      name: product.name,
      price: currentPrice,
      image,
      qty: 1
    });
    toast.success('Added to cart');
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    const wasInWishlist = isInWishlist(product.id);
    toggleWishlist({
      id: product.id,
      slug: product.slug,
      name: product.name,
      price: currentPrice,
      image
    });
    if (!wasInWishlist) {
      toast.success('Added to wishlist');
    } else {
      toast.success('Removed from wishlist');
    }
  };

  return (
    <Link href={`/product/${product.slug || product.id}`} className="bg-white border border-gray-200 rounded-lg overflow-hidden flex flex-col h-full hover:shadow-md transition-shadow cursor-pointer">
      
      {/* Image Section */}
      <div className="w-full aspect-[4/5] relative bg-gray-50 flex-shrink-0 group">
        <div className="absolute inset-0 bg-cover bg-center bg-no-repeat" style={{ backgroundImage: `url('${image}')` }} />
        {/* Mock watermark from image */}
        <span className="absolute bottom-1 left-2 text-[8px] text-gray-400 opacity-70">s-458934890</span>
        
        {/* Wishlist Button */}
        <button 
          onClick={handleWishlist}
          className={`absolute top-2 right-2 p-1.5 bg-white/90 backdrop-blur rounded-full transition-all shadow-sm ${
            isWishlisted 
              ? 'text-red-500 opacity-100' 
              : 'text-gray-400 hover:text-red-500 hover:bg-white opacity-100 sm:opacity-0 sm:group-hover:opacity-100'
          }`}
        >
          <svg className="w-4 h-4" fill={isWishlisted ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </button>
      </div>

      {/* Content Section */}
      <div className="p-2 sm:p-3 flex flex-col flex-grow text-left">
        {/* Title */}
        <h3 className="text-gray-500 text-xs sm:text-sm font-medium line-clamp-1 mb-1">
          {product.name}
        </h3>
        
        {/* Price Row */}
        <div className="flex flex-wrap items-baseline gap-1 sm:gap-2 mb-2">
          <span className="text-lg sm:text-2xl font-bold text-gray-800">{formatCurrency(currentPrice)}</span>
          {originalPrice && (
            <span className="text-gray-400 text-[10px] sm:text-sm line-through decoration-gray-400">{formatCurrency(originalPrice)}</span>
          )}
          {discountStr && (
            <span className="text-teal-600 font-bold text-[10px] sm:text-sm">{discountStr}</span>
          )}
        </div>

        {/* Delivery Badge */}
        <div className="mb-2 sm:mb-3 flex gap-1">
          <span className="inline-block bg-gray-50 text-gray-600 text-[10px] sm:text-xs px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full font-medium border border-gray-100">
            Free Delivery
          </span>
          <span className="inline-block bg-gray-50 text-gray-600 text-[10px] sm:text-xs px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full font-medium border border-gray-100">
            COD
          </span>
        </div>

        <div className="mt-auto"></div>

        {/* Rating & Reviews */}
        <div className="flex flex-wrap items-center justify-between mt-1">
          <div className="flex flex-wrap items-center gap-1 sm:gap-2">
            <div className="bg-teal-600 text-white text-[10px] sm:text-xs font-bold px-1.5 py-0.5 rounded-full flex items-center gap-0.5 sm:gap-1">
              {rating}
              <svg className="w-2.5 h-2.5 sm:w-3 sm:h-3" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </div>
            <span className="text-[10px] sm:text-xs text-gray-500 font-medium">{reviewsCount}</span>
          </div>
          <button 
            onClick={handleAddToCart}
            className="text-[10px] sm:text-xs font-bold text-white bg-primary px-2 sm:px-3 py-1 rounded-sm hover:bg-primary/90 transition-colors uppercase"
          >
            Add
          </button>
        </div>

      </div>
    </Link>
  );
}
