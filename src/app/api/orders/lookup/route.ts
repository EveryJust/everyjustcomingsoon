import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { createAdminClient } from '@/utils/supabase/admin';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const orderNumber = searchParams.get('orderNumber')?.trim();
    const email = searchParams.get('email')?.trim();
    const phone = searchParams.get('phone')?.trim();
    const userId = searchParams.get('userId')?.trim();

    if (!orderNumber && !email && !phone && !userId) {
      return NextResponse.json(
        { success: false, error: 'Please provide an order number, email address, or mobile number' },
        { status: 400 }
      );
    }

    const userClient = await createClient();
    const adminClient = createAdminClient();
    const supabase = adminClient || userClient;

    let query = supabase
      .from('orders')
      .select('*, order_items(*)')
      .order('created_at', { ascending: false });

    if (orderNumber) {
      // Direct lookup by order number (e.g. EJ-260930-1234)
      query = query.eq('order_number', orderNumber);
    } else {
      // Build conditions for email, phone, and userId
      const orConditions: string[] = [];

      if (userId) {
        orConditions.push(`customer_id.eq.${userId}`);
      }
      if (email) {
        orConditions.push(`customer_email.ilike.${email}`);
      }
      if (phone) {
        const cleanPhone = phone.replace(/\D/g, '').slice(-10);
        if (cleanPhone.length >= 10) {
          orConditions.push(`customer_phone.ilike.%${cleanPhone}%`);
        }
      }

      if (orConditions.length > 0) {
        query = query.or(orConditions.join(','));
      }
    }

    const { data: orders, error } = await query;

    if (error) {
      console.error('Error fetching orders:', error.message);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    // If userId was provided and there are unlinked orders matching email or phone, link them
    if (userId && orders && orders.length > 0) {
      const unlinkedIds = orders
        .filter((o) => !o.customer_id)
        .map((o) => o.id);

      if (unlinkedIds.length > 0) {
        await supabase
          .from('orders')
          .update({ customer_id: userId })
          .in('id', unlinkedIds);
      }
    }

    return NextResponse.json({ success: true, orders: orders || [] });
  } catch (err: any) {
    console.error('Error in order lookup route:', err);
    return NextResponse.json({ success: false, error: err?.message || 'Server error' }, { status: 500 });
  }
}
