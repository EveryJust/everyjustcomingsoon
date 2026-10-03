import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { createAdminClient } from '@/utils/supabase/admin';
import { sendOrderConfirmationEmail } from '@/utils/email';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { 
      customerName, 
      customerEmail, 
      customerPhone, 
      shippingAddress, 
      items, 
      subtotal, 
      discountAmount,
      couponCode,
      totalAmount 
    } = body;

    // Validation
    if (!customerName || !customerEmail || !customerPhone || !shippingAddress || !items || items.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Please provide all required fields including contact and shipping address.' },
        { status: 400 }
      );
    }

    const userClient = await createClient();
    const adminClient = createAdminClient();
    const supabase = adminClient || userClient;

    // Check optional authenticated user
    let customerId: string | null = null;
    try {
      const { data: { user } } = await userClient.auth.getUser();
      if (user) {
        customerId = user.id;
      }
    } catch {
      // Guest checkout allowed
    }

    // Generate unique order number (e.g. EJ-260930-8421)
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const datePrefix = new Date().toISOString().slice(2, 10).replace(/-/g, '');
    const orderNumber = `EJ-${datePrefix}-${randomSuffix}`;

    // 1. Insert into orders table
    const orderPayload = {
      order_number: orderNumber,
      customer_id: customerId,
      customer_name: customerName,
      customer_email: customerEmail,
      customer_phone: customerPhone,
      subtotal: Number(subtotal) || Number(totalAmount) || 0,
      tax_amount: 0.00,
      shipping_amount: 0.00, // Free Cash on Delivery
      discount_amount: Number(discountAmount) || 0.00,
      total_amount: Number(totalAmount) || 0,
      coupon_code: couponCode ? String(couponCode).trim().toUpperCase() : null,
      status: 'processing',
      payment_status: 'pending', // Paid on delivery
      payment_method: 'Cash on Delivery',
      shipping_address: shippingAddress,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { data: orderData, error: orderError } = await supabase
      .from('orders')
      .insert(orderPayload)
      .select()
      .single();

    if (orderError) {
      console.error('Error inserting order into Supabase:', orderError);
      return NextResponse.json(
        { success: false, error: `Failed to create order: ${orderError.message}` },
        { status: 500 }
      );
    }

    const orderId = orderData.id;

    // 2. Insert into order_items table
    if (items && items.length > 0) {
      const orderItemsPayload = items.map((item: any) => ({
        order_id: orderId,
        product_name: item.name || 'Product Item',
        product_image: item.image || '/dash_camera.png',
        quantity: item.qty || 1,
        unit_price: Number(item.price) || 0,
        total_price: (Number(item.price) || 0) * (item.qty || 1)
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItemsPayload);

      if (itemsError) {
        console.warn('Warning: Failed to insert order items:', itemsError.message);
      }
    }

    // 3. Insert pending transaction for accounting & finances
    const txnPayload = {
      transaction_id: `TXN-${randomSuffix}-${datePrefix}`,
      order_id: orderId,
      type: 'income',
      amount: Number(totalAmount) || 0,
      fee: 0.00,
      net_amount: Number(totalAmount) || 0,
      status: 'pending',
      payment_method: 'Cash on Delivery',
      description: `Cash on Delivery payment for Order #${orderNumber}`,
      created_at: new Date().toISOString()
    };

    const { error: txnError } = await supabase
      .from('transactions')
      .insert(txnPayload);

    if (txnError) {
      console.warn('Notice: Failed to insert transaction record:', txnError.message);
    }

    // 4. Increment coupon usage count if coupon was applied
    if (couponCode) {
      try {
        const cleanCoupon = String(couponCode).trim().toUpperCase();
        // Fetch current count and increment
        const { data: cData } = await supabase
          .from('coupons')
          .select('id, usage_count')
          .eq('code', cleanCoupon)
          .maybeSingle();

        if (cData) {
          await supabase
            .from('coupons')
            .update({ usage_count: (cData.usage_count || 0) + 1 })
            .eq('id', cData.id);
        }
      } catch {
        // Non-critical, ignore coupon increment error
      }
    }

    // 5. Send Confirmation Email asynchronously
    let emailSent = false;
    try {
      const emailRes = await sendOrderConfirmationEmail({
        orderNumber,
        customerName,
        customerEmail,
        customerPhone,
        shippingAddress,
        items,
        subtotal: Number(subtotal) || Number(totalAmount) || 0,
        shippingAmount: 0.00,
        totalAmount: Number(totalAmount) || 0,
        paymentMethod: 'Cash on Delivery'
      });
      emailSent = emailRes.success;
    } catch (emailErr) {
      console.error('Email dispatch error:', emailErr);
    }

    return NextResponse.json({
      success: true,
      orderId,
      orderNumber,
      emailSent,
      message: 'Order placed successfully!'
    });
  } catch (err: any) {
    console.error('Unexpected error in order creation route:', err);
    return NextResponse.json(
      { success: false, error: err?.message || 'Server error creating order' },
      { status: 500 }
    );
  }
}
