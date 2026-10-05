'use client';

import React, { useState } from 'react';
import { 
  X, 
  Star, 
  Upload, 
  Image as ImageIcon, 
  Video, 
  Trash2, 
  Check, 
  ArrowRight, 
  ArrowLeft, 
  Loader2, 
  Sparkles,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import toast from 'react-hot-toast';
import { uploadToCloudinary } from '@/utils/uploadCloudinary';

interface ReviewMediaItem {
  url: string;
  type: 'image' | 'video';
  file?: File;
  previewUrl?: string;
  isUploading?: boolean;
}

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: {
    id?: string;
    name: string;
    image?: string;
    slug?: string;
  };
  order: {
    id?: string;
    order_number: string;
  };
  user: any; // User object from useAuthStore
  onSuccess?: () => void;
}

const RATING_DESCRIPTIONS: Record<number, { label: string; color: string; desc: string }> = {
  1: { label: 'Poor', color: 'text-rose-500', desc: 'Very dissatisfied with the product quality or delivery.' },
  2: { label: 'Fair', color: 'text-orange-500', desc: 'Product was okay, but had some issues.' },
  3: { label: 'Average', color: 'text-amber-500', desc: 'Met basic expectations, decent product.' },
  4: { label: 'Good', color: 'text-emerald-500', desc: 'Satisfied, worked well and good quality.' },
  5: { label: 'Excellent!', color: 'text-emerald-600', desc: 'Exceeded expectations, loved the product!' },
};

const SUGGESTED_TAGS = [
  'High Quality',
  'Value for Money',
  'Fast Delivery',
  'Accurate Description',
  'Easy Setup',
  'Great Packaging',
  'Durable'
];

