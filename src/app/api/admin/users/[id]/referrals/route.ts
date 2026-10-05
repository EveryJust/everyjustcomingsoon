import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/utils/supabase/admin';
import { createClient } from '@/utils/supabase/server';
import { generateReferralCode } from '@/utils/referralStorage';
import fs from 'fs';
import path from 'path';

const REFERRALS_FILE_PATH = path.join(process.cwd(), 'src', 'data', 'referrals.json');

function getLocalReferrals(): any[] {
  try {
    if (fs.existsSync(REFERRALS_FILE_PATH)) {
      return JSON.parse(fs.readFileSync(REFERRALS_FILE_PATH, 'utf-8'));
    }
  } catch {
    // Ignore
  }
  return [];
}

function saveLocalReferrals(data: any[]) {
  try {
    fs.writeFileSync(REFERRALS_FILE_PATH, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed saving local referrals:', err);
  }
}

// POST /api/admin/users/[id]/referrals - Assign referrals or credit rewards
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: userId } = await params;
    const body = await req.json();
    const { action } = body;

    const adminClient = createAdminClient();
    const userClient = await createClient();
    const supabase = adminClient || userClient;

    // Get user's referral code
    let userCode = body.userCode;
    if (!userCode) {
      if (adminClient?.auth?.admin) {
        try {
          const { data } = await adminClient.auth.admin.getUserById(userId);
          userCode = data?.user?.user_metadata?.referral_code;
        } catch {
          // Continue
        }
      }
      if (!userCode) userCode = generateReferralCode(userId);
    }

    const now = new Date();

    if (action === 'assign_referral') {
      // Admin manually assigns a new referred friend to this user
      const {
        referred_name,
        referred_email,
        status = 'completed',
        reward_amount = 50,
        order_number,
        order_amount,
        note,
      } = body;

      const isCompleted = status === 'completed';
      const isReturnPeriod = status === 'return_period';

      const newRef: any = {
        id: `ref-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`,
        referrer_id: userId,
        referrer_code: userCode.toUpperCase(),
        referred_user_id: null,
        referred_user_name: referred_name || 'Admin Assigned Friend',
        referred_user_email: referred_email || null,
        status,
        order_number: order_number || (isCompleted ? `ORD-ADMIN-${Date.now().toString().slice(-6)}` : null),
        order_amount: order_amount ? Number(order_amount) : (isCompleted ? 150.0 : null),
        reward_amount: Number(reward_amount) || 50.0,
        min_order_amount: 100.0,
        delivered_at: isCompleted || isReturnPeriod ? now.toISOString() : null,
        return_period_ends_at: isCompleted
          ? now.toISOString()
          : isReturnPeriod
          ? new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString()
          : null,
        paid_out: isCompleted,
        expires_at: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        completed_at: isCompleted ? now.toISOString() : null,
        created_at: now.toISOString(),
        updated_at: now.toISOString(),
        admin_note: note || 'Manually assigned by administrator',
      };

      // 1. Save to Supabase referrals table
      try {
        await supabase.from('referrals').insert({
          referrer_id: userId.startsWith('referrer-') || userId.startsWith('guest-') ? null : userId,
          referrer_code: newRef.referrer_code,
          referred_user_name: newRef.referred_user_name,
          referred_user_email: newRef.referred_user_email,
          status: newRef.status,
          order_number: newRef.order_number,
          order_amount: newRef.order_amount,
          reward_amount: newRef.reward_amount,
          min_order_amount: newRef.min_order_amount,
          delivered_at: newRef.delivered_at,
          return_period_ends_at: newRef.return_period_ends_at,
          paid_out: newRef.paid_out,
          expires_at: newRef.expires_at,
          completed_at: newRef.completed_at,
          created_at: newRef.created_at,
          updated_at: newRef.updated_at,
        });
      } catch (dbErr) {
        console.warn('Notice: Supabase insert fallback to local JSON:', dbErr);
      }

      // 2. Save to local referrals.json
      const local = getLocalReferrals();
      local.unshift(newRef);
      saveLocalReferrals(local);

      return NextResponse.json({
        success: true,
        message: 'Referral successfully assigned to user',
        referral: newRef,
      });
    }

    if (action === 'credit_reward') {
      // Admin grants an instant referral reward / bonus to user
      const { amount = 50, note = 'Administrator Reward Credit' } = body;

      const creditRef: any = {
        id: `ref-credit-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`,
        referrer_id: userId,
        referrer_code: userCode.toUpperCase(),
        referred_user_name: 'Bonus Reward Credit',
        referred_user_email: null,
        status: 'completed',
        reward_amount: Number(amount) || 50.0,
        min_order_amount: 0.0,
        paid_out: true,
        completed_at: now.toISOString(),
        expires_at: new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000).toISOString(),
        created_at: now.toISOString(),
        updated_at: now.toISOString(),
        admin_note: note,
      };

      try {
        await supabase.from('referrals').insert({
          referrer_id: userId.startsWith('referrer-') || userId.startsWith('guest-') ? null : userId,
          referrer_code: creditRef.referrer_code,
          referred_user_name: creditRef.referred_user_name,
          status: 'completed',
          reward_amount: creditRef.reward_amount,
          min_order_amount: 0.0,
          paid_out: true,
          completed_at: creditRef.completed_at,
          expires_at: creditRef.expires_at,
          created_at: creditRef.created_at,
          updated_at: creditRef.updated_at,
        });
      } catch {
        // Continue
      }

      const local = getLocalReferrals();
      local.unshift(creditRef);
      saveLocalReferrals(local);

      return NextResponse.json({
        success: true,
        message: `₹${amount} referral reward credited successfully`,
        referral: creditRef,
      });
    }

    if (action === 'set_referrer') {
      // Set or update who referred this user
      const { referrer_code, referrer_name } = body;
      if (!referrer_code) {
        return NextResponse.json({ success: false, error: 'Referrer code is required' }, { status: 400 });
      }

      const cleanCode = referrer_code.trim().toUpperCase();

      const newParentRef: any = {
        id: `ref-parent-${Date.now()}`,
        referrer_code: cleanCode,
        referred_user_id: userId,
        referred_user_name: referrer_name || 'Assigned Referrer',
        status: 'pending',
        reward_amount: 50.0,
        min_order_amount: 100.0,
        expires_at: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        created_at: now.toISOString(),
        updated_at: now.toISOString(),
      };

      try {
        await supabase.from('referrals').insert({
          referrer_code: cleanCode,
          referred_user_id: userId,
          status: 'pending',
          reward_amount: 50.0,
          min_order_amount: 100.0,
          expires_at: newParentRef.expires_at,
          created_at: newParentRef.created_at,
          updated_at: newParentRef.updated_at,
        });
      } catch {
        // Continue
      }

      const local = getLocalReferrals();
      local.push(newParentRef);
      saveLocalReferrals(local);

      return NextResponse.json({
        success: true,
        message: `Referrer code ${cleanCode} assigned to this user`,
      });
    }

    return NextResponse.json({ success: false, error: 'Unknown action' }, { status: 400 });
  } catch (err: any) {
    console.error('Error assigning referral:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// PATCH /api/admin/users/[id]/referrals - Approve, change status, or edit reward amount
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const body = await req.json();
    const { referral_id, action, status, reward_amount } = body;

    if (!referral_id) {
      return NextResponse.json({ success: false, error: 'referral_id is required' }, { status: 400 });
    }

    const adminClient = createAdminClient();
    const userClient = await createClient();
    const supabase = adminClient || userClient;

    const now = new Date();
    const local = getLocalReferrals();
    const itemIdx = local.findIndex((r: any) => r.id === referral_id);

    let updatedPayload: any = { updated_at: now.toISOString() };

    if (action === 'approve') {
      // 1-Click Approval: Mark as completed, bypass return window, payout ₹50
      updatedPayload = {
        status: 'completed',
        paid_out: true,
        completed_at: now.toISOString(),
        delivered_at: now.toISOString(),
        return_period_ends_at: now.toISOString(),
        updated_at: now.toISOString(),
      };
      if (reward_amount) {
        updatedPayload.reward_amount = Number(reward_amount);
      }
    } else if (action === 'update_status') {
      updatedPayload.status = status;
      if (status === 'completed') {
        updatedPayload.paid_out = true;
        updatedPayload.completed_at = now.toISOString();
      } else if (status === 'return_period') {
        updatedPayload.delivered_at = now.toISOString();
        updatedPayload.return_period_ends_at = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString();
        updatedPayload.paid_out = false;
      } else if (status === 'pending' || status === 'order_placed') {
        updatedPayload.paid_out = false;
        updatedPayload.completed_at = null;
      }
    } else if (action === 'update_amount') {
      updatedPayload.reward_amount = Number(reward_amount);
    }

    // 1. Update in Supabase
    try {
      await supabase.from('referrals').update(updatedPayload).eq('id', referral_id);
    } catch (e) {
      console.warn('Notice: Supabase update error:', e);
    }

    // 2. Update in local storage
    if (itemIdx !== -1) {
      local[itemIdx] = { ...local[itemIdx], ...updatedPayload };
      saveLocalReferrals(local);
    }

    return NextResponse.json({
      success: true,
      message: 'Referral updated successfully',
      updated: updatedPayload,
    });
  } catch (err: any) {
    console.error('Error updating referral:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// DELETE /api/admin/users/[id]/referrals - Delete referral
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { searchParams } = new URL(req.url);
    const referralId = searchParams.get('referral_id');

    if (!referralId) {
      return NextResponse.json({ success: false, error: 'referral_id is required' }, { status: 400 });
    }

    const adminClient = createAdminClient();
    const userClient = await createClient();
    const supabase = adminClient || userClient;

    try {
      await supabase.from('referrals').delete().eq('id', referralId);
    } catch {
      // Continue
    }

    const local = getLocalReferrals();
    const filtered = local.filter((r: any) => r.id !== referralId);
    saveLocalReferrals(filtered);

    return NextResponse.json({
      success: true,
      message: 'Referral removed successfully',
    });
  } catch (err: any) {
    console.error('Error deleting referral:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
