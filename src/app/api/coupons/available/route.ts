import { NextResponse } from 'next/server';
import { createAdminClient } from '@/utils/supabase/admin';
import { createClient } from '@/utils/supabase/server';

const DEFAULT_COUPONS = [
  {
    code: 'EVERYJUST',
    description: 'Flat ₹50 off on all orders',
    discount_type: 'fixed',
    discount_value: 50,
    min_order_amount: 0
  },
  {
    code: 'SAVE50',
    description: 'Flat ₹50 off on orders above ₹199',
    discount_type: 'fixed',
    discount_value: 50,
    min_order_amount: 199
  },
  {
    code: 'WELCOME20',
    description: '20% off up to ₹200 on orders above ₹499',
    discount_type: 'percentage',
    discount_value: 20,
    min_order_amount: 499
  }
];

export async function GET() {
  try {
    const adminClient = createAdminClient();
    const userClient = await createClient();
    const supabase = adminClient || userClient;

    const { data: coupons, error } = await supabase
      .from('coupons')
      .select('code, description, discount_type, discount_value, min_order_amount, max_discount_amount')
      .eq('is_active', true)
      .order('discount_value', { ascending: false })
      .limit(6);

    if (error || !coupons || coupons.length === 0) {
      return NextResponse.json({ success: true, coupons: DEFAULT_COUPONS });
    }

    return NextResponse.json({ success: true, coupons });
  } catch {
    return NextResponse.json({ success: true, coupons: DEFAULT_COUPONS });
  }
}
