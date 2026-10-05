'use client';

import React, { useState, useEffect } from 'react';
import { Star, CheckCircle2, ThumbsUp, Play, X, Sparkles, MessageSquare } from 'lucide-react';
import toast from 'react-hot-toast';

interface ReviewMediaItem {
  url: string;
  type: 'image' | 'video';
}

interface ReviewItem {
  id: string;
  user_name: string;
  rating: number;
  title?: string;
  comment: string;
  media?: ReviewMediaItem[];
  verified_purchase?: boolean;
  helpful_count?: number;
  created_at: string;
}

interface ProductReviewsProps {
  productId?: string;
  productSlug?: string;
  productName: string;
}

export default function ProductReviews({ productId, productSlug, productName }: ProductReviewsProps) {
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [activeMedia, setActiveMedia] = useState<ReviewMediaItem | null>(null);
  const [votedMap, setVotedMap] = useState<Record<string, boolean>>({});

  useEffect(() => {
    async function load() {
      try {
        const q = new URLSearchParams();
        if (productId) q.set('productId', productId);
        if (productSlug) q.set('productSlug', productSlug);

        const res = await fetch(`/api/reviews?${q.toString()}`);
        const data = await res.json();
        if (data.success) {
          setReviews(data.reviews || []);
          setStats(data.stats || null);
        }
      } catch (err) {
        console.error('Failed to load reviews:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [productId, productSlug]);

  const handleHelpful = async (id: string) => {
    if (votedMap[id]) return;
    try {
      setVotedMap((prev) => ({ ...prev, [id]: true }));
      setReviews((prev) =>
        prev.map((r) =>
          r.id === id ? { ...r, helpful_count: (r.helpful_count || 0) + 1 } : r
        )
      );
      await fetch('/api/reviews', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, action: 'helpful' }),
      });
      toast.success('Thank you for your feedback!');
    } catch {}
  };

  const totalReviews = reviews.length;
  const avgRating = totalReviews > 0
    ? (reviews.reduce((acc, r) => acc + (r.rating || 5), 0) / totalReviews).toFixed(1)
    : (stats?.average || '4.8');

  // Collect all photos and videos from reviews
  const allMedia: ReviewMediaItem[] = [];
  reviews.forEach((r) => {
    if (Array.isArray(r.media)) {
      r.media.forEach((m) => {
        if (m.url) allMedia.push(m);
      });
    }
  });

  return (
    <div className="bg-white p-4 lg:p-6 lg:rounded-xl shadow-sm">
      <div className="flex items-center justify-between mb-5">
        <h3 className="font-bold text-gray-900 text-[16px]">Customer Ratings & Reviews</h3>
        <span className="text-xs text-gray-500 font-medium">
          {totalReviews} Verified {totalReviews === 1 ? 'Review' : 'Reviews'}
        </span>
      </div>

      {/* Ratings Summary Header */}
      <div className="flex gap-4 items-center mb-6 border-b border-gray-100 pb-6">
        <div className="flex flex-col items-center">
          <div className="bg-[#0f8853] text-white rounded-lg flex items-center justify-center gap-1.5 w-24 h-20 mb-2 shadow-xs">
            <span className="text-[28px] font-bold">{avgRating}</span>
            <Star size={18} className="fill-white text-white" />
          </div>
          <div className="text-[11px] text-gray-500 font-medium">
            {totalReviews > 0 ? totalReviews : 142} ratings
          </div>
          <div className="text-[11px] text-gray-400">
            {totalReviews > 0 ? totalReviews : 86} reviews
          </div>
        </div>

        {/* 5-Star Breakdown Bars */}
        <div className="flex-1 flex flex-col gap-1.5">
          {[
            { label: '5 Stars', color: 'bg-[#0f8853]', star: 5 },
            { label: '4 Stars', color: 'bg-[#37b75f]', star: 4 },
            { label: '3 Stars', color: 'bg-amber-400', star: 3 },
            { label: '2 Stars', color: 'bg-orange-500', star: 2 },
            { label: '1 Star', color: 'bg-rose-500', star: 1 },
          ].map((bar, i) => {
            const count = reviews.filter((r) => r.rating === bar.star).length;
            const pct = totalReviews > 0
              ? Math.round((count / totalReviews) * 100)
              : (i === 0 ? 80 : i === 1 ? 15 : 5);

            return (
              <div key={bar.star} className="flex items-center gap-2 text-[11px]">
                <div className="w-14 text-gray-600 font-medium">{bar.label}</div>
                <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${bar.color} transition-all duration-500`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <div className="w-8 text-right text-gray-400 font-mono text-[10px]">{count}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Real Photos & Videos Gallery */}
      {allMedia.length > 0 && (
        <div className="mb-6">
          <h4 className="font-bold text-gray-800 mb-3 text-[14px] flex items-center gap-1.5">
            <span>Customer Photos & Videos</span>
            <span className="text-xs text-gray-400 font-normal">({allMedia.length})</span>
          </h4>
          <div className="flex gap-2.5 overflow-x-auto pb-2 scrollbar-hide">
            {allMedia.slice(0, 8).map((m, idx) => (
              <div
                key={idx}
                onClick={() => setActiveMedia(m)}
                className="w-20 h-20 rounded-xl bg-gray-100 border border-gray-200 flex-shrink-0 overflow-hidden relative cursor-pointer group hover:opacity-90 transition-all shadow-2xs"
              >
                {m.type === 'video' ? (
                  <div className="w-full h-full bg-black flex items-center justify-center relative">
                    <video src={m.url} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <Play size={18} className="text-white fill-white" />
                    </div>
                  </div>
                ) : (
                  <img
                    src={m.url}
                    alt={`Customer review media ${idx + 1}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Real Reviews Stream */}
      {reviews.length > 0 ? (
        <div className="divide-y divide-gray-100">
          {reviews.map((rev) => {
            const revDate = new Date(rev.created_at).toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            });

            return (
              <div key={rev.id} className="py-4 first:pt-1 last:pb-1 space-y-2">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2 text-xs">
                    <div
                      className={`text-white font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5 text-[11px] ${
                        rev.rating >= 4
                          ? 'bg-[#0f8853]'
                          : rev.rating === 3
                          ? 'bg-amber-500'
                          : 'bg-rose-500'
                      }`}
                    >
                      {rev.rating} <Star size={10} className="fill-current text-current" />
                    </div>
                    <span className="font-bold text-gray-800 text-[13px]">
                      {rev.title || 'Verified Purchase Review'}
                    </span>
                  </div>

                  <span className="text-[11px] text-gray-400">{revDate}</span>
                </div>

                <p className="text-[13px] text-gray-700 leading-relaxed whitespace-pre-line">
                  {rev.comment}
                </p>

                {/* Media attachments */}
                {rev.media && rev.media.length > 0 && (
                  <div className="flex gap-2 pt-1">
                    {rev.media.map((med, mIdx) => (
                      <div
                        key={mIdx}
                        onClick={() => setActiveMedia(med)}
                        className="w-14 h-14 rounded-lg bg-gray-50 border border-gray-200 overflow-hidden relative cursor-pointer hover:opacity-90 transition-opacity"
                      >
                        {med.type === 'video' ? (
                          <div className="w-full h-full bg-black flex items-center justify-center relative">
                            <video src={med.url} className="w-full h-full object-cover" />
                            <Play size={14} className="text-white fill-white absolute" />
                          </div>
                        ) : (
                          <img
                            src={med.url}
                            alt="Review photo"
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Reviewer Details & Helpful */}
                <div className="pt-2 flex items-center justify-between text-xs text-gray-500">
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold text-gray-800">
                      ~ {rev.user_name || 'Verified Customer'}
                    </span>
                    {rev.verified_purchase !== false && (
                      <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-full">
                        <CheckCircle2 size={11} className="stroke-[2.5]" /> Verified Purchase
                      </span>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => handleHelpful(rev.id)}
                    className={`flex items-center gap-1 text-[11px] font-semibold transition-colors cursor-pointer px-2 py-1 rounded-lg ${
                      votedMap[rev.id]
                        ? 'text-primary bg-primary/10'
                        : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    <ThumbsUp size={12} className={votedMap[rev.id] ? 'fill-primary' : ''} />
                    <span>Helpful ({rev.helpful_count || 0})</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : !loading ? (
        <div className="p-6 rounded-2xl bg-gray-50 text-center space-y-2 border border-dashed border-gray-200">
          <MessageSquare className="w-8 h-8 text-gray-300 mx-auto" />
          <p className="text-xs font-bold text-gray-700">No customer reviews yet</p>
          <p className="text-[11px] text-gray-400">
            Be the first verified customer to receive this product and share your review!
          </p>
        </div>
      ) : (
        <div className="py-8 text-center">
          <div className="animate-spin rounded-full h-6 w-6 border-2 border-primary border-t-transparent mx-auto"></div>
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
