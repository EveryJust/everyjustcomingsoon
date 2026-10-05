'use client';

import React, { useState, useEffect } from 'react';
import { 
  Star, 
  Search, 
  Filter, 
  CheckCircle2, 
  EyeOff, 
  Trash2, 
  MessageSquare, 
  Package, 
  Users, 
  Sparkles, 
  Image as ImageIcon, 
  Video, 
  ExternalLink,
  ChevronDown,
  ChevronUp,
  X,
  Play,
  ThumbsUp,
  AlertCircle
} from 'lucide-react';
import toast from 'react-hot-toast';

interface ReviewMediaItem {
  url: string;
  type: 'image' | 'video';
}

interface Review {
  id: string;
  product_id?: string | null;
  product_name: string;
  product_image?: string | null;
  product_slug?: string | null;
  order_id?: string | null;
  order_number?: string | null;
  user_id?: string | null;
  user_name: string;
  user_email?: string | null;
  user_phone?: string | null;
  user_avatar?: string | null;
  rating: number;
  title?: string | null;
  comment: string;
  media: ReviewMediaItem[];
  verified_purchase: boolean;
  status: 'approved' | 'pending' | 'rejected' | 'hidden';
  helpful_count: number;
  created_at: string;
  updated_at: string;
}

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'latest' | 'products' | 'users'>('latest');
  const [searchQuery, setSearchQuery] = useState('');
  const [starFilter, setStarFilter] = useState<number | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [activeMedia, setActiveMedia] = useState<ReviewMediaItem | null>(null);
  const [expandedProduct, setExpandedProduct] = useState<string | null>(null);
  const [expandedUser, setExpandedUser] = useState<string | null>(null);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/reviews?status=all');
      const data = await res.json();
      if (data.success) {
        setReviews(data.reviews || []);
      }
    } catch (err: any) {
      toast.error('Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleStatusChange = async (id: string, newStatus: 'approved' | 'hidden') => {
    try {
      const res = await fetch('/api/reviews', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Review ${newStatus === 'approved' ? 'approved & visible' : 'hidden'}`);
        setReviews((prev) =>
          prev.map((r) => (r.id === id ? { ...r, status: newStatus } : r))
        );
      }
    } catch {
      toast.error('Failed to update review status');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to permanently delete this review?')) return;
    try {
      const res = await fetch(`/api/reviews?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Review deleted');
        setReviews((prev) => prev.filter((r) => r.id !== id));
      }
    } catch {
      toast.error('Failed to delete review');
    }
  };

  // KPIs
  const totalReviews = reviews.length;
  const avgRating = totalReviews > 0
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / totalReviews).toFixed(1)
    : '0.0';
  const fiveStarCount = reviews.filter((r) => r.rating === 5).length;
  const totalMedia = reviews.reduce((acc, r) => acc + (r.media?.length || 0), 0);

  // Filtered reviews for "Latest Posted"
  const filteredReviews = reviews.filter((r) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      r.product_name.toLowerCase().includes(q) ||
      r.user_name.toLowerCase().includes(q) ||
      (r.user_email && r.user_email.toLowerCase().includes(q)) ||
      r.comment.toLowerCase().includes(q) ||
      (r.order_number && r.order_number.toLowerCase().includes(q));

    const matchesStar = starFilter === 'all' || r.rating === starFilter;
    const matchesStatus = statusFilter === 'all' || r.status === statusFilter;

    return matchesSearch && matchesStar && matchesStatus;
  });

  // Grouped by product
  const productGroups: Record<string, { product_name: string; product_image?: string | null; reviews: Review[] }> = {};
  reviews.forEach((r) => {
    const key = r.product_name || 'General Products';
    if (!productGroups[key]) {
      productGroups[key] = {
        product_name: r.product_name,
        product_image: r.product_image,
        reviews: [],
      };
    }
    productGroups[key].reviews.push(r);
  });

  // Grouped by user
  const userGroups: Record<string, { user_name: string; user_email?: string | null; user_phone?: string | null; user_avatar?: string | null; reviews: Review[] }> = {};
  reviews.forEach((r) => {
    const key = r.user_email || r.user_phone || r.user_name || 'Anonymous';
    if (!userGroups[key]) {
      userGroups[key] = {
        user_name: r.user_name,
        user_email: r.user_email,
        user_phone: r.user_phone,
        user_avatar: r.user_avatar,
        reviews: [],
      };
    }
    userGroups[key].reviews.push(r);
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">
            Reviews & Ratings Management
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Moderate customer ratings, view photos/videos, and inspect feedback across products and users.
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Total Reviews</span>
            <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <MessageSquare size={16} />
            </div>
          </div>
          <div className="text-2xl font-black text-gray-900 mt-2">{totalReviews}</div>
          <p className="text-[11px] text-gray-400 mt-0.5">Across all store products</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Average Rating</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-500 flex items-center justify-center">
              <Star size={16} className="fill-amber-400" />
            </div>
          </div>
          <div className="text-2xl font-black text-gray-900 mt-2">{avgRating} <span className="text-sm text-gray-400 font-semibold">/ 5.0</span></div>
          <p className="text-[11px] text-emerald-600 font-medium mt-0.5">Customer satisfaction</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">5-Star Ratings</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Sparkles size={16} />
            </div>
          </div>
          <div className="text-2xl font-black text-gray-900 mt-2">{fiveStarCount}</div>
          <p className="text-[11px] text-gray-400 mt-0.5">
            {totalReviews > 0 ? Math.round((fiveStarCount / totalReviews) * 100) : 0}% of all reviews
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Media Uploads</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <ImageIcon size={16} />
            </div>
          </div>
          <div className="text-2xl font-black text-gray-900 mt-2">{totalMedia}</div>
          <p className="text-[11px] text-gray-400 mt-0.5">Photos & unboxing videos</p>
        </div>
      </div>

      {/* Pill Navigation (Tabs) */}
      <div className="bg-white p-2 rounded-2xl border border-gray-100 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 p-1 bg-gray-100/80 rounded-xl">
          <button
            type="button"
            onClick={() => setActiveTab('latest')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'latest'
                ? 'bg-white text-primary shadow-xs'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Latest Posted ({totalReviews})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('products')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'products'
                ? 'bg-white text-primary shadow-xs'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Package size={13} />
            <span>By Products ({Object.keys(productGroups).length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'users'
                ? 'bg-white text-primary shadow-xs'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Users size={13} />
            <span>By Users ({Object.keys(userGroups).length})</span>
          </button>
        </div>

        {/* Global Search Bar */}
        <div className="relative flex-1 max-w-xs min-w-[200px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search reviews, users, products..."
            className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-primary focus:bg-white transition-colors"
          />
        </div>
      </div>

      {/* TAB 1: LATEST POSTED REVIEWS */}
      {activeTab === 'latest' && (
        <div className="space-y-4">
          {/* Sub-filters for stars and status */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-gray-100 shadow-2xs">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs font-bold text-gray-500 mr-1 flex items-center gap-1">
                <Filter size={12} /> Stars:
              </span>
              {(['all', 5, 4, 3, 2, 1] as const).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setStarFilter(s)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                    starFilter === s
                      ? 'bg-primary text-white shadow-2xs'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {s === 'all' ? 'All' : `${s} ★`}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 text-xs">
              <span className="font-bold text-gray-500">Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-2.5 py-1 bg-gray-100 border border-gray-200 rounded-lg text-xs font-bold text-gray-800 focus:outline-none cursor-pointer"
              >
                <option value="all">All Status</option>
                <option value="approved">Approved</option>
                <option value="hidden">Hidden</option>
              </select>
            </div>
          </div>

          {/* Reviews Stream */}
          {loading ? (
            <div className="bg-white rounded-2xl p-12 text-center border border-gray-100 shadow-2xs">
              <div className="animate-spin rounded-full h-8 w-8 border-3 border-primary border-t-transparent mx-auto"></div>
              <p className="text-xs font-bold text-gray-600 mt-3">Loading reviews...</p>
            </div>
          ) : filteredReviews.length > 0 ? (
            <div className="space-y-3">
              {filteredReviews.map((rev) => {
                const dateStr = new Date(rev.created_at).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                });

                return (
                  <div
                    key={rev.id}
                    className="bg-white rounded-2xl border border-gray-100 p-5 shadow-2xs space-y-3 hover:border-gray-200 transition-all"
                  >
                    {/* Top Row: User & Product */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-100">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary/20 to-purple-200 text-primary font-black flex items-center justify-center text-sm shadow-inner flex-shrink-0">
                          {rev.user_avatar ? (
                            <img
                              src={rev.user_avatar}
                              alt={rev.user_name}
                              className="w-full h-full rounded-full object-cover"
                            />
                          ) : (
                            rev.user_name.charAt(0).toUpperCase()
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-gray-900 text-sm">{rev.user_name}</span>
                            {rev.verified_purchase && (
                              <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-full">
                                <CheckCircle2 size={11} className="stroke-[2.5]" /> Verified Buyer
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-gray-400">
                            {rev.user_email || rev.user_phone || 'Customer'} • {dateStr}
                          </p>
                        </div>
                      </div>

                      {/* Product thumbnail & order info */}
                      <div className="flex items-center gap-2.5 bg-gray-50 p-2 rounded-xl border border-gray-100">
                        <img
                          src={rev.product_image || '/dash_camera.png'}
                          alt={rev.product_name}
                          className="w-9 h-9 rounded-lg object-contain bg-white border border-gray-200 p-0.5 flex-shrink-0"
                        />
                        <div className="min-w-0 max-w-[200px]">
                          <p className="text-xs font-bold text-gray-800 truncate">{rev.product_name}</p>
                          {rev.order_number && (
                            <p className="text-[10px] font-mono text-gray-400">Order #{rev.order_number}</p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Middle: Rating, Title & Comment */}
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-0.5 text-amber-400">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              size={14}
                              className={i < rev.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-200'}
                            />
                          ))}
                        </div>
                        <span className="text-xs font-bold text-gray-900">{rev.title}</span>
                      </div>

                      <p className="text-xs text-gray-700 leading-relaxed whitespace-pre-line">
                        {rev.comment}
                      </p>
                    </div>

                    {/* Media Attachments */}
                    {rev.media && rev.media.length > 0 && (
                      <div className="pt-1 flex gap-2">
                        {rev.media.map((med, mIdx) => (
                          <div
                            key={mIdx}
                            onClick={() => setActiveMedia(med)}
                            className="w-16 h-16 rounded-xl bg-gray-100 border border-gray-200 overflow-hidden relative cursor-pointer hover:opacity-90 transition-opacity shadow-2xs group"
                          >
                            {med.type === 'video' ? (
                              <div className="w-full h-full bg-black flex items-center justify-center relative">
                                <video src={med.url} className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                  <Play size={16} className="text-white fill-white" />
                                </div>
                              </div>
                            ) : (
                              <img
                                src={med.url}
                                alt="Review attachment"
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                              />
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Bottom Action Bar */}
                    <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          rev.status === 'approved'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-gray-100 text-gray-600 border border-gray-200'
                        }`}>
                          {rev.status === 'approved' ? 'Live on Store' : 'Hidden'}
                        </span>
                        <span className="text-gray-400 flex items-center gap-1 text-[11px]">
                          <ThumbsUp size={11} /> {rev.helpful_count || 0} helpful votes
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        {rev.status === 'approved' ? (
                          <button
                            type="button"
                            onClick={() => handleStatusChange(rev.id, 'hidden')}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-100 text-[11px] font-bold transition-colors cursor-pointer"
                            title="Hide from store"
                          >
                            <EyeOff size={12} />
                            <span>Hide</span>
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleStatusChange(rev.id, 'approved')}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-600 text-white text-[11px] font-bold hover:bg-emerald-700 transition-colors shadow-2xs cursor-pointer"
                            title="Approve & show"
                          >
                            <CheckCircle2 size={12} />
                            <span>Approve</span>
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => handleDelete(rev.id)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 text-[11px] font-bold transition-colors cursor-pointer"
                          title="Delete permanently"
                        >
                          <Trash2 size={12} />
                          <span>Delete</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-white rounded-2xl p-12 text-center border border-gray-100 shadow-2xs space-y-2">
              <MessageSquare className="w-10 h-10 text-gray-300 mx-auto" />
              <p className="text-sm font-bold text-gray-800">No reviews match your filters</p>
              <p className="text-xs text-gray-400">Try adjusting your search query or rating filter.</p>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: BY PRODUCTS */}
      {activeTab === 'products' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-2xs divide-y divide-gray-100">
            {Object.entries(productGroups).map(([prodName, data]) => {
              const count = data.reviews.length;
              const prodAvg = (data.reviews.reduce((acc, r) => acc + r.rating, 0) / count).toFixed(1);
              const isExpanded = expandedProduct === prodName;

              return (
                <div key={prodName} className="p-4 sm:p-5 transition-colors hover:bg-gray-50/50">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3.5 min-w-0">
                      <img
                        src={data.product_image || '/dash_camera.png'}
                        alt={prodName}
                        className="w-12 h-12 rounded-xl object-contain bg-gray-50 border border-gray-200 p-1 flex-shrink-0"
                      />
                      <div className="min-w-0">
                        <h4 className="text-sm font-bold text-gray-900 leading-snug truncate max-w-sm sm:max-w-md">
                          {prodName}
                        </h4>
                        <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                          <span className="font-semibold text-gray-800">{count} {count === 1 ? 'Review' : 'Reviews'}</span>
                          <span>•</span>
                          <div className="flex items-center gap-1 text-amber-500 font-bold">
                            <Star size={13} className="fill-amber-400" />
                            <span>{prodAvg}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setExpandedProduct(isExpanded ? null : prodName)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                      >
                        <span>{isExpanded ? 'Collapse' : `View ${count} Reviews`}</span>
                        {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                      </button>
                    </div>
                  </div>

                  {/* Expanded Product Reviews List */}
                  {isExpanded && (
                    <div className="mt-4 pt-4 border-t border-gray-100 space-y-3 bg-gray-50/60 -mx-4 sm:-mx-5 px-4 sm:px-5 pb-3 rounded-b-xl animate-in fade-in duration-200">
                      {data.reviews.map((rev) => (
                        <div key={rev.id} className="bg-white p-3.5 rounded-xl border border-gray-200/70 text-xs space-y-1.5 shadow-2xs">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-gray-900">{rev.user_name}</span>
                            <div className="flex items-center gap-0.5 text-amber-400">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <Star
                                  key={i}
                                  size={12}
                                  className={i < rev.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-200'}
                                />
                              ))}
                            </div>
                          </div>
                          <p className="text-gray-700">{rev.comment}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: BY USERS */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-2xs divide-y divide-gray-100">
            {Object.entries(userGroups).map(([userKey, data]) => {
              const count = data.reviews.length;
              const userAvg = (data.reviews.reduce((acc, r) => acc + r.rating, 0) / count).toFixed(1);
              const isExpanded = expandedUser === userKey;

              return (
                <div key={userKey} className="p-4 sm:p-5 transition-colors hover:bg-gray-50/50">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-primary to-purple-600 text-white font-black flex items-center justify-center text-sm shadow-md flex-shrink-0">
                        {data.user_avatar ? (
                          <img
                            src={data.user_avatar}
                            alt={data.user_name}
                            className="w-full h-full rounded-full object-cover"
                          />
                        ) : (
                          data.user_name.charAt(0).toUpperCase()
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <h4 className="text-sm font-bold text-gray-900 leading-snug">{data.user_name}</h4>
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-full">
                            Verified Reviewer
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {data.user_email || data.user_phone || 'No direct contact'} • <strong className="text-gray-800">{count}</strong> posted reviews
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1 text-amber-500 font-bold text-xs">
                        <Star size={14} className="fill-amber-400" />
                        <span>Avg: {userAvg}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setExpandedUser(isExpanded ? null : userKey)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                      >
                        <span>{isExpanded ? 'Collapse' : `View ${count} Reviews`}</span>
                        {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                      </button>
                    </div>
                  </div>

                  {/* Expanded User Reviews */}
                  {isExpanded && (
                    <div className="mt-4 pt-4 border-t border-gray-100 space-y-3 bg-gray-50/60 -mx-4 sm:-mx-5 px-4 sm:px-5 pb-3 rounded-b-xl animate-in fade-in duration-200">
                      {data.reviews.map((rev) => (
                        <div key={rev.id} className="bg-white p-3.5 rounded-xl border border-gray-200/70 text-xs space-y-1.5 shadow-2xs">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-gray-900 text-xs">{rev.product_name}</span>
                            <div className="flex items-center gap-0.5 text-amber-400">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <Star
                                  key={i}
                                  size={12}
                                  className={i < rev.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-200'}
                                />
                              ))}
                            </div>
                          </div>
                          <p className="text-gray-700">{rev.comment}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Lightbox Media Modal */}
      {activeMedia && (
        <div
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setActiveMedia(null)}
        >
          <div
            className="relative max-w-3xl w-full max-h-[85vh] flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setActiveMedia(null)}
              className="absolute -top-12 right-0 p-2 text-white/80 hover:text-white bg-white/10 rounded-full transition-colors cursor-pointer"
            >
              <X size={24} />
            </button>
            {activeMedia.type === 'video' ? (
              <video
                src={activeMedia.url}
                controls
                autoPlay
                className="max-h-[80vh] w-auto max-w-full rounded-2xl shadow-2xl bg-black"
              />
            ) : (
              <img
                src={activeMedia.url}
                alt="Enlarged review photo"
                className="max-h-[80vh] w-auto max-w-full rounded-2xl shadow-2xl object-contain bg-black/20"
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
