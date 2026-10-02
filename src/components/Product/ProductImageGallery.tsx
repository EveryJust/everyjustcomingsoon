'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  ZoomIn, 
  ZoomOut, 
  Maximize2, 
  X, 
  ChevronLeft, 
  ChevronRight, 
  RotateCcw 
} from 'lucide-react';

interface ProductImageGalleryProps {
  images: string[];
  productName: string;
  selectedIndex?: number;
  onSelectImage?: (index: number) => void;
}

export default function ProductImageGallery({
  images,
  productName,
  selectedIndex,
  onSelectImage,
}: ProductImageGalleryProps) {
  const safeImages = images && images.length > 0 ? images : ['/dash_camera.png'];
  
  const [internalIndex, setInternalIndex] = useState(0);
  const activeIndex = selectedIndex !== undefined ? selectedIndex : internalIndex;

  const setActiveIndex = (idx: number) => {
    const validIdx = (idx + safeImages.length) % safeImages.length;
    setInternalIndex(validIdx);
    onSelectImage?.(validIdx);
  };

  // Hover zoom state (desktop inline magnifier)
  const [isHovering, setIsHovering] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });
  const imageContainerRef = useRef<HTMLDivElement>(null);

  // Fullscreen Lightbox Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalZoom, setModalZoom] = useState(1);
  const [panPosition, setPanPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0 });

  // Mobile swipe ref
  const mobileGalleryRef = useRef<HTMLDivElement>(null);

  // Inline Hover Zoom Mouse Handler
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!imageContainerRef.current) return;
    const rect = imageContainerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
    const y = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100));
    setZoomPos({ x, y });
  };

  const handleMouseEnter = () => setIsHovering(true);
  const handleMouseLeave = () => {
    setIsHovering(false);
    setZoomPos({ x: 50, y: 50 });
  };

  // Next / Prev Navigation
  const handlePrev = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setActiveIndex(activeIndex - 1);
    resetModalPan();
  };

  const handleNext = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setActiveIndex(activeIndex + 1);
    resetModalPan();
  };

  // Sync mobile scroll
  const handleMobileScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const scrollLeft = e.currentTarget.scrollLeft;
    const width = e.currentTarget.offsetWidth;
    if (width > 0) {
      const index = Math.round(scrollLeft / width);
      if (index !== activeIndex && index >= 0 && index < safeImages.length) {
        setActiveIndex(index);
      }
    }
  };

  const scrollToMobileSlide = (index: number) => {
    setActiveIndex(index);
    if (mobileGalleryRef.current) {
      mobileGalleryRef.current.scrollTo({
        left: index * mobileGalleryRef.current.offsetWidth,
        behavior: 'smooth'
      });
    }
  };

  // Modal Zoom Helpers
  const resetModalPan = useCallback(() => {
    setModalZoom(1);
    setPanPosition({ x: 0, y: 0 });
  }, []);

  const handleZoomIn = () => {
    setModalZoom(prev => Math.min(prev + 0.5, 3.5));
  };

  const handleZoomOut = () => {
    setModalZoom(prev => {
      const next = Math.max(prev - 0.5, 1);
      if (next === 1) setPanPosition({ x: 0, y: 0 });
      return next;
    });
  };

  const toggleModalZoom = () => {
    if (modalZoom > 1) {
      resetModalPan();
    } else {
      setModalZoom(2.2);
    }
  };

  // Modal Pan (Drag) handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (modalZoom <= 1) return;
    setIsDragging(true);
    dragStartRef.current = {
      x: e.clientX - panPosition.x,
      y: e.clientY - panPosition.y
    };
  };

  const handleModalMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || modalZoom <= 1) return;
    setPanPosition({
      x: e.clientX - dragStartRef.current.x,
      y: e.clientY - dragStartRef.current.y
    });
  };

  const handleMouseUp = () => setIsDragging(false);

  // Touch Pan for Modal
  const handleTouchStart = (e: React.TouchEvent) => {
    if (modalZoom <= 1 || e.touches.length !== 1) return;
    setIsDragging(true);
    dragStartRef.current = {
      x: e.touches[0].clientX - panPosition.x,
      y: e.touches[0].clientY - panPosition.y
    };
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || modalZoom <= 1 || e.touches.length !== 1) return;
    setPanPosition({
      x: e.touches[0].clientX - dragStartRef.current.x,
      y: e.touches[0].clientY - dragStartRef.current.y
    });
  };

  const handleTouchEnd = () => setIsDragging(false);

  // Keyboard navigation for modal
  useEffect(() => {
    if (!isModalOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsModalOpen(false);
      } else if (e.key === 'ArrowLeft') {
        handlePrev();
      } else if (e.key === 'ArrowRight') {
        handleNext();
      } else if (e.key === '+' || e.key === '=') {
        handleZoomIn();
      } else if (e.key === '-') {
        handleZoomOut();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'auto';
    };
  }, [isModalOpen, activeIndex, safeImages.length]);

  return (
    <div className="w-full flex flex-col gap-3">
      {/* ================= DESKTOP VIEW (lg+) ================= */}
      <div className="hidden lg:flex gap-4 items-start">
        {/* Thumbnails Rail on Left (if more than 1 image) */}
        {safeImages.length > 1 && (
          <div className="flex flex-col gap-2.5 max-h-[540px] overflow-y-auto pr-1 scrollbar-thin">
            {safeImages.map((img, idx) => {
              const isActive = idx === activeIndex;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setActiveIndex(idx)}
                  onMouseEnter={() => setActiveIndex(idx)}
                  aria-label={`Select product image ${idx + 1}`}
                  className={`relative w-16 h-16 lg:w-20 lg:h-20 rounded-lg overflow-hidden border-2 bg-white transition-all cursor-pointer flex-shrink-0 p-1 group ${
                    isActive
                      ? 'border-primary ring-2 ring-primary/20 shadow-md scale-102'
                      : 'border-gray-200 hover:border-gray-300 hover:scale-102 opacity-80 hover:opacity-100'
                  }`}
                >
                  <img
                    src={img}
                    alt={`${productName} thumbnail ${idx + 1}`}
                    className="w-full h-full object-contain object-center transition-transform group-hover:scale-105"
                  />
                  {isActive && (
                    <div className="absolute inset-0 border border-primary rounded-md pointer-events-none" />
                  )}
                </button>
              );
            })}
          </div>
        )}

        {/* Main Image Container with Interactive Hover Zoom */}
        <div className="flex-1 relative group">
          <div
            ref={imageContainerRef}
            onClick={() => {
              resetModalPan();
              setIsModalOpen(true);
            }}
            onMouseMove={handleMouseMove}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            className="relative w-full h-[520px] bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden cursor-zoom-in flex items-center justify-center select-none"
          >
            {/* The Main Image with Hardware-accelerated dynamic scale & transform origin */}
            <img
              src={safeImages[activeIndex]}
              alt={`${productName} - View ${activeIndex + 1}`}
              className="w-full h-full object-contain pointer-events-none transition-transform duration-150 ease-out will-change-transform"
              style={{
                transform: isHovering ? 'scale(2.3)' : 'scale(1)',
                transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`,
              }}
            />

            {/* Hover to Zoom / Click to Expand Hint Badge */}
            <div
              className={`absolute top-4 right-4 z-10 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/90 backdrop-blur-md shadow-sm border border-gray-100 text-xs font-medium text-gray-700 pointer-events-none transition-opacity duration-200 ${
                isHovering ? 'opacity-0' : 'opacity-100'
              }`}
            >
              <ZoomIn className="w-3.5 h-3.5 text-primary" />
              <span>Roll over to zoom</span>
            </div>

            {/* Image Counter Badge (top-left) */}
            {safeImages.length > 1 && (
              <div
                className={`absolute top-4 left-4 z-10 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-[11px] font-semibold tracking-wider transition-opacity duration-200 ${
                  isHovering ? 'opacity-20' : 'opacity-100'
                }`}
              >
                {activeIndex + 1} / {safeImages.length}
              </div>
            )}

            {/* Click to expand button (bottom-right) */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                resetModalPan();
                setIsModalOpen(true);
              }}
              title="Open full screen zoom viewer"
              aria-label="Open full screen zoom viewer"
              className="absolute bottom-4 right-4 z-10 p-2.5 rounded-xl bg-white/90 backdrop-blur-md shadow-md border border-gray-100 text-gray-700 hover:text-primary hover:bg-white transition-all transform hover:scale-105 cursor-pointer"
            >
              <Maximize2 className="w-4 h-4" />
            </button>

            {/* Previous & Next Arrow Buttons on hover */}
            {safeImages.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={handlePrev}
                  title="Previous image"
                  aria-label="Previous image"
                  className="absolute left-3 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-white/90 backdrop-blur-md shadow-md border border-gray-100 text-gray-700 hover:text-primary hover:bg-white flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 hover:scale-110 cursor-pointer"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  title="Next image"
                  aria-label="Next image"
                  className="absolute right-3 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-white/90 backdrop-blur-md shadow-md border border-gray-100 text-gray-700 hover:text-primary hover:bg-white flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 hover:scale-110 cursor-pointer"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ================= MOBILE VIEW (< lg) ================= */}
      <div className="lg:hidden relative">
        <div
          ref={mobileGalleryRef}
          onScroll={handleMobileScroll}
          className="w-full flex overflow-x-auto snap-x snap-mandatory scrollbar-hide bg-white shadow-sm"
        >
          {safeImages.map((img, idx) => (
            <div
              key={idx}
              onClick={() => {
                resetModalPan();
                setIsModalOpen(true);
              }}
              className="w-full flex-shrink-0 snap-center snap-always aspect-square relative flex items-center justify-center p-2 bg-white"
            >
              <img
                src={img}
                alt={`${productName} ${idx + 1}`}
                className="w-full h-full object-contain"
              />
            </div>
          ))}
        </div>

        {/* Mobile Floating Action (Tap to Zoom & Badge) */}
        <div className="absolute top-4 right-4 z-20">
          <button
            type="button"
            onClick={() => {
              resetModalPan();
              setIsModalOpen(true);
            }}
            className="p-2 rounded-full bg-white/90 backdrop-blur-md shadow-sm text-gray-700 flex items-center justify-center"
            aria-label="Tap to zoom image"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>

        {/* Mobile Dot Indicators & Counter */}
        {safeImages.length > 1 && (
          <div className="absolute bottom-3 left-0 w-full flex items-center justify-between px-4 pointer-events-none">
            <div className="flex items-center gap-1.5 pointer-events-auto bg-black/40 backdrop-blur-sm px-2.5 py-1 rounded-full">
              {safeImages.map((_, idx) => (
                <span
                  key={idx}
                  onClick={() => scrollToMobileSlide(idx)}
                  className={`rounded-full transition-all duration-300 cursor-pointer ${
                    idx === activeIndex
                      ? 'w-5 h-1.5 bg-primary'
                      : 'w-1.5 h-1.5 bg-white/70'
                  }`}
                />
              ))}
            </div>

            <div className="bg-black/50 backdrop-blur-sm text-white text-[11px] font-medium px-2 py-0.5 rounded-full">
              {activeIndex + 1}/{safeImages.length}
            </div>
          </div>
        )}

        {/* Mobile mini thumbnail row */}
        {safeImages.length > 1 && (
          <div className="flex gap-2 p-2 bg-gray-50 overflow-x-auto scrollbar-hide">
            {safeImages.map((img, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => scrollToMobileSlide(idx)}
                className={`w-14 h-14 rounded-md overflow-hidden border-2 bg-white flex-shrink-0 p-0.5 ${
                  idx === activeIndex ? 'border-primary ring-1 ring-primary' : 'border-gray-200 opacity-70'
                }`}
              >
                <img src={img} alt={`Thumb ${idx + 1}`} className="w-full h-full object-contain" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ================= FULLSCREEN LIGHTBOX MODAL ================= */}
      {isModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Product Image Zoom Lightbox"
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-lg flex flex-col justify-between select-none animate-in fade-in duration-200"
          onMouseMove={handleModalMouseMove}
          onMouseUp={handleMouseUp}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* Header Controls */}
          <div className="p-4 sm:px-6 flex items-center justify-between text-white border-b border-white/10 z-20 bg-black/40">
            <div className="flex items-center gap-3">
              <span className="font-semibold text-sm sm:text-base text-gray-200">
                {productName}
              </span>
              <span className="text-xs text-gray-400 bg-white/10 px-2 py-0.5 rounded-full">
                {activeIndex + 1} of {safeImages.length}
              </span>
            </div>

            {/* Zoom Action Tools */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleZoomOut}
                disabled={modalZoom <= 1}
                title="Zoom Out (-)"
                className="p-2 rounded-lg bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:pointer-events-none text-white transition-colors"
              >
                <ZoomOut className="w-4 h-4" />
              </button>

              <span className="text-xs font-mono font-medium text-gray-300 w-12 text-center">
                {Math.round(modalZoom * 100)}%
              </span>

              <button
                type="button"
                onClick={handleZoomIn}
                disabled={modalZoom >= 3.5}
                title="Zoom In (+)"
                className="p-2 rounded-lg bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:pointer-events-none text-white transition-colors"
              >
                <ZoomIn className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={resetModalPan}
                title="Reset Zoom"
                className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors ml-1 hidden sm:flex items-center gap-1 text-xs"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>

              <div className="h-4 w-px bg-white/20 mx-1" />

              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                title="Close (Esc)"
                className="p-2 rounded-lg bg-white/10 hover:bg-red-500/80 text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Center Stage: High-Res Zoomable Image */}
          <div
            className={`flex-1 relative overflow-hidden flex items-center justify-center p-4 sm:p-8 ${
              modalZoom > 1
                ? isDragging
                  ? 'cursor-grabbing'
                  : 'cursor-grab'
                : 'cursor-zoom-in'
            }`}
            onMouseDown={handleMouseDown}
            onTouchStart={handleTouchStart}
            onDoubleClick={toggleModalZoom}
          >
            <div
              className="relative transition-transform duration-100 ease-out will-change-transform max-w-full max-h-full"
              style={{
                transform: `scale(${modalZoom}) translate(${panPosition.x / modalZoom}px, ${panPosition.y / modalZoom}px)`,
              }}
            >
              <img
                src={safeImages[activeIndex]}
                alt={`${productName} zoomed view`}
                draggable={false}
                className="max-h-[75vh] max-w-[90vw] object-contain drop-shadow-2xl select-none"
              />
            </div>

            {/* Left Nav in Modal */}
            {safeImages.length > 1 && (
              <button
                type="button"
                onClick={handlePrev}
                title="Previous image"
                className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md text-white flex items-center justify-center transition-all hover:scale-110"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
            )}

            {/* Right Nav in Modal */}
            {safeImages.length > 1 && (
              <button
                type="button"
                onClick={handleNext}
                title="Next image"
                className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md text-white flex items-center justify-center transition-all hover:scale-110"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            )}

            {/* Zoom hint overlay on first open */}
            {modalZoom === 1 && (
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-white/80 text-xs pointer-events-none">
                Double-click or use controls to zoom • Click & drag to pan
              </div>
            )}
          </div>

          {/* Bottom Thumbnail Strip */}
          {safeImages.length > 1 && (
            <div className="p-3 bg-black/40 border-t border-white/10 flex justify-center items-center gap-2 overflow-x-auto scrollbar-thin z-20">
              {safeImages.map((img, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setActiveIndex(idx);
                    resetModalPan();
                  }}
                  className={`w-14 h-14 sm:w-16 sm:h-16 rounded-lg overflow-hidden border-2 bg-white/5 transition-all p-1 flex-shrink-0 cursor-pointer ${
                    idx === activeIndex
                      ? 'border-primary ring-2 ring-primary/40 scale-105 opacity-100'
                      : 'border-white/20 opacity-50 hover:opacity-100 hover:border-white/50'
                  }`}
                >
                  <img
                    src={img}
                    alt={`Thumb ${idx + 1}`}
                    className="w-full h-full object-contain"
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
