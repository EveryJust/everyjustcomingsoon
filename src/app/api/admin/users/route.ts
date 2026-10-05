import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/utils/supabase/admin';
import { createClient } from '@/utils/supabase/server';
import { generateReferralCode } from '@/utils/referralStorage';
import fs from 'fs';
import path from 'path';

const REFERRALS_FILE_PATH = path.join(process.cwd(), 'src', 'data', 'referrals.json');

function getLocalReferrals() {
  try {
    if (fs.existsSync(REFERRALS_FILE_PATH)) {
      return JSON.parse(fs.readFileSync(REFERRALS_FILE_PATH, 'utf-8'));
    }
  } catch {
    // Ignore
  }
  return [];
}

export async function GET(req: NextRequest) {
  try {
    const adminClient = createAdminClient();
    const userClient = await createClient();
    const supabase = adminClient || userClient;

    const { searchParams } = new URL(req.url);
    const search = searchParams.get('q')?.toLowerCase().trim() || '';
    const roleFilter = searchParams.get('role') || 'all';
    const statusFilter = searchParams.get('status') || 'all';

    // 1. Fetch Auth Users via service role admin if available
    let authUsers: any[] = [];
    if (adminClient?.auth?.admin) {
      try {
        const { data, error } = await adminClient.auth.admin.listUsers({
          page: 1,
          perPage: 1000,
        });
        if (!error && data?.users) {
          authUsers = data.users;
        }
      } catch (authErr) {
        console.warn('Notice: auth.admin.listUsers failed, fallback:', authErr);
      }
    }

    // 2. Fetch Profiles from public.profiles if table exists
    let profiles: any[] = [];
    try {
      const { data: pData } = await supabase.from('profiles').select('*');
      if (pData) profiles = pData;
    } catch {
      // Continue
    }

    // 3. Fetch Orders with order_items
    let orders: any[] = [];
    try {
      const { data: oData } = await supabase
        .from('orders')
        .select('*, order_items(*)')
        .order('created_at', { ascending: false });
      if (oData) orders = oData;
    } catch {
      // Continue
    }

    // 4. Fetch Referrals (Supabase + Local fallback)
    let referrals: any[] = [];
    try {
      const { data: rData } = await supabase.from('referrals').select('*');
      if (rData && rData.length > 0) {
        referrals = rData;
      } else {
        referrals = getLocalReferrals();
      }
    } catch {
      referrals = getLocalReferrals();
    }

    // 5. Aggregate Unified User Records
    // Key by auth user ID first, or lowercase email
    const usersMap: Record<string, any> = {};

    // Populate from Auth Users
    authUsers.forEach((u) => {
      const meta = u.user_metadata || {};
      const userRefCode = meta.referral_code || generateReferralCode(u.id);

      usersMap[u.id] = {
        id: u.id,
        user_id: u.id,
        email: u.email || '',
        phone: u.phone || meta.phone || '',
        name: meta.full_name || meta.name || (u.email ? u.email.split('@')[0] : 'User'),
        avatar: meta.avatar_url || null,
        role: meta.role || (u.email?.includes('admin') ? 'admin' : 'customer'),
        status: meta.status || (u.banned_until ? 'banned' : 'active'),
        referral_code: userRefCode,
        addresses: Array.isArray(meta.addresses) ? meta.addresses : [],
        orders: [],
        orders_count: 0,
        total_spent: 0,
        referrals_count: 0,
        referrals_earned: 0,
        referrals_pending: 0,
        is_registered: true,
        email_confirmed: !!u.email_confirmed_at,
        last_sign_in_at: u.last_sign_in_at,
        created_at: u.created_at,
      };
    });

    // Populate or merge with Profiles
    profiles.forEach((p) => {
      const id = p.id;
      if (usersMap[id]) {
        usersMap[id].name = p.full_name || usersMap[id].name;
        usersMap[id].phone = p.phone_number || usersMap[id].phone;
        usersMap[id].role = p.role || usersMap[id].role;
        if (p.referral_code) usersMap[id].referral_code = p.referral_code;
      } else {
        usersMap[id] = {
          id: p.id,
          user_id: p.id,
          email: p.email || '',
          phone: p.phone_number || '',
          name: p.full_name || 'User',
          avatar: p.avatar_url || null,
          role: p.role || 'customer',
          status: 'active',
          referral_code: p.referral_code || generateReferralCode(p.id),
          addresses: [],
          orders: [],
          orders_count: 0,
          total_spent: 0,
          referrals_count: 0,
          referrals_earned: 0,
          referrals_pending: 0,
          is_registered: true,
          created_at: p.created_at || new Date().toISOString(),
        };
      }
    });

    // Match Orders to Users (or create guest customer entry)
    orders.forEach((order) => {
      let matchedKey = order.customer_id;
      if (!matchedKey || !usersMap[matchedKey]) {
        // Try matching by email
        const emailKey = Object.keys(usersMap).find(
          (k) =>
            usersMap[k].email &&
            order.customer_email &&
            usersMap[k].email.toLowerCase() === order.customer_email.toLowerCase()
        );
        if (emailKey) {
          matchedKey = emailKey;
        }
      }

      if (!matchedKey || !usersMap[matchedKey]) {
        // Create guest shopper record
        const guestId = order.customer_id || `guest-${order.id}`;
        usersMap[guestId] = {
          id: guestId,
          user_id: order.customer_id || null,
          email: order.customer_email || '',
          phone: order.customer_phone || '',
          name: order.customer_name || 'Guest Shopper',
          avatar: null,
          role: 'customer',
          status: 'active',
          referral_code: `GUEST-${order.order_number || guestId.slice(0, 6)}`,
          addresses: [],
          orders: [],
          orders_count: 0,
          total_spent: 0,
          referrals_count: 0,
          referrals_earned: 0,
          referrals_pending: 0,
          is_registered: false,
          created_at: order.created_at,
        };
        matchedKey = guestId;
      }

      const userRec = usersMap[matchedKey];
      userRec.orders.push(order);
      userRec.orders_count += 1;
      if (order.status !== 'cancelled' && order.payment_status === 'paid') {
        userRec.total_spent += Number(order.total_amount) || 0;
      }

      // Add address if not present
      if (order.shipping_address && typeof order.shipping_address === 'object') {
        const sa = order.shipping_address;
        const exists = userRec.addresses.some(
          (a: any) => a.street === sa.street && a.pincode === sa.pincode
        );
        if (!exists && (sa.street || sa.city)) {
          userRec.addresses.push({
            id: `addr-${order.id}`,
            fullName: sa.fullName || order.customer_name,
            phone: sa.phone || order.customer_phone,
            street: sa.street,
            city: sa.city,
            state: sa.state || 'Kerala',
            pincode: sa.pincode,
            addressType: 'Home',
            isDefault: userRec.addresses.length === 0,
          });
        }
      }
    });

    // Calculate Referral Stats per user
    referrals.forEach((ref) => {
      // Find matching user by referrer_id or referrer_code
      const matchedUserId = Object.keys(usersMap).find(
        (k) =>
          k === ref.referrer_id ||
          (usersMap[k].referral_code &&
            ref.referrer_code &&
            usersMap[k].referral_code.toUpperCase() === ref.referrer_code.toUpperCase())
      );

      if (matchedUserId) {
        const u = usersMap[matchedUserId];
        u.referrals_count += 1;
        const reward = Number(ref.reward_amount) || 50;

        if (ref.status === 'completed' || ref.paid_out) {
          u.referrals_earned += reward;
        } else if (
          ref.status === 'pending' ||
          ref.status === 'order_placed' ||
          ref.status === 'return_period'
        ) {
          u.referrals_pending += reward;
        }
      }
    });

    let usersList = Object.values(usersMap);

    // Apply Filters
    if (roleFilter !== 'all') {
      usersList = usersList.filter((u) => u.role?.toLowerCase() === roleFilter.toLowerCase());
    }

    if (statusFilter !== 'all') {
      usersList = usersList.filter((u) => u.status?.toLowerCase() === statusFilter.toLowerCase());
    }

    if (search) {
      usersList = usersList.filter(
        (u) =>
          u.name.toLowerCase().includes(search) ||
          u.email.toLowerCase().includes(search) ||
          u.phone.includes(search) ||
          (u.referral_code && u.referral_code.toLowerCase().includes(search))
      );
    }

    // Sort by registration / creation date descending
    usersList.sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    // Aggregate summary statistics
    const totalRegistered = usersList.filter((u) => u.is_registered).length;
    const totalBuyers = usersList.filter((u) => u.orders_count > 0).length;
    const totalPlatformSpent = usersList.reduce((acc, u) => acc + (u.total_spent || 0), 0);
    const totalReferralRewardsEarned = usersList.reduce(
      (acc, u) => acc + (u.referrals_earned || 0),
      0
    );

    return NextResponse.json({
      success: true,
      users: usersList,
      stats: {
        totalUsers: usersList.length,
        totalRegistered,
        totalBuyers,
        totalPlatformSpent,
        totalReferralRewardsEarned,
      },
    });
  } catch (err: any) {
    console.error('Error fetching admin users:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to fetch users' },
      { status: 500 }
    );
  }
}

// Create new user directly by Admin
export async function POST(req: NextRequest) {
  try {
    const adminClient = createAdminClient();
    if (!adminClient?.auth?.admin) {
      return NextResponse.json(
        { success: false, error: 'Admin service role is not configured' },
        { status: 500 }
      );
    }

    const body = await req.json();
    const { email, password, name, phone, role, status, customReferralCode } = body;

    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email is required' },
        { status: 400 }
      );
    }

    const referralCode =
      (customReferralCode && customReferralCode.trim().toUpperCase()) ||
      `EJ${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    const { data: newUser, error: createError } = await adminClient.auth.admin.createUser({
      email: email.trim().toLowerCase(),
      password: password || 'Welcome@1234',
      email_confirm: true,
      user_metadata: {
        full_name: name || email.split('@')[0],
        phone: phone || '',
        role: role || 'customer',
        status: status || 'active',
        referral_code: referralCode,
        addresses: [],
      },
    });

    if (createError) {
      return NextResponse.json(
        { success: false, error: createError.message },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      user: newUser.user,
      message: 'User created successfully',
    });
  } catch (err: any) {
    console.error('Error creating user:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to create user' },
      { status: 500 }
    );
  }
}
