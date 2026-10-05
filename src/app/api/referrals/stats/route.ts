import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { getReferralStatsForUser, generateReferralCode } from '@/utils/referralStorage';

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authErr } = await supabase.auth.getUser();

    // Query param override for userId if testing
    const searchParams = req.nextUrl.searchParams;
    const queryUserId = searchParams.get('userId');

    const effectiveUserId = user?.id || queryUserId;

    if (!effectiveUserId) {
      return NextResponse.json(
        { success: false, error: 'Authentication required to view referral details' },
        { status: 401 }
      );
    }

    const referralCode = generateReferralCode(effectiveUserId);
    const stats = await getReferralStatsForUser(effectiveUserId, referralCode);

    return NextResponse.json({
      success: true,
      stats,
    });
  } catch (err: any) {
    console.error('Error fetching referral stats:', err);
    return NextResponse.json(
      { success: false, error: err?.message || 'Failed to fetch referral stats' },
      { status: 500 }
    );
  }
}
