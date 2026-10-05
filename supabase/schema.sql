-- =========================================================================
-- EveryJust Admin Dashboard, Finances, and Reports Schema
-- Run this in your Supabase SQL Editor (Dashboard -> SQL Editor -> New Query)
-- =========================================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. ORDERS TABLE
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_number TEXT UNIQUE NOT NULL,
    customer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    customer_name TEXT NOT NULL,
    customer_email TEXT NOT NULL,
    customer_phone TEXT,
    subtotal NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    tax_amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    shipping_amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    discount_amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    total_amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    status TEXT NOT NULL DEFAULT 'processing' CHECK (status IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded')),
    payment_status TEXT NOT NULL DEFAULT 'paid' CHECK (payment_status IN ('paid', 'pending', 'failed', 'refunded')),
    payment_method TEXT NOT NULL DEFAULT 'UPI' CHECK (payment_method IN ('UPI', 'Card', 'Net Banking', 'Cash on Delivery')),
    shipping_address JSONB DEFAULT '{}'::jsonb,
    coupon_code TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Ensure coupon_code column exists if orders table already exists
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS coupon_code TEXT;

-- 2. COUPONS TABLE
CREATE TABLE IF NOT EXISTS public.coupons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code TEXT UNIQUE NOT NULL,
    description TEXT,
    discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
    discount_value NUMERIC(10, 2) NOT NULL,
    min_order_amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    max_discount_amount NUMERIC(10, 2),
    is_active BOOLEAN NOT NULL DEFAULT true,
    usage_limit INTEGER,
    usage_count INTEGER NOT NULL DEFAULT 0,
    start_date TIMESTAMPTZ,
    end_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. ORDER ITEMS TABLE
CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
    product_name TEXT NOT NULL,
    product_image TEXT,
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_price NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    total_price NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. TRANSACTIONS & FINANCES TABLE
CREATE TABLE IF NOT EXISTS public.transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    transaction_id TEXT UNIQUE NOT NULL,
    order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
    type TEXT NOT NULL CHECK (type IN ('income', 'expense', 'refund', 'payout', 'gateway_fee', 'tax')),
    amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    fee NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    net_amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    status TEXT NOT NULL DEFAULT 'completed' CHECK (status IN ('completed', 'pending', 'failed')),
    payment_method TEXT NOT NULL DEFAULT 'UPI',
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Drop previous policies if they exist to avoid duplication errors
DROP POLICY IF EXISTS "Allow all for authenticated users on orders" ON public.orders;
DROP POLICY IF EXISTS "Allow all for authenticated users on order_items" ON public.order_items;
DROP POLICY IF EXISTS "Allow all for authenticated users on transactions" ON public.transactions;
DROP POLICY IF EXISTS "Allow public read access on orders" ON public.orders;
DROP POLICY IF EXISTS "Allow public read access on order_items" ON public.order_items;
DROP POLICY IF EXISTS "Allow public read access on transactions" ON public.transactions;

DROP POLICY IF EXISTS "Allow insert for all on orders" ON public.orders;
DROP POLICY IF EXISTS "Allow insert for all on order_items" ON public.order_items;

-- RLS Policies (Allow authenticated admin users full access, allow public insert for storefront checkout, and allow service/anon read)
CREATE POLICY "Allow all for authenticated users on orders"
    ON public.orders FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Allow insert for all on orders"
    ON public.orders FOR INSERT
    TO anon, authenticated
    WITH CHECK (true);

CREATE POLICY "Allow public read access on orders"
    ON public.orders FOR SELECT
    TO anon
    USING (true);

CREATE POLICY "Allow all for authenticated users on order_items"
    ON public.order_items FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Allow insert for all on order_items"
    ON public.order_items FOR INSERT
    TO anon, authenticated
    WITH CHECK (true);

CREATE POLICY "Allow public read access on order_items"
    ON public.order_items FOR SELECT
    TO anon
    USING (true);

CREATE POLICY "Allow all for authenticated users on transactions"
    ON public.transactions FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Allow public read access on transactions"
    ON public.transactions FOR SELECT
    TO anon
    USING (true);

-- Coupons RLS
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all for authenticated users on coupons" ON public.coupons;
DROP POLICY IF EXISTS "Allow public read access on coupons" ON public.coupons;

CREATE POLICY "Allow all for authenticated users on coupons"
    ON public.coupons FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Allow public read access on coupons"
    ON public.coupons FOR SELECT
    TO anon
    USING (true);

-- Indexes for lightning fast queries
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON public.transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON public.transactions(type);
CREATE INDEX IF NOT EXISTS idx_coupons_code ON public.coupons(code);
CREATE INDEX IF NOT EXISTS idx_coupons_is_active ON public.coupons(is_active);

-- 4. INITIAL SEED COUPONS (Insert if not exists)
INSERT INTO public.coupons (code, description, discount_type, discount_value, min_order_amount, max_discount_amount, is_active)
VALUES 
    ('EVERYJUST', 'Official Welcome Discount - Flat ₹50 off on all orders', 'fixed', 50.00, 0.00, NULL, true),
    ('SAVE50', 'Save Flat ₹50 on any purchase above ₹199', 'fixed', 50.00, 199.00, NULL, true),
    ('WELCOME20', 'Get 20% off up to ₹200 on orders above ₹499', 'percentage', 20.00, 499.00, 200.00, true),
    ('FLAT100', 'Flat ₹100 discount on cart value above ₹899', 'fixed', 100.00, 899.00, NULL, true)
ON CONFLICT (code) DO NOTHING;

-- 5. REVIEWS TABLE
CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
    product_name TEXT NOT NULL,
    product_image TEXT,
    order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
    order_number TEXT,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    user_name TEXT NOT NULL,
    user_email TEXT,
    user_phone TEXT,
    user_avatar TEXT,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    title TEXT,
    comment TEXT NOT NULL,
    media JSONB DEFAULT '[]'::jsonb, -- Array of { url: string, type: 'image' | 'video' }
    verified_purchase BOOLEAN NOT NULL DEFAULT true,
    status TEXT NOT NULL DEFAULT 'approved' CHECK (status IN ('approved', 'pending', 'rejected', 'hidden')),
    helpful_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Reviews RLS
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read access on reviews" ON public.reviews;
DROP POLICY IF EXISTS "Allow insert for all on reviews" ON public.reviews;
DROP POLICY IF EXISTS "Allow all for authenticated users on reviews" ON public.reviews;

CREATE POLICY "Allow public read access on reviews"
    ON public.reviews FOR SELECT
    TO anon, authenticated
    USING (true);

CREATE POLICY "Allow insert for all on reviews"
    ON public.reviews FOR INSERT
    TO anon, authenticated
    WITH CHECK (true);

CREATE POLICY "Allow all for authenticated users on reviews"
    ON public.reviews FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_reviews_product_id ON public.reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON public.reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_order_id ON public.reviews(order_id);
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON public.reviews(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON public.reviews(rating);

-- Ensure delivered_at column exists on orders table
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS delivered_at TIMESTAMPTZ;

-- =========================================================================
-- 6. REFERRALS TABLE & 30-DAY VALIDITY PROGRAM
-- =========================================================================
CREATE TABLE IF NOT EXISTS public.referrals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    referrer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    referrer_code TEXT NOT NULL,
    referred_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    referred_user_email TEXT,
    referred_user_name TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'order_placed', 'return_period', 'completed', 'cancelled', 'expired')),
    order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
    order_number TEXT,
    order_amount NUMERIC(10, 2),
    reward_amount NUMERIC(10, 2) NOT NULL DEFAULT 50.00,
    min_order_amount NUMERIC(10, 2) NOT NULL DEFAULT 100.00,
    delivered_at TIMESTAMPTZ,
    return_period_ends_at TIMESTAMPTZ,
    paid_out BOOLEAN NOT NULL DEFAULT false,
    expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '30 days'),
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- In case referrals table already exists, ensure the new columns and updated status constraint exist
ALTER TABLE public.referrals ADD COLUMN IF NOT EXISTS delivered_at TIMESTAMPTZ;
ALTER TABLE public.referrals ADD COLUMN IF NOT EXISTS return_period_ends_at TIMESTAMPTZ;
ALTER TABLE public.referrals ADD COLUMN IF NOT EXISTS paid_out BOOLEAN DEFAULT false;

