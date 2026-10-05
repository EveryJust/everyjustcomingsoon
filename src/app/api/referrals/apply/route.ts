import { NextRequest, NextResponse } from 'next/server';
import { recordReferralSignup } from '@/utils/referralStorage';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { referralCode, newUserId, newUserEmail, newUserName } = body;

    if (!referralCode || !newUserId) {
      return NextResponse.json(
        { success: false, error: 'referralCode and newUserId are required' },
        { status: 400 }
      );
    }

    const result = await recordReferralSignup({
      referralCode: String(referralCode).trim(),
      newUserId: String(newUserId),
      newUserEmail: newUserEmail ? String(newUserEmail).trim() : null,
      newUserName: newUserName ? String(newUserName).trim() : null,
    });

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      referral: result.referral,
      message: 'Referral code successfully linked! When you place your first order above ₹100, your referral bonus will be credited.',
    });
  } catch (err: any) {
    console.error('Error applying referral code:', err);
    return NextResponse.json(
      { success: false, error: err?.message || 'Failed to apply referral code' },
      { status: 500 }
    );
  }
}
