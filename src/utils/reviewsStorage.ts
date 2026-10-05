import fs from 'fs';
import path from 'path';
import { createClient } from './supabase/server';

export interface ReviewMedia {
  url: string;
  type: 'image' | 'video';
}

export interface Review {
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
  rating: number; // 1 to 5
  title?: string | null;
  comment: string;
  media: ReviewMedia[];
  verified_purchase: boolean;
  status: 'approved' | 'pending' | 'rejected' | 'hidden';
  helpful_count: number;
  created_at: string;
  updated_at: string;
}

const REVIEWS_FILE_PATH = path.join(process.cwd(), 'src', 'data', 'reviews.json');

function readLocalReviews(): Review[] {
  try {
    if (fs.existsSync(REVIEWS_FILE_PATH)) {
      const data = fs.readFileSync(REVIEWS_FILE_PATH, 'utf-8');
      return JSON.parse(data) as Review[];
    }
  } catch (err) {
    console.error('Error reading local reviews:', err);
  }
  return [];
}

function writeLocalReviews(reviews: Review[]): boolean {
  try {
    const dir = path.dirname(REVIEWS_FILE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(REVIEWS_FILE_PATH, JSON.stringify(reviews, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error('Error writing local reviews:', err);
    return false;
  }
}

export async function fetchReviewsFromDb(filter?: {
  productId?: string;
  productSlug?: string;
  userId?: string;
  orderNumber?: string;
  status?: string;
}): Promise<Review[]> {
  try {
    const supabase = await createClient();
    let query = supabase.from('reviews').select('*').order('created_at', { ascending: false });

    if (filter?.productId) {
      query = query.eq('product_id', filter.productId);
    }
    if (filter?.userId) {
      query = query.eq('user_id', filter.userId);
    }
    if (filter?.orderNumber) {
      query = query.eq('order_number', filter.orderNumber);
    }
    if (filter?.status && filter.status !== 'all') {
      query = query.eq('status', filter.status);
    }

    const { data, error } = await query;

    if (!error && Array.isArray(data) && data.length > 0) {
      return data as Review[];
    }
  } catch (err) {
    // Supabase table might not exist yet, fallback to local file
  }

  // Fallback to local reviews.json
  const localList = readLocalReviews();
  let filtered = [...localList];

  if (filter?.productId) {
    const slug = filter.productSlug;
    filtered = filtered.filter(r => r.product_id === filter.productId || (slug && r.product_slug === slug));
  } else if (filter?.productSlug) {
    const slug = filter.productSlug;
    filtered = filtered.filter(r => r.product_slug === slug || r.product_name.toLowerCase().includes(slug.replace(/-/g, ' ')));
  }

  if (filter?.userId) {
    filtered = filtered.filter(r => r.user_id === filter.userId);
  }

  if (filter?.orderNumber) {
    filtered = filtered.filter(r => r.order_number === filter.orderNumber);
  }

  if (filter?.status && filter.status !== 'all') {
    filtered = filtered.filter(r => r.status === filter.status);
  }

  // Sort descending by created_at
  filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  return filtered;
}

export async function createReview(reviewData: Partial<Review>): Promise<Review> {
  const newReview: Review = {
    id: `rev-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    product_id: reviewData.product_id || null,
    product_name: reviewData.product_name || 'Product',
    product_image: reviewData.product_image || '/dash_camera.png',
    product_slug: reviewData.product_slug || null,
    order_id: reviewData.order_id || null,
    order_number: reviewData.order_number || null,
    user_id: reviewData.user_id || null,
    user_name: reviewData.user_name || 'Anonymous Customer',
    user_email: reviewData.user_email || null,
    user_phone: reviewData.user_phone || null,
    user_avatar: reviewData.user_avatar || null,
    rating: Math.min(5, Math.max(1, Math.round(Number(reviewData.rating) || 5))),
    title: reviewData.title || '',
    comment: reviewData.comment || '',
    media: Array.isArray(reviewData.media) ? reviewData.media : [],
    verified_purchase: reviewData.verified_purchase !== false,
    status: reviewData.status || 'approved',
    helpful_count: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  // Try writing to Supabase
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.from('reviews').insert([newReview]).select().single();
    if (!error && data) {
      // Also update local cache
      const local = readLocalReviews();
      local.unshift(data as Review);
      writeLocalReviews(local);
      return data as Review;
    }
  } catch (err) {
    console.warn('Supabase review insert failed, saving to local json:', err);
  }

  // Save to local json
  const local = readLocalReviews();
  local.unshift(newReview);
  writeLocalReviews(local);
  return newReview;
}

export async function setReviewStatus(reviewId: string, status: 'approved' | 'pending' | 'rejected' | 'hidden'): Promise<boolean> {
  try {
    const supabase = await createClient();
    await supabase.from('reviews').update({ status, updated_at: new Date().toISOString() }).eq('id', reviewId);
  } catch {}

  const local = readLocalReviews();
  const idx = local.findIndex(r => r.id === reviewId);
  if (idx !== -1) {
    local[idx].status = status;
    local[idx].updated_at = new Date().toISOString();
    writeLocalReviews(local);
    return true;
  }
  return false;
}

export async function removeReview(reviewId: string): Promise<boolean> {
  try {
    const supabase = await createClient();
    await supabase.from('reviews').delete().eq('id', reviewId);
  } catch {}

  const local = readLocalReviews();
  const filtered = local.filter(r => r.id !== reviewId);
  writeLocalReviews(filtered);
  return true;
}

export async function upvoteReviewHelpful(reviewId: string): Promise<number> {
  let newCount = 1;
  const local = readLocalReviews();
  const idx = local.findIndex(r => r.id === reviewId);
  if (idx !== -1) {
    local[idx].helpful_count = (local[idx].helpful_count || 0) + 1;
    newCount = local[idx].helpful_count;
    writeLocalReviews(local);
  }

  try {
    const supabase = await createClient();
    await supabase.from('reviews').update({ helpful_count: newCount }).eq('id', reviewId);
  } catch {}

  return newCount;
}

export function computeReviewStats(reviews: Review[]) {
  const total = reviews.length;
  if (total === 0) {
    return {
      average: 0,
      total: 0,
      distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
      mediaCount: 0,
    };
  }

  const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  let sum = 0;
  let mediaCount = 0;

  for (const r of reviews) {
    const star = Math.min(5, Math.max(1, Math.round(r.rating))) as 1 | 2 | 3 | 4 | 5;
    distribution[star] = (distribution[star] || 0) + 1;
    sum += r.rating;
    if (r.media && r.media.length > 0) {
      mediaCount += r.media.length;
    }
  }

  const average = Number((sum / total).toFixed(1));

  return {
    average,
    total,
    distribution,
    mediaCount,
  };
}
