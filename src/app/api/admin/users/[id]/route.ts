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

// GET /api/admin/users/[id] - Fetch entire user details
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const adminClient = createAdminClient();
    const userClient = await createClient();
    const supabase = adminClient || userClient;

    // 1. Fetch user from Auth Admin or fallback
    let authUser: any = null;
    if (adminClient?.auth?.admin) {
      try {
        const { data, error } = await adminClient.auth.admin.getUserById(id);
        if (!error && data?.user) {
          authUser = data.user;
        }
      } catch (authErr) {
        console.warn('Notice: auth.admin.getUserById failed:', authErr);
      }
    }

    // 2. Fetch from profiles table if exists
    let profileData: any = null;
    try {
      const { data } = await supabase.from('profiles').select('*').eq('id', id).maybeSingle();
      if (data) profileData = data;
    } catch {
      // Continue
    }

    const meta = authUser?.user_metadata || {};
    const email = authUser?.email || profileData?.email || '';
    const phone = authUser?.phone || meta.phone || profileData?.phone_number || '';
    const name = meta.full_name || meta.name || profileData?.full_name || (email ? email.split('@')[0] : 'User');
    const role = meta.role || profileData?.role || (email.includes('admin') ? 'admin' : 'customer');
    const status = meta.status || (authUser?.banned_until ? 'banned' : 'active');
    const referralCode = meta.referral_code || profileData?.referral_code || generateReferralCode(id);

    // 3. Fetch Orders for this user (by customer_id, or email/phone)
    let orders: any[] = [];
    try {
      const orConditions: string[] = [`customer_id.eq.${id}`];
      if (email) orConditions.push(`customer_email.ilike.${email}`);
      if (phone && phone.length >= 10) orConditions.push(`customer_phone.ilike.%${phone.slice(-10)}%`);

      const { data: oData } = await supabase
        .from('orders')
        .select('*, order_items(*)')
        .or(orConditions.join(','))
        .order('created_at', { ascending: false });

      if (oData) orders = oData;
    } catch (orderErr) {
      console.warn('Notice: Error fetching orders for user:', orderErr);
    }

    // 4. Fetch Addresses from metadata + orders
    let addresses: any[] = Array.isArray(meta.addresses) ? [...meta.addresses] : [];
    orders.forEach((o) => {
      const sa = o.shipping_address;
      if (sa && (sa.street || sa.city || sa.pincode)) {
        const exists = addresses.some(
          (a) => a.street?.toLowerCase() === sa.street?.toLowerCase() && a.pincode === sa.pincode
        );
        if (!exists) {
          addresses.push({
            id: `order-addr-${o.id}`,
            fullName: sa.fullName || o.customer_name || name,
            phone: sa.phone || o.customer_phone || phone,
            street: sa.street,
            city: sa.city,
            state: sa.state || 'Kerala',
            pincode: sa.pincode,
            addressType: sa.addressType || 'Home',
            isDefault: addresses.length === 0,
            fromOrder: o.order_number,
          });
        }
      }
    });

    // 5. Fetch Referrals Made by User
    let referralsMade: any[] = [];
    try {
      const { data: rData } = await supabase
        .from('referrals')
        .select('*')
        .or(`referrer_id.eq.${id},referrer_code.ilike.${referralCode}`)
        .order('created_at', { ascending: false });

      if (rData && rData.length > 0) {
        referralsMade = rData;
      } else {
        const local = getLocalReferrals();
        referralsMade = local.filter(
          (r: any) =>
            r.referrer_id === id ||
            (r.referrer_code && r.referrer_code.toUpperCase() === referralCode.toUpperCase())
        );
      }
    } catch {
      const local = getLocalReferrals();
      referralsMade = local.filter(
        (r: any) =>
          r.referrer_id === id ||
          (r.referrer_code && r.referrer_code.toUpperCase() === referralCode.toUpperCase())
      );
    }

    // 6. Fetch Who Referred this User (if any)
    let referredBy: any = null;
    try {
      const { data: refByData } = await supabase
        .from('referrals')
        .select('*')
        .or(`referred_user_id.eq.${id}${email ? `,referred_user_email.ilike.${email}` : ''}`)
        .maybeSingle();

      if (refByData) {
        referredBy = refByData;
      } else {
        const local = getLocalReferrals();
        referredBy =
          local.find(
            (r: any) =>
              r.referred_user_id === id ||
              (email && r.referred_user_email?.toLowerCase() === email.toLowerCase())
          ) || null;
      }
    } catch {
      // Continue
    }

    // 7. Calculate aggregate financial and referral metrics
    const totalSpent = orders
      .filter((o) => o.status !== 'cancelled' && o.payment_status === 'paid')
      .reduce((acc, o) => acc + (Number(o.total_amount) || 0), 0);

    const completedReferrals = referralsMade.filter(
      (r) => r.status === 'completed' || r.paid_out
    );
    const pendingReferrals = referralsMade.filter(
      (r) =>
        r.status === 'pending' ||
        r.status === 'order_placed' ||
        r.status === 'return_period'
    );

    const totalReferralsEarned = completedReferrals.reduce(
      (acc, r) => acc + (Number(r.reward_amount) || 50),
      0
    );
    const pendingReferralsEarned = pendingReferrals.reduce(
      (acc, r) => acc + (Number(r.reward_amount) || 50),
      0
    );

    return NextResponse.json({
      success: true,
      user: {
        id,
        user_id: authUser?.id || id,
        email,
        phone,
        name,
        avatar: meta.avatar_url || null,
        role,
        status,
        referral_code: referralCode,
        is_registered: !!authUser,
        email_confirmed: !!authUser?.email_confirmed_at,
        created_at: authUser?.created_at || profileData?.created_at || orders[0]?.created_at || new Date().toISOString(),
        last_sign_in_at: authUser?.last_sign_in_at,
        addresses,
        orders,
        referralsMade,
        referredBy,
        stats: {
          totalOrders: orders.length,
          totalSpent,
          totalReferrals: referralsMade.length,
          completedReferrals: completedReferrals.length,
          pendingReferrals: pendingReferrals.length,
          totalReferralsEarned,
          pendingReferralsEarned,
        },
      },
    });
  } catch (err: any) {
    console.error('Error fetching user details:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to fetch user details' },
      { status: 500 }
    );
  }
}

