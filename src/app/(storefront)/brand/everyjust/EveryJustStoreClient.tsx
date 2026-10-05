'use client';
import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import ProductCard from '@/components/ProductCard';
import toast from 'react-hot-toast';
import { 
  CheckCircle2, 
  Share2, 
  ExternalLink, 
  Star, 
  Search, 
  ChevronRight, 
  Heart,
  PackageCheck
} from 'lucide-react';

function InstagramIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
    </svg>
  );
}

interface EveryJustStoreClientProps {
  products: any[];
}

export default function EveryJustStoreClient({ products }: EveryJustStoreClientProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState<'featured' | 'price_low' | 'price_high' | 'rating' | 'newest'>('featured');
  const [isFollowing, setIsFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState(28420);

  // Extract unique categories from products if available
  const availableCategories = useMemo(() => {
    const cats = new Set<string>();
    products.forEach((p) => {
      if (p.category) cats.add(p.category);
      if (p.categories?.name) cats.add(p.categories.name);
      if (Array.isArray(p.product_categories)) {
        p.product_categories.forEach((pc: any) => {
          if (pc.categories?.name) cats.add(pc.categories.name);
        });
      }
    });
    return Array.from(cats);
  }, [products]);

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    return products
      .filter((product) => {
        if (searchQuery.trim()) {
          const query = searchQuery.toLowerCase();
          const matchName = product.name?.toLowerCase().includes(query);
          const matchDesc = product.description?.toLowerCase().includes(query);
          if (!matchName && !matchDesc) return false;
        }

        if (selectedCategory !== 'all') {
          const catStr = JSON.stringify(product).toLowerCase();
          if (!catStr.includes(selectedCategory.toLowerCase())) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        const priceA = a.offer_price || a.price || 0;
        const priceB = b.offer_price || b.price || 0;

        if (sortBy === 'price_low') return priceA - priceB;
        if (sortBy === 'price_high') return priceB - priceA;
        if (sortBy === 'newest') {
          return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
        }
        return 0;
      });
  }, [products, searchQuery, selectedCategory, sortBy]);

  const handleToggleFollow = () => {
    if (!isFollowing) {
      setIsFollowing(true);
      setFollowerCount((prev) => prev + 1);
      toast.success('Following EveryJust Official');
    } else {
      setIsFollowing(false);
      setFollowerCount((prev) => prev - 1);
      toast('Unfollowed', { icon: '👋' });
    }
  };

  const handleShare = async () => {
    const storeUrl = typeof window !== 'undefined' ? window.location.href : 'https://everyjust.com/brand/everyjust';
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: 'EveryJust Store',
          url: storeUrl,
        });
      } catch {
        await navigator.clipboard.writeText(storeUrl);
        toast.success('Link copied');
      }
    } else if (typeof navigator !== 'undefined' && navigator.clipboard) {
      await navigator.clipboard.writeText(storeUrl);
      toast.success('Link copied');
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen py-4 sm:py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Simple Breadcrumb */}
        <div className="flex items-center text-xs text-gray-500 gap-1.5 mb-4">
          <Link href="/" className="hover:text-gray-900 transition-colors">Home</Link>
          <ChevronRight className="w-3 h-3 text-gray-400" />
          <Link href="/brands" className="hover:text-gray-900 transition-colors">Brands</Link>
          <ChevronRight className="w-3 h-3 text-gray-400" />
          <span className="font-semibold text-gray-800">EveryJust</span>
        </div>

        {/* Clean, Simple Profile Card */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 mb-6 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            
            {/* Left: Avatar + Details */}
            <div className="flex items-start sm:items-center gap-4">
              <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-xl bg-gray-900 text-white flex items-center justify-center font-bold text-xl flex-shrink-0 shadow-xs">
                EJ
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-bold text-gray-900">EveryJust</h1>
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    Verified Official
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-gray-600">
                  <span className="text-gray-500">Sold by EveryJust</span>
                  <span>•</span>
                  <div className="inline-flex items-center gap-1 bg-[#0f8853] text-white font-bold px-1.5 py-0.2 rounded text-[11px]">
                    4.9 <Star className="w-2.5 h-2.5 fill-current" />
                  </div>
                  <span className="text-gray-500">(14,280+ ratings)</span>
                  <span>•</span>
                  <span>{products.length} Products</span>
                </div>

                {/* Instagram Link & Short Bio */}
                <div className="flex flex-wrap items-center gap-2 mt-2">
                  <a
                    href="https://www.instagram.com/everyjustofficial/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-pink-600 hover:text-pink-700 transition-colors"
                  >
                    <InstagramIcon className="w-3.5 h-3.5" />
                    <span>@everyjustofficial</span>
                    <ExternalLink className="w-3 h-3 text-gray-400" />
                  </a>
                  <span className="text-gray-300">|</span>
                  <span className="text-xs text-gray-500">Official Flagship Store</span>
                </div>
              </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-2 pt-2 sm:pt-0">
              <button
                onClick={handleToggleFollow}
                className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-colors cursor-pointer ${
                  isFollowing
                    ? 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                    : 'bg-primary text-white hover:bg-primary/90'
                }`}
              >
                {isFollowing ? 'Following' : 'Follow'}
              </button>

              <button
                onClick={handleShare}
                aria-label="Share Store"
                className="p-2 rounded-lg border border-gray-200 text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors cursor-pointer"
                title="Share store"
              >
                <Share2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Clean Filter & Search Toolbar */}
        <div className="bg-white rounded-xl border border-gray-200 p-3 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
          {/* Search */}
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products..."
              className="w-full pl-9 pr-3 py-1.5 border border-gray-200 rounded-lg text-xs sm:text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-primary"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            )}
          </div>

          {/* Category & Sort */}
          <div className="flex items-center gap-2">
            {availableCategories.length > 0 && (
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs text-gray-700 bg-white font-medium focus:outline-none focus:border-primary cursor-pointer"
              >
                <option value="all">All Categories</option>
                {availableCategories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            )}

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs text-gray-700 bg-white font-medium focus:outline-none focus:border-primary cursor-pointer"
            >
              <option value="featured">Featured</option>
              <option value="price_low">Price: Low to High</option>
              <option value="price_high">Price: High to Low</option>
              <option value="newest">Newest</option>
            </select>
          </div>
        </div>

        {/* Section Heading with count */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base sm:text-lg font-bold text-gray-900">
            Products ({filteredProducts.length})
          </h2>
          {(searchQuery || selectedCategory !== 'all') && (
            <button
              onClick={() => { setSearchQuery(''); setSelectedCategory('all'); }}
              className="text-xs text-primary font-medium hover:underline cursor-pointer"
            >
              Clear filters
            </button>
          )}
        </div>

        {/* Product Grid */}
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5 sm:gap-4">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl p-10 text-center border border-gray-200 max-w-sm mx-auto my-6">
            <PackageCheck className="w-10 h-10 text-gray-300 mx-auto mb-2" />
            <p className="text-sm font-semibold text-gray-700">No products found</p>
            <p className="text-xs text-gray-400 mt-1 mb-3">Try adjusting your search query</p>
            <button
              onClick={() => { setSearchQuery(''); setSelectedCategory('all'); }}
              className="text-xs text-primary font-bold hover:underline cursor-pointer"
            >
              Show all products
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
