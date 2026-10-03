import { NextResponse } from 'next/server';
import { createAdminClient } from '@/utils/supabase/admin';
import { createClient } from '@/utils/supabase/server';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const adminClient = createAdminClient();
    const userClient = await createClient();
    const supabase = adminClient || userClient;

    const { data: coupon, error } = await supabase
      .from('coupons')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 404 });
    }

    return NextResponse.json({ success: true, coupon });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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

    const cleanCode = code ? code.trim().toUpperCase() : undefined;

    const updatePayload: Record<string, any> = {
      updated_at: new Date().toISOString()
    };

    if (cleanCode !== undefined) updatePayload.code = cleanCode;
    if (description !== undefined) updatePayload.description = description ? description.trim() : null;
    if (discount_type !== undefined) updatePayload.discount_type = discount_type;
    if (discount_value !== undefined) updatePayload.discount_value = Number(discount_value);
    if (min_order_amount !== undefined) updatePayload.min_order_amount = Number(min_order_amount);
    if (max_discount_amount !== undefined) {
      updatePayload.max_discount_amount = discount_type === 'percentage' && max_discount_amount ? Number(max_discount_amount) : null;
    }
    if (is_active !== undefined) updatePayload.is_active = Boolean(is_active);
    if (usage_limit !== undefined) updatePayload.usage_limit = usage_limit ? Number(usage_limit) : null;
    if (start_date !== undefined) updatePayload.start_date = start_date || null;
    if (end_date !== undefined) updatePayload.end_date = end_date || null;

    const adminClient = createAdminClient();
    const userClient = await createClient();
    const supabase = adminClient || userClient;

    const { data: updatedCoupon, error } = await supabase
      .from('coupons')
      .update(updatePayload)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json({ success: false, error: `Coupon code '${cleanCode}' already exists.` }, { status: 409 });
      }
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, coupon: updatedCoupon });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { is_active } = body;

    const adminClient = createAdminClient();
    const userClient = await createClient();
    const supabase = adminClient || userClient;

    const { data: updatedCoupon, error } = await supabase
      .from('coupons')
      .update({
        is_active: Boolean(is_active),
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, coupon: updatedCoupon });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const adminClient = createAdminClient();
    const userClient = await createClient();
    const supabase = adminClient || userClient;

    const { error } = await supabase
      .from('coupons')
      .delete()
      .eq('id', id);

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Coupon deleted successfully' });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
