import { NextResponse } from 'next/server';
import { createAdminClient } from '@/utils/supabase/admin';
import { createClient } from '@/utils/supabase/server';

// Standard fallback coupons in case Supabase table is not yet migrated
const FALLBACK_COUPONS = [
  {
    code: 'EVERYJUST',
    description: 'Official Welcome Discount - Flat ₹50 off',
    discount_type: 'fixed',
    discount_value: 50,
    min_order_amount: 0,
    max_discount_amount: null,
    is_active: true
  },
  {
    code: 'SAVE50',
    description: 'Save Flat ₹50 on any purchase above ₹199',
    discount_type: 'fixed',
    discount_value: 50,
    min_order_amount: 199,
    max_discount_amount: null,
    is_active: true
  },
  {
    code: 'WELCOME20',
    description: 'Get 20% off up to ₹200 on orders above ₹499',
    discount_type: 'percentage',
    discount_value: 20,
    min_order_amount: 499,
    max_discount_amount: 200,
    is_active: true
  },
  {
    code: 'FLAT100',
    description: 'Flat ₹100 discount on cart value above ₹899',
    discount_type: 'fixed',
    discount_value: 100,
    min_order_amount: 899,
    max_discount_amount: null,
    is_active: true
  }
];

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { code, subtotal } = body;

    if (!code || typeof code !== 'string' || !code.trim()) {
      return NextResponse.json({ success: false, error: 'Please enter a coupon code' }, { status: 400 });
    }

    const orderSubtotal = Number(subtotal) || 0;
    const cleanCode = code.trim().toUpperCase();

    // Query Supabase for coupon
    const adminClient = createAdminClient();
    const userClient = await createClient();
    const supabase = adminClient || userClient;

    let matchedCoupon: any = null;

    try {
      const { data, error } = await supabase
        .from('coupons')
        .select('*')
        .eq('code', cleanCode)
        .maybeSingle();

      if (!error && data) {
        matchedCoupon = data;
      }
    } catch {
      // Table may not exist yet, fallback
    }

    // Check fallback if not in DB
    if (!matchedCoupon) {
      matchedCoupon = FALLBACK_COUPONS.find(c => c.code === cleanCode) || null;
    }

    if (!matchedCoupon) {
      return NextResponse.json(
        { success: false, error: `Invalid coupon code '${cleanCode}'. Try EVERYJUST or SAVE50` },
        { status: 404 }
      );
    }

    // 1. Check if active
    if (!matchedCoupon.is_active) {
      return NextResponse.json(
        { success: false, error: `Coupon '${cleanCode}' is currently deactivated or inactive.` },
        { status: 400 }
      );
    }

    // 2. Check validity dates
    const now = new Date();
    if (matchedCoupon.start_date && new Date(matchedCoupon.start_date) > now) {
      return NextResponse.json(
        { success: false, error: `Coupon '${cleanCode}' is not active yet.` },
        { status: 400 }
      );
    }

    if (matchedCoupon.end_date && new Date(matchedCoupon.end_date) < now) {
      return NextResponse.json(
        { success: false, error: `Coupon '${cleanCode}' has expired.` },
        { status: 400 }
      );
    }

    // 3. Check usage limit
    if (
      matchedCoupon.usage_limit &&
      matchedCoupon.usage_count !== undefined &&
      matchedCoupon.usage_count >= matchedCoupon.usage_limit
    ) {
      return NextResponse.json(
        { success: false, error: `Coupon '${cleanCode}' has reached its maximum usage limit.` },
        { status: 400 }
      );
    }

    // 4. Check minimum purchase order amount
    const minOrder = Number(matchedCoupon.min_order_amount) || 0;
    if (orderSubtotal < minOrder) {
      return NextResponse.json(
        { 
          success: false, 
          error: `Minimum order purchase of ₹${minOrder} required for coupon '${cleanCode}'. (Current cart: ₹${orderSubtotal})` 
        },
        { status: 400 }
      );
    }

    // 5. Calculate discount
    let calculatedDiscount = 0;
    const discountVal = Number(matchedCoupon.discount_value) || 0;

    if (matchedCoupon.discount_type === 'percentage') {
      const percentageDiscount = (orderSubtotal * discountVal) / 100;
      calculatedDiscount = Math.round(percentageDiscount);

      // Check max discount cap
      if (matchedCoupon.max_discount_amount && Number(matchedCoupon.max_discount_amount) > 0) {
        calculatedDiscount = Math.min(calculatedDiscount, Number(matchedCoupon.max_discount_amount));
      }
    } else {
      // Fixed discount
      calculatedDiscount = discountVal;
    }

    // Discount cannot exceed subtotal
    calculatedDiscount = Math.min(calculatedDiscount, orderSubtotal);

    return NextResponse.json({
      success: true,
      coupon: {
        id: matchedCoupon.id,
        code: matchedCoupon.code,
        description: matchedCoupon.description,
        discountType: matchedCoupon.discount_type,
        discountValue: discountVal,
        minOrderAmount: minOrder,
        maxDiscountAmount: matchedCoupon.max_discount_amount,
        calculatedDiscount
      }
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