-- Drop old status check if it was restricted to ('pending', 'completed', 'expired')
ALTER TABLE public.referrals DROP CONSTRAINT IF EXISTS referrals_status_check;
ALTER TABLE public.referrals ADD CONSTRAINT referrals_status_check 
    CHECK (status IN ('pending', 'order_placed', 'return_period', 'completed', 'cancelled', 'expired'));

-- Referrals RLS
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read access on referrals" ON public.referrals;
DROP POLICY IF EXISTS "Allow insert for all on referrals" ON public.referrals;
DROP POLICY IF EXISTS "Allow all for authenticated users on referrals" ON public.referrals;

CREATE POLICY "Allow public read access on referrals"
    ON public.referrals FOR SELECT
    TO anon, authenticated
    USING (true);

CREATE POLICY "Allow insert for all on referrals"
    ON public.referrals FOR INSERT
    TO anon, authenticated
    WITH CHECK (true);

CREATE POLICY "Allow all for authenticated users on referrals"
    ON public.referrals FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_referrals_referrer_id ON public.referrals(referrer_id);
CREATE INDEX IF NOT EXISTS idx_referrals_referrer_code ON public.referrals(referrer_code);
CREATE INDEX IF NOT EXISTS idx_referrals_referred_user_id ON public.referrals(referred_user_id);
CREATE INDEX IF NOT EXISTS idx_referrals_status ON public.referrals(status);
CREATE INDEX IF NOT EXISTS idx_referrals_created_at ON public.referrals(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_referrals_expires_at ON public.referrals(expires_at);
CREATE INDEX IF NOT EXISTS idx_referrals_return_period ON public.referrals(return_period_ends_at);


