import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const orderNumber = searchParams.get('orderNumber');
    const email = searchParams.get('email');

    if (!orderNumber && !email) {
      return NextResponse.json(
        { success: false, error: 'Please provide either an order number or email address' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    let query = supabase
      .from('orders')
      .select('*, order_items(*)');

    if (orderNumber) {
      query = query.eq('order_number', orderNumber.trim());
    } else if (email) {
      query = query.ilike('customer_email', email.trim()).order('created_at', { ascending: false });
    }

    const { data: orders, error } = await query;

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, orders: orders || [] });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