export default function ReviewModal({
  isOpen,
  onClose,
  product,
  order,
  user,
  onSuccess,
}: ReviewModalProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [mediaList, setMediaList] = useState<ReviewMediaItem[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  // Verify login requirement
  if (!user) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
        <div className="bg-white max-w-md w-full rounded-3xl p-6 sm:p-8 text-center space-y-4 shadow-2xl border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center mx-auto">
            <AlertCircle size={28} />
          </div>
          <h3 className="text-lg font-black text-gray-900">Login Required to Review</h3>
          <p className="text-xs text-gray-500 leading-relaxed">
            Only verified and logged-in customers who have received their delivered orders can submit feedback. Please log in to share your experience.
          </p>
          <div className="flex gap-2 pt-2">
            <button
              onClick={onClose}
              type="button"
              className="flex-1 py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <a
              href={`/account?redirect=/orders/${encodeURIComponent(order.order_number)}`}
              className="flex-1 py-2.5 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary/95 flex items-center justify-center"
            >
              Log In Now
            </a>
          </div>
        </div>
      </div>
    );
  }

  const activeRating = hoverRating || rating;
  const ratingInfo = RATING_DESCRIPTIONS[activeRating] || RATING_DESCRIPTIONS[5];

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newItems: ReviewMediaItem[] = [];
    const maxFiles = 5;
    const remainingSlots = maxFiles - mediaList.length;

    if (remainingSlots <= 0) {
      toast.error('You can upload up to 5 photos or videos in total.');
      return;
    }

    const filesToUpload = Array.from(files).slice(0, remainingSlots);

    for (const file of filesToUpload) {
      const isVideo = file.type.startsWith('video/');
      const previewUrl = URL.createObjectURL(file);
      newItems.push({
        url: '',
        previewUrl,
        type: isVideo ? 'video' : 'image',
        file,
        isUploading: true,
      });
    }

    setMediaList((prev) => [...prev, ...newItems]);

    // Upload each to Cloudinary
    for (let i = 0; i < filesToUpload.length; i++) {
      const file = filesToUpload[i];
      try {
        const uploadedUrl = await uploadToCloudinary(file);
        setMediaList((prev) =>
          prev.map((item) =>
            item.file === file
              ? { ...item, url: uploadedUrl, isUploading: false }
              : item
          )
        );
      } catch (err: any) {
        toast.error(`Failed to upload ${file.name}: ${err.message}`);
        setMediaList((prev) => prev.filter((item) => item.file !== file));
      }
    }
  };

  const handleRemoveMedia = (index: number) => {
    setMediaList((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleTagToggle = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags((prev) => prev.filter((t) => t !== tag));
    } else {
      setSelectedTags((prev) => [...prev, tag]);
    }
  };

  const handleSubmitReview = async () => {
    if (!comment.trim()) {
      toast.error('Please write a short review or feedback.');
      return;
    }

    // Check if any media is still uploading
    if (mediaList.some((m) => m.isUploading)) {
      toast.error('Please wait until your photos/videos finish uploading.');
      return;
    }

    setIsSubmitting(true);

    try {
      const cleanMedia = mediaList
        .filter((m) => m.url)
        .map((m) => ({ url: m.url, type: m.type }));

      let finalComment = comment.trim();
      if (selectedTags.length > 0) {
        finalComment += `\n\nKey Highlights: ${selectedTags.join(', ')}`;
      }

      const userName = 
        user.user_metadata?.full_name || 
        user.user_metadata?.name || 
        user.email?.split('@')[0] || 
        'Verified Buyer';

      const payload = {
        product_id: product.id || null,
        product_name: product.name,
        product_image: product.image || '/dash_camera.png',
        product_slug: product.slug || null,
        order_id: order.id || null,
        order_number: order.order_number,
        user_id: user.id || null,
        user_name: userName,
        user_email: user.email || null,
        user_phone: user.phone || user.user_metadata?.phone || null,
        user_avatar: user.user_metadata?.avatar_url || null,
        rating,
        title: title.trim() || ratingInfo.label,
        comment: finalComment,
        media: cleanMedia,
        verified_purchase: true,
        status: 'approved',
      };

      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to submit review');
      }

      toast.success('Thank you! Your review has been published.');
      setSubmitted(true);
      if (onSuccess) onSuccess();
    } catch (err: any) {
      toast.error(err.message || 'Error submitting review');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
      <div 
        className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-gray-100 overflow-hidden my-auto max-h-[92vh] flex flex-col animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="p-4 sm:p-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white border border-gray-200 p-1 flex items-center justify-center flex-shrink-0">
              <img
                src={product.image || '/dash_camera.png'}
                alt={product.name}
                className="w-full h-full object-contain"
              />
            </div>
            <div className="min-w-0">
              <h3 className="text-xs sm:text-sm font-bold text-gray-900 truncate max-w-[220px] sm:max-w-xs">
                {product.name}
              </h3>
              <p className="text-[11px] text-gray-400">
                Verified Purchase • #{order.order_number}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            type="button"
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Stepper indicator */}
        {!submitted && (
          <div className="px-6 pt-4 pb-2 border-b border-gray-50">
            <div className="flex items-center justify-between text-[11px] font-bold text-gray-500 mb-2">
              <span className={step >= 1 ? 'text-primary' : ''}>1. Rating</span>
              <span className={step >= 2 ? 'text-primary' : ''}>2. Photos & Videos</span>
              <span className={step >= 3 ? 'text-primary' : ''}>3. Comment</span>
            </div>
            <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary transition-all duration-300"
                style={{ width: step === 1 ? '33.3%' : step === 2 ? '66.6%' : '100%' }}
              />
            </div>
          </div>
        )}

        {/* Content Area */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1">
          {submitted ? (
            <div className="py-8 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner animate-bounce">
                <Check size={32} className="stroke-[3]" />
              </div>
              <h4 className="text-xl font-black text-gray-900">Review Submitted!</h4>
              <p className="text-xs text-gray-500 max-w-sm mx-auto leading-relaxed">
                Thank you for taking the time to share your feedback. Your review helps other customers make better shopping choices.
              </p>
              <div className="pt-4">
                <button
                  onClick={onClose}
                  type="button"
                  className="px-6 py-2.5 bg-primary text-white text-xs font-bold rounded-xl hover:bg-primary/95 transition-all shadow-xs cursor-pointer"
                >
                  Done
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* STEP 1: OVERALL RATING */}
              {step === 1 && (
                <div className="space-y-6 text-center animate-in fade-in duration-200">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-primary bg-primary/10 px-2.5 py-0.5 rounded-full">
                      Step 1 of 3
                    </span>
                    <h4 className="text-base sm:text-lg font-black text-gray-900 pt-1">
                      How would you rate this product?
                    </h4>
                    <p className="text-xs text-gray-500">
                      Tap the stars below to give your overall rating
                    </p>
                  </div>

                  {/* Large 5 Stars */}
                  <div className="flex items-center justify-center gap-2 sm:gap-3 py-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(null)}
                        className="p-1 focus:outline-none transition-transform hover:scale-115 active:scale-95 cursor-pointer"
                      >
                        <Star
                          size={36}
                          className={`transition-colors ${
                            star <= activeRating
                              ? 'text-amber-400 fill-amber-400 drop-shadow-sm'
                              : 'text-gray-200 fill-gray-100 hover:text-amber-200'
                          }`}
                        />
                      </button>
                    ))}
                  </div>

                  {/* Rating Label and Description */}
                  <div className="bg-gray-50/80 p-3 rounded-2xl border border-gray-100">
                    <p className={`text-base font-black ${ratingInfo.color}`}>
                      {ratingInfo.label} ({activeRating}/5)
                    </p>
                    <p className="text-[11px] text-gray-500 mt-0.5 font-medium">
                      {ratingInfo.desc}
                    </p>
                  </div>

                  {/* Review Headline / Title */}
                  <div className="text-left space-y-1.5 pt-2">
                    <label className="text-xs font-bold text-gray-800">
                      Review Headline <span className="text-gray-400 font-normal">(Optional)</span>
                    </label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g. Excellent build quality & fast delivery!"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                    />
                  </div>
                </div>
              )}

              {/* STEP 2: PHOTOS AND VIDEOS */}
              {step === 2 && (
                <div className="space-y-5 animate-in fade-in duration-200">
                  <div className="text-center space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-primary bg-primary/10 px-2.5 py-0.5 rounded-full">
                      Step 2 of 3
                    </span>
                    <h4 className="text-base sm:text-lg font-black text-gray-900 pt-1">
                      Add Photos & Videos
                    </h4>
                    <p className="text-xs text-gray-500">
                      Show other buyers how the product looks in real life (optional)
                    </p>
                  </div>

                  {/* Upload Zone */}
                  <label className="border-2 border-dashed border-gray-200 hover:border-primary rounded-2xl p-6 flex flex-col items-center justify-center gap-2 cursor-pointer bg-gray-50/50 hover:bg-primary/5 transition-all text-center">
                    <input
                      type="file"
                      accept="image/*,video/*"
                      multiple
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                    <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                      <Upload size={22} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-800">
                        Click to upload photos or unboxing videos
                      </p>
                      <p className="text-[10px] text-gray-400 mt-0.5">
                        JPG, PNG, MP4, MOV up to 5 items
                      </p>
                    </div>
                  </label>

                  {/* Media Previews */}
                  {mediaList.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-[11px] font-bold text-gray-600">
                        Uploaded Media ({mediaList.length}/5)
                      </p>
                      <div className="grid grid-cols-3 gap-2.5">
                        {mediaList.map((item, idx) => (
                          <div
                            key={idx}
                            className="relative aspect-square rounded-xl bg-gray-100 overflow-hidden border border-gray-200 group"
                          >
                            {item.type === 'video' ? (
                              <div className="w-full h-full flex items-center justify-center bg-gray-900 text-white relative">
                                <video
                                  src={item.url || item.previewUrl}
                                  className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                                  <Video size={20} className="text-white" />
                                </div>
                              </div>
                            ) : (
                              <img
                                src={item.url || item.previewUrl}
                                alt={`Media ${idx + 1}`}
                                className="w-full h-full object-cover"
                              />
                            )}

                            {/* Loading overlay */}
                            {item.isUploading && (
                              <div className="absolute inset-0 bg-black/50 backdrop-blur-xs flex flex-col items-center justify-center text-white gap-1">
                                <Loader2 size={18} className="animate-spin text-white" />
                                <span className="text-[9px] font-bold">Uploading</span>
                              </div>
                            )}

                            {/* Remove button */}
                            <button
                              type="button"
                              onClick={() => handleRemoveMedia(idx)}
                              className="absolute top-1.5 right-1.5 p-1 bg-black/60 hover:bg-rose-600 text-white rounded-md transition-colors"
                              title="Remove"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="bg-blue-50/70 p-3 rounded-xl border border-blue-100 flex items-start gap-2.5 text-xs text-blue-800">
                    <Sparkles size={16} className="text-blue-600 flex-shrink-0 mt-0.5" />
                    <span>Real buyer photos and videos get featured at the top of the product page!</span>
                  </div>
                </div>
              )}

              {/* STEP 3: COMMENT & FEEDBACK */}
              {step === 3 && (
                <div className="space-y-4 animate-in fade-in duration-200">
                  <div className="text-center space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-primary bg-primary/10 px-2.5 py-0.5 rounded-full">
                      Step 3 of 3
                    </span>
                    <h4 className="text-base sm:text-lg font-black text-gray-900 pt-1">
                      Detailed Review & Feedback
                    </h4>
                    <p className="text-xs text-gray-500">
                      Share what you liked, disliked, and why you recommend it
                    </p>
                  </div>

                  {/* Rating preview pill */}
                  <div className="flex items-center justify-between bg-gray-50 px-3.5 py-2 rounded-xl border border-gray-100">
                    <span className="text-xs text-gray-600 font-medium">Your Rating:</span>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          size={14}
                          className={i < rating ? 'text-amber-400 fill-amber-400' : 'text-gray-200'}
                        />
                      ))}
                      <span className="text-xs font-bold text-gray-900 ml-1">
                        {ratingInfo.label}
                      </span>
                    </div>
                  </div>

                  {/* Quick Highlight Tags */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-700">
                      What stood out the most?
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      {SUGGESTED_TAGS.map((tag) => {
                        const isSelected = selectedTags.includes(tag);
                        return (
                          <button
                            key={tag}
                            type="button"
                            onClick={() => handleTagToggle(tag)}
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-colors cursor-pointer ${
                              isSelected
                                ? 'bg-primary text-white border-primary shadow-xs'
                                : 'bg-gray-50 text-gray-700 border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            {isSelected && <Check size={11} className="inline mr-1 stroke-[3]" />}
                            {tag}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Comment Textarea */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-800">
                      Your Comments <span className="text-rose-500">*</span>
                    </label>
                    <textarea
                      rows={4}
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="Write your genuine experience with the product. Mention quality, ease of use, durability..."
                      className="w-full p-3 rounded-xl border border-gray-200 text-xs text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 resize-none"
                    />
                  </div>

                  {/* Verified Buyer Badge */}
                  <div className="flex items-center gap-2 p-2.5 rounded-xl bg-emerald-50 text-emerald-800 text-[11px]">
                    <ShieldCheck size={16} className="text-emerald-600 flex-shrink-0" />
                    <span>Your review will display a <strong>Verified Buyer</strong> badge.</span>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Modal Bottom Navigation */}
        {!submitted && (
          <div className="p-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep((s) => (s - 1) as 1 | 2 | 3)}
                className="px-4 py-2 rounded-xl border border-gray-200 text-xs font-bold text-gray-700 hover:bg-gray-100 transition-colors flex items-center gap-1 cursor-pointer"
              >
                <ArrowLeft size={13} />
                <span>Back</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-bold text-gray-500 hover:text-gray-800 transition-colors cursor-pointer"
              >
                Cancel
              </button>
            )}

            {step < 3 ? (
              <button
                type="button"
                onClick={() => setStep((s) => (s + 1) as 1 | 2 | 3)}
                className="px-5 py-2 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary/95 transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <span>Continue</span>
                <ArrowRight size={13} />
              </button>
            ) : (
              <button
                type="button"
                disabled={isSubmitting || !comment.trim()}
                onClick={handleSubmitReview}
                className="px-6 py-2 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary/95 transition-colors flex items-center gap-1.5 shadow-xs disabled:opacity-50 cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={13} className="animate-spin" />
                    <span>Submitting...</span>
                  </>
                ) : (
                  <>
                    <Check size={13} className="stroke-[3]" />
                    <span>Submit Review</span>
                  </>
                )}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
