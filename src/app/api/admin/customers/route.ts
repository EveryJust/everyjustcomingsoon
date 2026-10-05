import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { fetchReviewsFromDb } from '@/utils/reviewsStorage';

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();

    // 1. Fetch profiles
    const { data: profiles, error: profileErr } = await supabase
      .from('profiles')
      .select('*');

    // 2. Fetch all orders with items
    const { data: orders, error: ordersErr } = await supabase
      .from('orders')
      .select('*, order_items(*)')
      .order('created_at', { ascending: false });

    // 3. Fetch all reviews
    const reviews = await fetchReviewsFromDb({ status: 'all' });

    // Customer aggregation map keyed by email or phone or user_id
    const customerMap: Record<string, {
      id: string;
      user_id?: string;
      name: string;
      email: string;
      phone: string;
      avatar?: string | null;
      role: string;
      joined_at: string;
      orders: any[];
      addresses: any[];
      reviews: any[];
      total_spent: number;
    }> = {};

    // Helper key generator
    const getCustomerKey = (email?: string | null, phone?: string | null, id?: string | null) => {
      if (email && email.trim()) return email.toLowerCase().trim();
      if (phone && phone.trim()) return phone.replace(/\s+/g, '');
      if (id) return id;
      return 'guest';
    };

    // Populate registered profiles
    (profiles || []).forEach((p: any) => {
      const key = getCustomerKey(p.email, p.phone_number, p.id);
      customerMap[key] = {
        id: p.id,
        user_id: p.id,
        name: p.full_name || 'Customer',
        email: p.email || '',
        phone: p.phone_number || '',
        avatar: p.avatar_url || null,
        role: p.role || 'customer',
        joined_at: p.created_at || new Date().toISOString(),
        orders: [],
        addresses: [],
        reviews: [],
        total_spent: 0,
      };
    });

    // Merge orders data
    (orders || []).forEach((order: any) => {
      const key = getCustomerKey(order.customer_email, order.customer_phone, order.customer_id);

      if (!customerMap[key]) {
        customerMap[key] = {
          id: order.customer_id || `guest-${order.id}`,
          user_id: order.customer_id || undefined,
          name: order.customer_name || 'Shopper',
          email: order.customer_email || '',
          phone: order.customer_phone || '',
          avatar: null,
          role: 'customer',
          joined_at: order.created_at,
          orders: [],
          addresses: [],
          reviews: [],
          total_spent: 0,
        };
      }

      const c = customerMap[key];
      if (!c.name || c.name === 'Customer') c.name = order.customer_name;
      if (!c.email && order.customer_email) c.email = order.customer_email;
      if (!c.phone && order.customer_phone) c.phone = order.customer_phone;

      c.orders.push(order);
      if (order.status !== 'cancelled' && order.payment_status === 'paid') {
        c.total_spent += Number(order.total_amount) || 0;
      }

      // Collect addresses from orders
      if (order.shipping_address && typeof order.shipping_address === 'object') {
        const addr = order.shipping_address;
        const exists = c.addresses.some(
          (a) =>
            a.street === addr.street &&
            a.pincode === addr.pincode &&
            a.fullName === addr.fullName
        );
        if (!exists && (addr.street || addr.city)) {
          c.addresses.push(addr);
        }
      }
    });

    // Merge reviews
    reviews.forEach((rev) => {
      const key = getCustomerKey(rev.user_email, rev.user_phone, rev.user_id);
      if (customerMap[key]) {
        customerMap[key].reviews.push(rev);
      }
    });

    const customers = Object.values(customerMap).sort(
      (a, b) => new Date(b.joined_at).getTime() - new Date(a.joined_at).getTime()
    );

    return NextResponse.json({
      success: true,
      customers,
      totalCount: customers.length,
    });
  } catch (error: any) {
    console.error('Error fetching admin customers:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to load customers' },
      { status: 500 }
    );
  }
}
