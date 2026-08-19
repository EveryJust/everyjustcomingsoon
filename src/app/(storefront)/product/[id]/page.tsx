import React from 'react';
import Link from 'next/link';
import TrendingProducts from '@/components/Home/TrendingProducts';

export default function ProductDetailsPage({ params }: { params: { id: string } }) {
  // Mock product data for the demo
  const product = {
    id: params.id,
    title: 'Women Wayfarer Sunglasses',
    price: '₹60',
    originalPrice: '₹69',
    discount: '13% off',
    rating: 4.1,
    reviewsCount: 3800,
    delivery: 'Free Delivery',
    description: 'Elevate your style with these premium Women Wayfarer Sunglasses. Designed with a sleek black frame and polarized lenses, they offer 100% UV protection while ensuring you look effortlessly chic in any setting.',
    images: ['/dash_camera.png', '/turbo_charger.png', '/promo_top_banner.png'],
    features: ['100% UV Protection', 'Polarized Lenses', 'Lightweight Frame', 'Scratch Resistant'],
  };

  return (
    <div className="bg-gray-50 min-h-screen pb-24 lg:pb-12">
      {/* Mobile Top Navigation (Overlay) */}
      <div className="lg:hidden fixed top-0 left-0 w-full z-40 p-4 flex justify-between items-center bg-gradient-to-b from-black/20 to-transparent">
        <Link href="/" className="bg-white/90 backdrop-blur rounded-full p-2 shadow-sm">
          <svg className="w-5 h-5 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </Link>
        <div className="flex gap-2">
          <button className="bg-white/90 backdrop-blur rounded-full p-2 shadow-sm">
             <svg className="w-5 h-5 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
          </button>
          <button className="bg-white/90 backdrop-blur rounded-full p-2 shadow-sm">
             <svg className="w-5 h-5 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto lg:px-4 lg:pt-8 flex flex-col lg:flex-row gap-8">
        
        {/* Left Column: Image Gallery */}
        <div className="w-full lg:w-1/2 lg:sticky lg:top-24 h-max">
          <div className="aspect-[4/5] lg:aspect-square w-full bg-white relative">
            <div className="absolute inset-0 bg-contain bg-center bg-no-repeat lg:rounded-xl shadow-sm" style={{ backgroundImage: `url('${product.images[0]}')` }} />
            {/* Image pagination dots (Mobile) */}
            <div className="absolute bottom-4 left-0 w-full flex justify-center gap-1.5 lg:hidden">
              <span className="w-2 h-2 rounded-full bg-primary"></span>
              <span className="w-2 h-2 rounded-full bg-gray-300"></span>
              <span className="w-2 h-2 rounded-full bg-gray-300"></span>
            </div>
          </div>
          {/* Desktop Thumbnails */}
          <div className="hidden lg:flex gap-4 mt-4">
            {product.images.map((img, idx) => (
              <div key={idx} className={`w-20 h-20 rounded-lg border-2 cursor-pointer ${idx === 0 ? 'border-primary' : 'border-transparent'} bg-white overflow-hidden p-1 shadow-sm`}>
                <div className="w-full h-full bg-contain bg-center bg-no-repeat" style={{ backgroundImage: `url('${img}')` }} />
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Product Info */}
        <div className="w-full lg:w-1/2 flex flex-col gap-2">
          
          {/* Main Info Card */}
          <div className="bg-white p-4 lg:p-6 lg:rounded-xl shadow-sm">
            <div className="text-gray-500 text-sm font-medium mb-1 uppercase tracking-wide">Category</div>
            <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-3">{product.title}</h1>
            
            <div className="flex items-center gap-2 mb-4">
              <div className="bg-teal-600 text-white text-xs font-bold px-1.5 py-0.5 rounded-full flex items-center gap-1">
                {product.rating}
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </div>
              <span className="text-sm text-gray-500 font-medium underline decoration-dashed underline-offset-4 cursor-pointer">{product.reviewsCount} Ratings & Reviews</span>
            </div>

            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-3xl font-black text-gray-900">{product.price}</span>
              <span className="text-gray-400 text-sm line-through decoration-gray-400">{product.originalPrice}</span>
              <span className="text-teal-600 font-bold text-sm bg-teal-50 px-2 py-0.5 rounded ml-2">{product.discount}</span>
            </div>
            <p className="text-xs text-gray-500 mb-4">Inclusive of all taxes</p>
            
            <div className="flex gap-2 mb-2">
              <span className="inline-block bg-gray-50 text-gray-700 text-xs px-2.5 py-1 rounded-full font-medium border border-gray-200">
                {product.delivery}
              </span>
              <span className="inline-block bg-gray-50 text-gray-700 text-xs px-2.5 py-1 rounded-full font-medium border border-gray-200">
                COD Available
              </span>
            </div>
          </div>

          {/* Variants Selector */}
          <div className="bg-white p-4 lg:p-6 lg:rounded-xl shadow-sm mt-2">
             <h3 className="font-semibold text-gray-900 mb-3">Select Size</h3>
             <div className="flex flex-wrap gap-3">
               {['S', 'M', 'L', 'XL'].map((size) => (
                 <button key={size} className={`w-12 h-12 rounded-full border-2 flex items-center justify-center font-bold transition-all ${size === 'M' ? 'border-primary text-primary bg-primary/5' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}>
                   {size}
                 </button>
               ))}
             </div>
          </div>

          {/* Product Details Section */}
          <div className="bg-white p-4 lg:p-6 lg:rounded-xl shadow-sm mt-2">
            <h3 className="font-semibold text-gray-900 mb-3">Product Details</h3>
            <p className="text-sm text-gray-600 leading-relaxed mb-4">
              {product.description}
            </p>
            <ul className="space-y-2">
              {product.features.map((feature, idx) => (
                <li key={idx} className="flex items-center gap-2 text-sm text-gray-600">
                  <svg className="w-4 h-4 text-teal-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  {feature}
                </li>
              ))}
            </ul>
          </div>

          {/* Desktop Actions */}
          <div className="hidden lg:flex gap-4 mt-6">
            <button className="flex-1 bg-white border-2 border-primary text-primary hover:bg-primary/5 font-bold py-3.5 rounded-lg transition-colors tracking-wide">
              ADD TO CART
            </button>
            <button className="flex-1 bg-primary border-2 border-primary text-white hover:bg-primary/90 font-bold py-3.5 rounded-lg transition-colors tracking-wide shadow-lg shadow-primary/30">
              BUY NOW
            </button>
          </div>

        </div>
      </div>

      {/* Similar Products */}
      <div className="bg-white mt-2 lg:mt-12 py-6">
         <div className="max-w-7xl mx-auto px-4 lg:px-4">
            <h3 className="font-semibold text-gray-900 mb-4 text-lg">Similar Products</h3>
            <div className="opacity-70 pointer-events-none">
              {/* Re-using TrendingProducts just as a visual mock of similar products */}
              <TrendingProducts />
            </div>
         </div>
      </div>

      {/* Mobile Sticky Bottom Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 p-3 pb-safe shadow-[0_-8px_16px_-4px_rgba(0,0,0,0.1)] z-50 flex gap-3">
        <button className="flex-1 bg-white border-2 border-primary text-primary active:bg-primary/5 font-bold py-3 rounded-lg transition-colors tracking-wide text-sm flex items-center justify-center gap-2">
          ADD TO CART
        </button>
        <button className="flex-1 bg-primary border-2 border-primary text-white active:bg-primary/90 font-bold py-3 rounded-lg transition-colors tracking-wide text-sm shadow-md shadow-primary/20">
          BUY NOW
        </button>
      </div>

    </div>
  );
}
