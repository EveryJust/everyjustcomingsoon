import fs from 'fs';
import path from 'path';
import { createClient } from './supabase/server';
import { createAdminClient } from './supabase/admin';

export type ReferralStatus =
  | 'pending'       // Friend registered, waiting to place qualifying order > ₹100 (within 30 days)
  | 'order_placed'  // Friend placed qualifying order > ₹100, awaiting delivery
  | 'return_period' // Order delivered, currently in 3-day return window
  | 'completed'     // Delivered AND 3-day return window ended! ₹50 credited to referrer
  | 'cancelled'     // Order cancelled or returned
  | 'expired';      // 30 days elapsed from signup without qualifying purchase

export interface Referral {
  id: string;
  referrer_id: string;
  referrer_code: string;
  referred_user_id?: string | null;
  referred_user_email?: string | null;
  referred_user_name?: string | null;
  status: ReferralStatus;
  order_id?: string | null;
  order_number?: string | null;
  order_amount?: number | null;
  reward_amount: number;       // ₹50
  min_order_amount: number;    // ₹100
  delivered_at?: string | null;
  return_period_ends_at?: string | null; // delivered_at + 3 days
  expires_at: string;          // 30 days validity from friend's signup
  completed_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface ReferralStats {
  referralCode: string;
  totalReferred: number;
  completedCount: number;      // Successfully delivered & 3-day return period ended
  pendingCount: number;        // In progress (awaiting order, delivery, or return period)
  expiredCount: number;
  totalEarned: number;         // CompletedCount * 50 (only received money)
  pendingEarned: number;       // Pending delivery or in return window * 50
  rewardPerReferral: number;   // 50
  minOrderAmount: number;      // 100
  validityDays: number;        // 30
  returnPeriodDays: number;    // 3
  referrals: Referral[];
}

const REFERRALS_FILE_PATH = path.join(process.cwd(), 'src', 'data', 'referrals.json');

function readLocalReferrals(): Referral[] {
  try {
    if (fs.existsSync(REFERRALS_FILE_PATH)) {
      const data = fs.readFileSync(REFERRALS_FILE_PATH, 'utf-8');
      return JSON.parse(data) as Referral[];
    }
  } catch (err) {
    console.error('Error reading local referrals:', err);
  }
  return [];
}

function writeLocalReferrals(referrals: Referral[]): boolean {
  try {
    const dir = path.dirname(REFERRALS_FILE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(REFERRALS_FILE_PATH, JSON.stringify(referrals, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error('Error writing local referrals:', err);
    return false;
  }
}

export function generateReferralCode(userId: string): string {
  if (!userId) return 'EVERYJUST50';
  const cleanId = userId.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
  return `EJ${cleanId.slice(0, 6)}`;
}

// Helper to look up an order status from database or fallback
async function fetchOrderStatus(orderIdOrNumber: string): Promise<{ status: string; delivered_at?: string; updated_at?: string } | null> {
  try {
    const admin = createAdminClient();
    const client = admin || (await createClient());
    
    let query = client.from('orders').select('status, updated_at, delivered_at');
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(orderIdOrNumber);
    if (isUuid) {
      query = query.eq('id', orderIdOrNumber);
    } else {
      query = query.eq('order_number', orderIdOrNumber);
    }
    const { data } = await query.maybeSingle();
    return data || null;
  } catch {
    return null;
  }
}

// Refresh and sync statuses for referrals (e.g. check 30-day signup expiry and 3-day return period expiry)
export async function syncReferralStatuses(referrals: Referral[]): Promise<{ updated: boolean; items: Referral[] }> {
  const now = new Date();
  let updatedAny = false;

  const synced = await Promise.all(
    referrals.map(async (r) => {
      let item = { ...r };

      // 1. Pending registration with no order placed -> check 30 days validity
      if (item.status === 'pending') {
        if (now > new Date(item.expires_at)) {
          item.status = 'expired';
          item.updated_at = now.toISOString();
          updatedAny = true;
        }
        return item;
      }

      // 2. Order was placed or in return window -> check order delivery & return window
      if ((item.status === 'order_placed' || item.status === 'return_period') && (item.order_id || item.order_number)) {
        const orderInfo = await fetchOrderStatus(item.order_id || item.order_number || '');
        if (orderInfo) {
          const orderStatus = orderInfo.status?.toLowerCase();

          // Check if cancelled or refunded
          if (orderStatus === 'cancelled' || orderStatus === 'refunded') {
            item.status = 'cancelled';
            item.updated_at = now.toISOString();
            updatedAny = true;
            return item;
          }

          // Check if delivered
          if (orderStatus === 'delivered') {
            const deliveredAtDate = orderInfo.delivered_at
              ? new Date(orderInfo.delivered_at)
              : orderInfo.updated_at
              ? new Date(orderInfo.updated_at)
              : (item.delivered_at ? new Date(item.delivered_at) : now);

            if (!item.delivered_at) {
              item.delivered_at = deliveredAtDate.toISOString();
              updatedAny = true;
            }

            // 3 days return period calculation
            const returnEnds = item.return_period_ends_at
              ? new Date(item.return_period_ends_at)
              : new Date(deliveredAtDate.getTime() + 3 * 24 * 60 * 60 * 1000);

            if (!item.return_period_ends_at) {
              item.return_period_ends_at = returnEnds.toISOString();
              updatedAny = true;
            }

            // Check if 3 days return window has completed!
            if (now >= returnEnds) {
              item.status = 'completed';
              item.completed_at = now.toISOString();
              item.updated_at = now.toISOString();
              updatedAny = true;
            } else {
              if (item.status !== 'return_period') {
                item.status = 'return_period';
                item.updated_at = now.toISOString();
                updatedAny = true;
              }
            }
          }
        } else if (item.status === 'return_period' && item.return_period_ends_at) {
          // If order status could not be fetched remotely, check cached return_period_ends_at
          if (now >= new Date(item.return_period_ends_at)) {
            item.status = 'completed';
            item.completed_at = now.toISOString();
            item.updated_at = now.toISOString();
            updatedAny = true;
          }
        }
      }

      return item;
    })
  );

  return { updated: updatedAny, items: synced };
}

// Get referral stats and referred users list for a user
export async function getReferralStatsForUser(
  userId: string,
  userCode?: string
): Promise<ReferralStats> {
  const code = userCode || generateReferralCode(userId);

  let referralsList: Referral[] = [];

  // Try Supabase first
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('referrals')
      .select('*')
      .or(`referrer_id.eq.${userId},referrer_code.ilike.${code}`)
      .order('created_at', { ascending: false });

    if (!error && data) {
      referralsList = data as Referral[];
    } else {
      throw new Error(error?.message || 'Supabase fallback');
    }
  } catch {
    // Fallback to local JSON storage
    const allLocal = readLocalReferrals();
    referralsList = allLocal.filter(
      (r) => r.referrer_id === userId || r.referrer_code.toUpperCase() === code.toUpperCase()
    );
  }

  // Sync statuses (checks 30 days signup validity and 3 days return period after delivery)
  const { updated, items: processedReferrals } = await syncReferralStatuses(referralsList);

  if (updated) {
    // Save to local JSON storage
    try {
      const allLocal = readLocalReferrals();
      const merged = allLocal.map((item) => {
        const found = processedReferrals.find((p) => p.id === item.id);
        return found || item;
      });
      writeLocalReferrals(merged);
    } catch (e) {
      console.warn('Notice: Failed updating local referrals json', e);
    }

    // Save updates to Supabase
    try {
      const admin = createAdminClient();
      const client = admin || (await createClient());
      for (const p of processedReferrals) {
        await client
          .from('referrals')
          .update({
            status: p.status,
            delivered_at: p.delivered_at,
            return_period_ends_at: p.return_period_ends_at,
            completed_at: p.completed_at,
            updated_at: p.updated_at,
          })
          .eq('id', p.id);
      }
    } catch {
      // Ignored
    }
  }

  const completedCount = processedReferrals.filter((r) => r.status === 'completed').length;
  const inProgressCount = processedReferrals.filter(
    (r) => r.status === 'pending' || r.status === 'order_placed' || r.status === 'return_period'
  ).length;
  const expiredCount = processedReferrals.filter((r) => r.status === 'expired' || r.status === 'cancelled').length;

  const pendingReward = processedReferrals
    .filter((r) => r.status === 'order_placed' || r.status === 'return_period')
    .length * 50;

  return {
    referralCode: code,
    totalReferred: processedReferrals.length,
    completedCount,
    pendingCount: inProgressCount,
    expiredCount,
    totalEarned: completedCount * 50, // ONLY received money after delivery + 3 days return period!
    pendingEarned: pendingReward,
    rewardPerReferral: 50,
    minOrderAmount: 100,
    validityDays: 30,
    returnPeriodDays: 3,
    referrals: processedReferrals,
  };
}

// Find referrer user by referral code
export async function findReferrerByCode(code: string): Promise<{ id: string; email?: string } | null> {
  const cleanCode = code.trim().toUpperCase();
  if (!cleanCode) return null;

  try {
    const admin = createAdminClient();
    if (admin) {
      const { data: profile } = await admin
        .from('profiles')
        .select('id, email')
        .ilike('referral_code', cleanCode)
        .maybeSingle();

      if (profile) return profile;
    }
  } catch {
    // Continue
  }

  const localReferrals = readLocalReferrals();
  const matched = localReferrals.find((r) => r.referrer_code.toUpperCase() === cleanCode);
  if (matched && matched.referrer_id) {
    return { id: matched.referrer_id };
  }

  if (cleanCode.startsWith('EJ') && cleanCode.length >= 6) {
    return { id: `referrer-${cleanCode}` };
  }

  return null;
}

// Record a new referral when a new user registers with a code
export async function recordReferralSignup({
  referralCode,
  newUserId,
  newUserEmail,
  newUserName,
}: {
  referralCode: string;
  newUserId: string;
  newUserEmail?: string | null;
  newUserName?: string | null;
}): Promise<{ success: boolean; error?: string; referral?: Referral }> {
  const cleanCode = referralCode.trim().toUpperCase();
  if (!cleanCode) {
    return { success: false, error: 'Referral code is required' };
  }

  // Check self-referral
  const ownCode = generateReferralCode(newUserId);
  if (ownCode.toUpperCase() === cleanCode) {
    return { success: false, error: 'You cannot use your own referral code' };
  }

  // Check if this new user was already referred
  const localList = readLocalReferrals();
  const alreadyReferredLocal = localList.find(
    (r) =>
      (newUserId && r.referred_user_id === newUserId) ||
      (newUserEmail && r.referred_user_email?.toLowerCase() === newUserEmail.toLowerCase())
  );

  if (alreadyReferredLocal) {
    return { success: false, error: 'User has already used a referral code' };
  }

  // Find referrer
  const referrer = await findReferrerByCode(cleanCode);
  if (!referrer) {
    return { success: false, error: 'Invalid referral code' };
  }

  if (referrer.id === newUserId) {
    return { success: false, error: 'You cannot refer yourself' };
  }

  const now = new Date();
  const expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days validity to purchase

  const newReferral: Referral = {
    id: `ref-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`,
    referrer_id: referrer.id,
    referrer_code: cleanCode,
    referred_user_id: newUserId,
    referred_user_email: newUserEmail || null,
    referred_user_name: newUserName || (newUserEmail ? newUserEmail.split('@')[0] : 'New Shopper'),
    status: 'pending',
    reward_amount: 50.0,
    min_order_amount: 100.0,
    expires_at: expiresAt.toISOString(),
    created_at: now.toISOString(),
    updated_at: now.toISOString(),
  };

  // Save to Supabase
  try {
    const supabase = await createClient();
    await supabase.from('referrals').insert({
      referrer_id: referrer.id.startsWith('referrer-') ? null : referrer.id,
      referrer_code: cleanCode,
      referred_user_id: newUserId,
      referred_user_email: newUserEmail || null,
      referred_user_name: newReferral.referred_user_name,
      status: 'pending',
      reward_amount: 50.0,
      min_order_amount: 100.0,
      expires_at: expiresAt.toISOString(),
      created_at: now.toISOString(),
      updated_at: now.toISOString(),
    });
  } catch (err) {
    console.warn('Notice: Referral database insert fallback to local json:', err);
  }

  localList.push(newReferral);
  writeLocalReferrals(localList);

  return { success: true, referral: newReferral };
}

// Triggered when an order is placed: marks status as 'order_placed'
export async function processReferralOnOrder({
  customerId,
  customerEmail,
  orderId,
  orderNumber,
  orderAmount,
}: {
  customerId?: string | null;
  customerEmail: string;
  orderId: string;
  orderNumber: string;
  orderAmount: number;
}): Promise<{ linked: boolean; referrerId?: string }> {
  // Check if purchase qualifies (must be above 100 rupees)
  if (orderAmount < 100) {
    return { linked: false };
  }

  const now = new Date();
  const cleanEmail = customerEmail.toLowerCase().trim();

  // Find active pending referral
  const allLocal = readLocalReferrals();
  const pendingIndex = allLocal.findIndex((r) => {
    if (r.status !== 'pending') return false;
    const matchUser = customerId && r.referred_user_id === customerId;
    const matchEmail = r.referred_user_email && r.referred_user_email.toLowerCase() === cleanEmail;
    if (!matchUser && !matchEmail) return false;

    // Check 30-day validity
    return new Date(r.expires_at) >= now;
  });

  if (pendingIndex === -1) {
    return { linked: false };
  }

  // Update status to 'order_placed' (awaiting delivery + 3 days return period)
  allLocal[pendingIndex].status = 'order_placed';
  allLocal[pendingIndex].order_id = orderId;
  allLocal[pendingIndex].order_number = orderNumber;
  allLocal[pendingIndex].order_amount = orderAmount;
  allLocal[pendingIndex].updated_at = now.toISOString();

  writeLocalReferrals(allLocal);

  // Sync to Supabase
  try {
    const admin = createAdminClient();
    const client = admin || (await createClient());
    const matchId = allLocal[pendingIndex].id;

    await client
      .from('referrals')
      .update({
        status: 'order_placed',
        order_id: orderId,
        order_number: orderNumber,
        order_amount: orderAmount,
        updated_at: now.toISOString(),
      })
      .or(`id.eq.${matchId},referred_user_email.ilike.${cleanEmail}`);
  } catch (err) {
    console.warn('Notice: Failed syncing order_placed referral to Supabase:', err);
  }

  return {
    linked: true,
    referrerId: allLocal[pendingIndex].referrer_id,
  };
}

// Triggered when an order is delivered or cancelled: updates referral delivery & 3-day return period
export async function updateReferralOnOrderStatusChange({
  orderId,
  orderNumber,
  newStatus,
}: {
  orderId?: string | null;
  orderNumber?: string | null;
  newStatus: string;
}): Promise<void> {
  const cleanStatus = newStatus.toLowerCase();
  const now = new Date();

  const allLocal = readLocalReferrals();
  let modified = false;

  allLocal.forEach((r) => {
    const match = (orderId && r.order_id === orderId) || (orderNumber && r.order_number === orderNumber);
    if (!match) return;

    if (cleanStatus === 'cancelled' || cleanStatus === 'refunded') {
      r.status = 'cancelled';
      r.updated_at = now.toISOString();
      modified = true;
    } else if (cleanStatus === 'delivered') {
      r.delivered_at = now.toISOString();
      // 3 days return period
      r.return_period_ends_at = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString();
      r.status = 'return_period';
      r.updated_at = now.toISOString();
      modified = true;
    }
  });

  if (modified) {
    writeLocalReferrals(allLocal);

    // Sync to Supabase
    try {
      const admin = createAdminClient();
      const client = admin || (await createClient());
      for (const r of allLocal) {
        const match = (orderId && r.order_id === orderId) || (orderNumber && r.order_number === orderNumber);
        if (match) {
          await client
            .from('referrals')
            .update({
              status: r.status,
              delivered_at: r.delivered_at,
              return_period_ends_at: r.return_period_ends_at,
              updated_at: r.updated_at,
            })
            .eq('id', r.id);
        }
      }
    } catch {
      // Ignored
    }
  }
}
