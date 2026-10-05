import { NextResponse } from 'next/server';
import { createAdminClient } from '@/utils/supabase/admin';
import { createClient } from '@/utils/supabase/server';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { status } = body;

    const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'];
    if (!status || !validStatuses.includes(status.toLowerCase())) {
      return NextResponse.json(
        { success: false, error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` },
        { status: 400 }
      );
    }

    const adminClient = createAdminClient();
    const userClient = await createClient();
    const supabase = adminClient || userClient;

    const updatePayload: any = { 
      status: status.toLowerCase(),
      updated_at: new Date().toISOString() 
    };

    if (status.toLowerCase() === 'delivered') {
      updatePayload.delivered_at = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from('orders')
      .update(updatePayload)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    // Update referral status for this order (starts 3-day return window on delivery)
    try {
      const { updateReferralOnOrderStatusChange } = await import('@/utils/referralStorage');
      await updateReferralOnOrderStatusChange({
        orderId: id,
        orderNumber: data?.order_number,
        newStatus: status.toLowerCase()
      });
    } catch (refErr) {
      console.warn('Notice: Referral status sync notice:', refErr);
    }

    return NextResponse.json({ success: true, order: data });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
