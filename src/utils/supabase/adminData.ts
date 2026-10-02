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
  created_at: string;
  order_items?: OrderItem[];
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
