import { NextResponse } from 'next/server';
import { createAdminClient } from '@/utils/supabase/admin';
import { createClient } from '@/utils/supabase/server';

const SAMPLE_COUPONS = [
  {
    id: 'c1-sample-everyjust',
    code: 'EVERYJUST',
    description: 'Official Welcome Discount - Flat ₹50 off on all orders',
    discount_type: 'fixed',
    discount_value: 50,
    min_order_amount: 0,
    max_discount_amount: null,
    is_active: true,
    usage_limit: null,
    usage_count: 12,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'c2-sample-save50',
    code: 'SAVE50',
    description: 'Save Flat ₹50 on any purchase above ₹199',
    discount_type: 'fixed',
    discount_value: 50,
    min_order_amount: 199,
    max_discount_amount: null,
    is_active: true,
    usage_limit: 1000,
    usage_count: 38,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'c3-sample-welcome20',
    code: 'WELCOME20',
    description: 'Get 20% off up to ₹200 on orders above ₹499',
    discount_type: 'percentage',
    discount_value: 20,
    min_order_amount: 499,
    max_discount_amount: 200,
    is_active: true,
    usage_limit: 500,
    usage_count: 19,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'c4-sample-flat100',
    code: 'FLAT100',
    description: 'Flat ₹100 discount on cart value above ₹899',
    discount_type: 'fixed',
    discount_value: 100,
    min_order_amount: 899,
    max_discount_amount: null,
    is_active: true,
    usage_limit: null,
    usage_count: 7,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

export async function GET() {
  try {
    const adminClient = createAdminClient();
    const userClient = await createClient();
    const supabase = adminClient || userClient;

    const { data: coupons, error } = await supabase
      .from('coupons')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      // Table may not be created yet in Supabase SQL editor
      return NextResponse.json({ success: true, coupons: SAMPLE_COUPONS, isLive: false, error: error.message });
    }

    return NextResponse.json({ success: true, coupons: coupons || [], isLive: true });
  } catch (err: any) {
    return NextResponse.json({ success: true, coupons: SAMPLE_COUPONS, isLive: false, error: err.message });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      code,
      description,
      discount_type,
      discount_value,
      min_order_amount,
      max_discount_amount,
      is_active,
      usage_limit,
      start_date,
      end_date
    } = body;

    if (!code || !code.trim()) {
      return NextResponse.json({ success: false, error: 'Coupon code is required' }, { status: 400 });
    }

    if (!discount_type || !['percentage', 'fixed'].includes(discount_type)) {
      return NextResponse.json({ success: false, error: 'Discount type must be percentage or fixed' }, { status: 400 });
    }

    if (discount_value === undefined || discount_value === null || Number(discount_value) <= 0) {
      return NextResponse.json({ success: false, error: 'Discount value must be greater than 0' }, { status: 400 });
    }

    const cleanCode = code.trim().toUpperCase();

    const adminClient = createAdminClient();
    const userClient = await createClient();
    const supabase = adminClient || userClient;

    const couponPayload = {
      code: cleanCode,
      description: description ? description.trim() : null,
      discount_type,
      discount_value: Number(discount_value),
      min_order_amount: Number(min_order_amount) || 0.00,
      max_discount_amount: discount_type === 'percentage' && max_discount_amount ? Number(max_discount_amount) : null,
      is_active: is_active !== false,
      usage_limit: usage_limit ? Number(usage_limit) : null,
      start_date: start_date || null,
      end_date: end_date || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('coupons')
      .insert(couponPayload)
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json({ success: false, error: `Coupon code '${cleanCode}' already exists.` }, { status: 409 });
      }
      if (error.message?.includes('coupons') || error.code === '42P01') {
        return NextResponse.json({ 
          success: false, 
          error: "Table 'coupons' not found in Supabase. Please run the SQL schema in your Supabase SQL Editor." 
        }, { status: 500 });
      }
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, coupon: data }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
