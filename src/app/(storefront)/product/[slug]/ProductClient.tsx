'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import CartDrawer from '@/components/CartDrawer';
import { formatCurrency } from '@/utils/currency';

export default function ProductClient({ product, similarProducts }: { product: any, similarProducts?: React.ReactNode }) {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const galleryRef = React.useRef<HTMLDivElement>(null);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const scrollLeft = e.currentTarget.scrollLeft;
    const width = e.currentTarget.offsetWidth;
    const index = Math.round(scrollLeft / width);
    if (index !== currentImageIndex) {
      setCurrentImageIndex(index);
    }
  };

  const handleThumbnailClick = (index: number) => {
    setCurrentImageIndex(index);
    if (galleryRef.current) {
      galleryRef.current.scrollTo({
        left: index * galleryRef.current.offsetWidth,
        behavior: 'smooth'
      });
    }
  };

  const displayImages = product.images && product.images.length > 0 ? product.images : ['/dash_camera.png'];


  return (
    <div className="bg-gray-50 min-h-screen pb-24 lg:pb-12">
      {/* Mobile Top Navigation (Overlay) */}
      <div className="lg:hidden absolute top-0 left-0 w-full z-40 p-3 flex justify-between items-center">
        <Link href="/" className="bg-white/90 backdrop-blur rounded-full p-2 shadow-sm text-gray-800">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </Link>
        <div className="flex gap-2">
          {/* Search Icon */}
          <button className="bg-white/90 backdrop-blur rounded-full p-2 shadow-sm text-gray-800">
             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          </button>
          {/* Wishlist Icon */}
          <button className="bg-white/90 backdrop-blur rounded-full p-2 shadow-sm text-gray-800">
             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
          </button>
          {/* Cart Icon */}
          <button 
            onClick={() => setIsCartOpen(true)}
            className="bg-white/90 backdrop-blur rounded-full p-2 shadow-sm text-gray-800 relative cursor-pointer"
          >
             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
             <span className="absolute -top-1 -right-1 bg-primary text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">0</span>
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto lg:px-4 lg:pt-8 flex flex-col lg:flex-row gap-2 lg:gap-8">
        
        {/* Left Column: Image Gallery */}
        <div className="w-full lg:w-1/2 lg:sticky lg:top-24 h-max">
          <div className="relative">
            <div 
              ref={galleryRef}
              className="w-full flex overflow-x-auto snap-x snap-mandatory scrollbar-hide lg:rounded-xl shadow-sm bg-white"
              onScroll={handleScroll}
            >
              {displayImages.map((img: string, idx: number) => (
                <div key={idx} className="w-full flex-shrink-0 snap-center snap-always">
                  <img src={img} alt={`Product Image ${idx + 1}`} className="w-full h-auto object-cover lg:rounded-xl" />
                </div>
              ))}
            </div>
            <div className="absolute bottom-4 left-0 w-full flex justify-center gap-1.5 lg:hidden">
              {displayImages.map((_: string, idx: number) => (
                <span 
                  key={idx} 
                  className={`w-2 h-2 rounded-full transition-colors ${idx === currentImageIndex ? 'bg-primary' : 'bg-gray-300'}`}
                ></span>
              ))}
            </div>
          </div>

          {/* Desktop Thumbnails */}
          <div className="hidden lg:flex gap-4 mt-4">
            {displayImages.map((img: string, idx: number) => (
              <div 
                key={idx} 
                onClick={() => handleThumbnailClick(idx)}
                className={`w-20 h-20 rounded-lg border-2 cursor-pointer transition-colors ${idx === currentImageIndex ? 'border-primary' : 'border-transparent'} bg-white overflow-hidden p-1 shadow-sm`}
              >
                <div className="w-full h-full bg-contain bg-center bg-no-repeat" style={{ backgroundImage: `url('${img}')` }} />
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Product Info */}
        <div className="w-full lg:w-1/2 flex flex-col gap-2 pb-6 lg:pb-0">
          
          {/* Main Info Card */}
          <div className="bg-white p-4 lg:p-6 lg:rounded-xl shadow-sm">
            <div className="flex justify-between items-start mb-3">
              <h1 className="text-[16px] sm:text-2xl font-normal text-gray-800 pr-4 leading-snug">{product.name}</h1>
              <div className="flex gap-4 flex-shrink-0 text-gray-600">
                <button className="flex flex-col items-center gap-1">
                  <svg className="w-5 h-5 text-red-500 fill-current" viewBox="0 0 24 24"><path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                  <span className="text-[10px] text-gray-800">Wishlisted</span>
                </button>
                <button className="flex flex-col items-center gap-1">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
                  <span className="text-[10px] text-gray-800">Share</span>
                </button>
              </div>
            </div>

            <div className="flex items-baseline gap-2 mb-3">
              <span className="text-[32px] font-extrabold text-gray-900 leading-none">{formatCurrency(product.offer_price || product.price)}</span>
              {product.offer_price && product.offer_price < product.price && (
                <>
                  <span className="text-gray-400 text-sm line-through font-medium">{formatCurrency(product.price)}</span>
                  <span className="text-gray-600 font-bold text-sm">
                    {Math.round(((product.price - product.offer_price) / product.price) * 100)}% off
                  </span>
                </>
              )}
              <svg className="w-4 h-4 text-gray-400 ml-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <div className="text-[16px] font-semibold text-gray-800 mb-3 mt-4">
              <span className="font-normal text-gray-600 text-sm">Cash on delivery available</span>
            </div>

            <div className="flex items-center gap-2 mb-2">
              <div className="bg-teal-600 text-white text-[11px] font-bold px-1.5 py-0.5 rounded flex items-center gap-1">
                4.1
                <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </div>
              <span className="text-xs text-gray-500 font-medium">(3,809)</span>
            </div>
          </div>

          {/* Variants Selector */}
          <div className="bg-white p-4 lg:p-6 lg:rounded-xl shadow-sm">
             <h3 className="font-bold text-gray-900 text-[16px] mb-4">Select Size</h3>
             <div className="flex flex-wrap gap-3">
               <button className="px-5 py-2 rounded-lg border border-primary text-primary font-semibold bg-primary/5 transition-all text-sm">
                 Free Size
               </button>
             </div>
          </div>

          {/* Product Highlights */}
          <div className="bg-white p-4 lg:p-6 lg:rounded-xl shadow-sm">
             <div className="flex justify-between items-center mb-5">
               <h3 className="font-bold text-gray-900 text-[16px]">Product Highlights</h3>
               <button className="text-primary font-bold text-xs tracking-wide">COPY</button>
             </div>
             
             <div className="grid grid-cols-2 gap-y-5 gap-x-4 mb-6">
               {(product.highlights || []).map((highlight: any, idx: number) => (
                 <div key={idx}>
                   <div className="text-gray-500 text-[13px] mb-0.5">{highlight.label}</div>
                   <div className="text-gray-900 text-[14px] font-medium leading-tight">{highlight.value}</div>
                 </div>
               ))}
               {(!product.highlights || product.highlights.length === 0) && (
                 <div className="col-span-2 text-gray-500 text-sm">No highlights available.</div>
               )}
             </div>

             {/* Additional Details */}
             <div className="border-t border-gray-100 pt-5 mt-2">
               <div 
                 className="flex justify-between items-center cursor-pointer group"
                 onClick={() => setIsDetailsOpen(!isDetailsOpen)}
               >
                 <h3 className="font-bold text-gray-800 text-[16px]">Additional Details</h3>
                 <svg 
                   className={`w-5 h-5 text-gray-600 group-hover:text-gray-900 transition-transform ${isDetailsOpen ? 'rotate-180' : ''}`} 
                   fill="none" 
                   stroke="currentColor" 
                   viewBox="0 0 24 24"
                 >
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                 </svg>
               </div>
               
               {isDetailsOpen && (
                 <div className="mt-4 animate-in slide-in-from-top-2 fade-in duration-200">
                   <div className="grid grid-cols-[130px_1fr] gap-y-3 gap-x-2 text-sm">
                     {(product.additional_details || []).map((detail: any, idx: number) => (
                       <React.Fragment key={idx}>
                         <div className="text-gray-500 leading-tight pr-2">{detail.label}</div>
                         <div className="text-gray-900 pt-1">{detail.value}</div>
                       </React.Fragment>
                     ))}
                     {(!product.additional_details || product.additional_details.length === 0) && (
                       <div className="text-gray-500 col-span-2">No additional details available.</div>
                     )}
                   </div>
                   <button className="text-primary text-sm font-semibold mt-4">More Information</button>
                 </div>
               )}
             </div>
          </div>

          {/* Customer Ratings & Reviews */}
          <div className="bg-white p-4 lg:p-6 lg:rounded-xl shadow-sm">
             <h3 className="font-bold text-gray-900 text-[16px] mb-5">Customer Ratings & Reviews</h3>
             
             {/* Summary */}
             <div className="flex gap-4 items-center mb-6 border-b border-gray-100 pb-6">
               <div className="flex flex-col items-center">
                 <div className="bg-[#0f8853] text-white rounded-lg flex items-center justify-center gap-1.5 w-24 h-20 mb-2">
                   <span className="text-[28px] font-bold">4.1</span>
                   <svg className="w-5 h-5 mt-1" fill="currentColor" viewBox="0 0 20 20">
                     <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                   </svg>
                 </div>
                 <div className="text-[11px] text-gray-500">3,809 ratings</div>
                 <div className="text-[11px] text-gray-500">1,465 reviews</div>
               </div>
               
               <div className="flex-1 flex flex-col gap-1.5">
                 {[
                   { label: 'Very Good', color: 'bg-[#0f8853]', w: '70%', count: '2,283' },
                   { label: 'Good', color: 'bg-[#37b75f]', w: '30%', count: '724' },
                   { label: 'Ok-Ok', color: 'bg-yellow-400', w: '15%', count: '378' },
                   { label: 'Bad', color: 'bg-orange-500', w: '5%', count: '125' },
                   { label: 'Very Bad', color: 'bg-red-500', w: '10%', count: '299' },
                 ].map((bar, i) => (
                   <div key={i} className="flex items-center gap-2 text-[11px]">
                     <div className="w-14 text-gray-600 font-medium">{bar.label}</div>
                     <div className="flex-1 h-1 bg-gray-200 rounded-full overflow-hidden">
                       <div className={`h-full ${bar.color}`} style={{ width: bar.w }}></div>
                     </div>
                     <div className="w-8 text-right text-gray-400">{bar.count}</div>
                   </div>
                 ))}
               </div>
             </div>

             {/* Real Photos */}
             <div className="mb-6">
               <h4 className="font-semibold text-gray-800 mb-3 text-[14px]">Real Photos (389)</h4>
               <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                 {[1,2,3].map(i => (
                   <div key={i} className="w-[100px] h-[100px] rounded-lg bg-gray-200 flex-shrink-0 bg-cover bg-center" style={{backgroundImage: "url('/promo_top_banner.png')"}}></div>
                 ))}
                 <div className="w-[100px] h-[100px] rounded-lg bg-gray-900 flex-shrink-0 bg-cover bg-center relative flex items-center justify-center cursor-pointer" style={{backgroundImage: "url('/promo_top_banner.png')"}}>
                   <div className="absolute inset-0 bg-black/70 rounded-lg"></div>
                   <div className="relative text-white font-bold text-center leading-tight">
                     <span className="text-xl">+385</span><br/>More
                   </div>
                 </div>
               </div>
             </div>

             {/* Single Review */}
             <div className="mb-4">
               <div className="flex items-center gap-2 mb-2.5 text-xs">
                 <div className="bg-[#0f8853] text-white font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5 text-[11px]">
                   5 <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
                 </div>
                 <span className="font-semibold text-gray-800 text-[13px]">Very Good</span>
                 <span className="text-gray-300 mx-1">•</span>
                 <span className="text-gray-400">Posted on 21 Jul, 2025</span>
               </div>
               
               <div className="flex gap-4 mb-3">
                 <div className="flex-1 text-[13px] text-gray-700 leading-snug">
                   Product is very good I like it 👍 The material is good But the box is...<span className="text-primary cursor-pointer">Read More</span>
                   <div className="text-gray-500 text-xs mt-3 font-medium">~Deepesh Kushwaha</div>
                 </div>
                 <div className="flex flex-col gap-2">
                   <div className="flex gap-2">
                     <div className="w-[50px] h-[50px] rounded border border-gray-200 bg-cover bg-center" style={{backgroundImage: "url('/promo_top_banner.png')"}}></div>
                     <div className="w-[50px] h-[50px] rounded bg-gray-900 relative flex items-center justify-center bg-cover bg-center cursor-pointer" style={{backgroundImage: "url('/promo_top_banner.png')"}}>
                       <div className="absolute inset-0 bg-black/60 rounded"></div>
                       <div className="relative text-white font-bold text-sm">+3</div>
                     </div>
                   </div>
                 </div>
               </div>
               
               <button className="flex items-center gap-1.5 text-gray-600 text-[13px] mt-1 font-medium hover:text-gray-900">
                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"/></svg>
                 Helpful (53)
               </button>
             </div>
             
             <div className="pt-5 pb-1">
               <button className="text-primary font-bold text-[13px] flex items-center gap-2 uppercase tracking-wide">
                 VIEW ALL REVIEWS 
                 <div className="bg-primary text-white rounded-full p-0.5">
                   <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" /></svg>
                 </div>
               </button>
             </div>
          </div>

          {/* Seller Box */}
          <div className="bg-white p-4 lg:p-6 lg:rounded-xl shadow-sm flex items-center justify-between cursor-pointer group mt-2">
             <div className="flex items-center gap-3">
               <div className="w-10 h-10 rounded-full bg-[#f8f9ff] flex items-center justify-center text-blue-400 border border-blue-50">
                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
               </div>
               <div>
                 <div className="text-gray-600 text-[11px] mb-0.5">Sold by</div>
                 <div className="font-semibold text-gray-900 text-[15px] uppercase tracking-wide">IMP EYEWEAR</div>
                 <div className="flex items-center gap-1 mt-1">
                   <div className="border border-[#0f8853] text-[#0f8853] font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5 text-[10px]">
                     4.2 <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
                   </div>
                 </div>
               </div>
             </div>
             <svg className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          </div>

          {/* Delivery Box */}
          <div className="bg-white px-4 py-5 lg:p-6 lg:rounded-xl shadow-sm mt-2">
             <div className="flex justify-between items-center mb-1">
               <div className="text-gray-600 text-[15px]">
                 Delivery by <span className="font-semibold text-gray-900">Fri, 28 Aug</span>
               </div>
               <button className="text-primary font-semibold text-[13px] border border-primary rounded px-4 py-1.5">Change</button>
             </div>
             <div className="text-gray-500 text-sm mb-6">at 679327</div>

             {/* Trust Badges */}
             <div className="grid grid-cols-3 divide-x divide-gray-200 border-t border-gray-200 pt-5">
               <div className="flex flex-col items-center text-center gap-1.5 px-2">
                 <div className="w-7 h-7 flex items-center justify-center text-[#0f8853]">
                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1.41 16.09V20h-2.67v-1.93c-1.71-.36-3.16-1.46-3.27-3.4h2.45c.16 1.03.89 1.49 1.93 1.49 1.11 0 1.64-.59 1.64-1.43 0-.98-.74-1.39-2.28-1.87-2.14-.65-3.3-1.63-3.3-3.32 0-1.77 1.34-2.88 2.83-3.26V4h2.67v2.1c1.23.27 2.45.98 2.76 2.5h-2.4c-.19-.78-.79-1.2-1.72-1.2-.95 0-1.52.54-1.52 1.33 0 1.01.91 1.32 2.47 1.83 2.05.68 3.12 1.76 3.12 3.39 0 1.92-1.35 2.91-2.66 3.24z"/></svg>
                 </div>
                 <span className="text-[11px] text-gray-700 font-medium leading-tight">Lowest Price</span>
               </div>
               <div className="flex flex-col items-center text-center gap-1.5 px-2">
                 <div className="w-7 h-7 flex items-center justify-center text-[#0f8853]">
                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full"><path d="M3 6h18v12H3V6zm2 2v8h14V8H5zm4 4c0-1.1.9-2 2-2s2 .9 2 2-.9 2-2 2-2-.9-2-2z"/></svg>
                 </div>
                 <span className="text-[11px] text-gray-700 font-medium leading-tight">Cash on Delivery</span>
               </div>
               <div className="flex flex-col items-center text-center gap-1.5 px-2">
                 <div className="w-7 h-7 flex items-center justify-center text-orange-400">
                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full"><path d="M19 7h-3V6a4 4 0 00-8 0v1H5a1 1 0 00-1 1v12a1 1 0 001 1h14a1 1 0 001-1V8a1 1 0 00-1-1zm-9-1a2 2 0 014 0v1h-4V6zm7 13H7V9h10v10zM9 11h6v2H9v-2z"/></svg>
                 </div>
                 <span className="text-[11px] text-gray-700 font-medium leading-tight">7-day Returns</span>
               </div>
             </div>
          </div>

          {/* Desktop Actions */}
          <div className="hidden lg:flex gap-4 mt-6">
            <button 
              onClick={() => setIsCartOpen(true)}
              className="flex-1 bg-white border border-primary text-primary hover:bg-primary/5 font-bold py-3.5 rounded-lg transition-colors tracking-wide cursor-pointer flex items-center justify-center gap-2 text-[16px]"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
              Add to Cart
            </button>
            <button className="flex-1 bg-primary border border-primary text-white hover:bg-primary/90 font-bold py-3.5 rounded-lg transition-colors tracking-wide shadow-lg shadow-primary/30 flex items-center justify-center gap-2 text-[16px]">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" /></svg>
              Buy Now
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
              {similarProducts}
            </div>
         </div>
      </div>

      {/* Mobile Sticky Bottom Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 p-2 pb-safe shadow-[0_-8px_16px_-4px_rgba(0,0,0,0.1)] z-50 flex gap-2">
        <button 
          onClick={() => setIsCartOpen(true)}
          className="flex-1 bg-white border border-primary text-primary active:bg-primary/5 font-bold py-3 rounded md:rounded-lg transition-colors tracking-wide text-[15px] flex items-center justify-center gap-2 cursor-pointer"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
          Add to Cart
        </button>
        <button className="flex-1 bg-primary border border-primary text-white active:bg-primary/90 font-bold py-3 rounded md:rounded-lg transition-colors tracking-wide text-[15px] flex items-center justify-center gap-2 shadow-md shadow-primary/20">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" /></svg>
          Buy Now
        </button>
      </div>

      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </div>
  );
}