// PATCH /api/admin/users/[id] - Manipulate any user property
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const adminClient = createAdminClient();
    const userClient = await createClient();
    const supabase = adminClient || userClient;

    const body = await req.json();
    const {
      name,
      email,
      phone,
      role,
      status,
      password,
      referral_code,
      addresses,
    } = body;

    // 1. Update in Supabase Auth via Admin Client
    if (adminClient?.auth?.admin) {
      try {
        const updatePayload: any = {
          user_metadata: {},
        };

        if (email) updatePayload.email = email.trim().toLowerCase();
        if (password) updatePayload.password = password;
        if (phone !== undefined) updatePayload.phone = phone;

        // Metadata fields
        if (name) updatePayload.user_metadata.full_name = name;
        if (role) updatePayload.user_metadata.role = role;
        if (status) updatePayload.user_metadata.status = status;
        if (referral_code) {
          updatePayload.user_metadata.referral_code = referral_code.trim().toUpperCase();
        }
        if (addresses !== undefined) {
          updatePayload.user_metadata.addresses = addresses;
        }

        // Status handling (ban / unban)
        if (status === 'banned') {
          updatePayload.ban_duration = '876600h'; // 100 years
        } else if (status === 'active') {
          updatePayload.ban_duration = 'none';
        }

        const { error: authUpdateError } = await adminClient.auth.admin.updateUserById(
          id,
          updatePayload
        );

        if (authUpdateError) {
          console.warn('Auth admin update notice:', authUpdateError.message);
        }
      } catch (authErr) {
        console.warn('Error in auth admin update:', authErr);
      }
    }

    // 2. Update in public.profiles table if exists
    try {
      const profileUpdates: any = { updated_at: new Date().toISOString() };
      if (name) profileUpdates.full_name = name;
      if (email) profileUpdates.email = email.trim().toLowerCase();
      if (phone !== undefined) profileUpdates.phone_number = phone;
      if (role) profileUpdates.role = role;
      if (referral_code) profileUpdates.referral_code = referral_code.trim().toUpperCase();

      await supabase.from('profiles').update(profileUpdates).eq('id', id);
    } catch {
      // Continue
    }

    // 3. If customer name or email changed, update associated orders
    if (name || email || phone) {
      try {
        const orderUpdates: any = {};
        if (name) orderUpdates.customer_name = name;
        if (email) orderUpdates.customer_email = email.trim().toLowerCase();
        if (phone) orderUpdates.customer_phone = phone;

        await supabase.from('orders').update(orderUpdates).eq('customer_id', id);
      } catch {
        // Continue
      }
    }

    return NextResponse.json({
      success: true,
      message: 'User updated successfully',
    });
  } catch (err: any) {
    console.error('Error updating user:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to update user' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/users/[id] - Delete or ban user
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const adminClient = createAdminClient();

    if (adminClient?.auth?.admin) {
      const { error } = await adminClient.auth.admin.deleteUser(id);
      if (error) {
        return NextResponse.json(
          { success: false, error: error.message },
          { status: 400 }
        );
      }
    }

    return NextResponse.json({
      success: true,
      message: 'User deleted successfully',
    });
  } catch (err: any) {
    console.error('Error deleting user:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to delete user' },
      { status: 500 }
    );
  }
}
