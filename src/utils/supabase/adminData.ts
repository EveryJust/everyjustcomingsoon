import { createClient } from './client';

export interface OrderItem {
  id?: string;
  order_id?: string;
  product_id?: string;
  product_name: string;
  product_image?: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

export interface Order {
  id: string;
  order_number: string;
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  subtotal: number;
  tax_amount: number;
  shipping_amount: number;
  discount_amount: number;
  total_amount: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
  payment_status: 'paid' | 'pending' | 'failed' | 'refunded';
  payment_method: 'UPI' | 'Card' | 'Net Banking' | 'Cash on Delivery';
  shipping_address?: any;
  coupon_code?: string;
  created_at: string;
  order_items?: OrderItem[];
}

export interface Coupon {
  id: string;
  code: string;
  description?: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  min_order_amount: number;
  max_discount_amount?: number | null;
  is_active: boolean;
  usage_limit?: number | null;
  usage_count: number;
  start_date?: string | null;
  end_date?: string | null;
  created_at: string;
  updated_at: string;
}

export interface Transaction {
  id: string;
  transaction_id: string;
  order_id?: string;
  type: 'income' | 'expense' | 'refund' | 'payout' | 'gateway_fee' | 'tax';
  amount: number;
  fee: number;
  net_amount: number;
  status: 'completed' | 'pending' | 'failed';
  payment_method: string;
  description: string;
  created_at: string;
}

// Fetch orders with order items directly from Supabase
export async function getAdminOrders(): Promise<{ orders: Order[]; isLive: boolean; error?: string }> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('orders')
      .select('*, order_items(*)')
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('Orders query notice:', error.message);
      return { orders: [], isLive: false, error: error.message };
    }
    return { orders: (data || []) as Order[], isLive: true };
  } catch (err: any) {
    console.error('Error fetching admin orders:', err);
    return { orders: [], isLive: false, error: err?.message };
  }
}

// Fetch single order by ID or order_number
export async function getAdminOrderById(idOrNumber: string): Promise<{ order: Order | null; error?: string }> {
  try {
    const supabase = createClient();
    
    // First try UUID lookup
    let query = supabase
      .from('orders')
      .select('*, order_items(*)');

    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idOrNumber);
    if (isUuid) {
      query = query.eq('id', idOrNumber);
    } else {
      query = query.eq('order_number', idOrNumber);
    }

    const { data, error } = await query.maybeSingle();

    if (error) {
      console.warn('Order lookup error:', error.message);
      return { order: null, error: error.message };
    }

    return { order: data as Order | null };
  } catch (err: any) {
    console.error('Error in getAdminOrderById:', err);
    return { order: null, error: err?.message };
  }
}

// Update order status
export async function updateAdminOrderStatus(id: string, status: string): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createClient();
    const { error } = await supabase
      .from('orders')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message };
  }
}

// Fetch coupons directly from Supabase
export async function getAdminCoupons(): Promise<{ coupons: Coupon[]; isLive: boolean; error?: string }> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('coupons')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('Coupons query notice:', error.message);
      return { coupons: [], isLive: false, error: error.message };
    }
    return { coupons: (data || []) as Coupon[], isLive: true };
  } catch (err: any) {
    console.error('Error fetching admin coupons:', err);
    return { coupons: [], isLive: false, error: err?.message };
  }
}

// Fetch transactions directly from Supabase
export async function getAdminTransactions(): Promise<{ transactions: Transaction[]; isLive: boolean; error?: string }> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('Transactions query notice:', error.message);
      return { transactions: [], isLive: false, error: error.message };
    }
    return { transactions: (data || []) as Transaction[], isLive: true };
  } catch (err: any) {
    console.error('Error fetching admin transactions:', err);
    return { transactions: [], isLive: false, error: err?.message };
  }
}

