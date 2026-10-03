import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { createAdminClient } from '@/utils/supabase/admin';

interface AddressItem {
  id: string;
  fullName: string;
  email?: string;
  phone: string;
  pincode: string;
  street: string;
  city: string;
  state: string;
  landmark?: string;
  addressType: 'Home' | 'Work' | 'Other';
  isDefault: boolean;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, phone, userId, clientAddresses } = body;

    const userClient = await createClient();
    const adminClient = createAdminClient();
    const supabase = adminClient || userClient;

    const cleanEmail = email ? String(email).trim().toLowerCase() : '';
    const cleanPhone = phone ? String(phone).replace(/\D/g, '').slice(-10) : '';

    // If neither email nor phone is provided, return existing client addresses
    if (!cleanEmail && !cleanPhone && !userId) {
      return NextResponse.json({
        success: true,
        addresses: clientAddresses || [],
        linkedOrdersCount: 0
      });
    }

    // 1. Find all orders in Supabase that match:
    // - customer_id = userId
    // - customer_email ILIKE cleanEmail
    // - customer_phone contains cleanPhone
    let ordersQuery = supabase
      .from('orders')
      .select('id, order_number, customer_id, customer_name, customer_email, customer_phone, shipping_address, created_at')
      .order('created_at', { ascending: false });

    // Build or condition
    const orConditions: string[] = [];
    if (userId) {
      orConditions.push(`customer_id.eq.${userId}`);
    }
    if (cleanEmail) {
      orConditions.push(`customer_email.ilike.${cleanEmail}`);
    }
    if (cleanPhone && cleanPhone.length >= 10) {
      orConditions.push(`customer_phone.ilike.%${cleanPhone}%`);
    }

    if (orConditions.length > 0) {
      ordersQuery = ordersQuery.or(orConditions.join(','));
    }

    const { data: matchedOrders, error: ordersError } = await ordersQuery;

    if (ordersError) {
      console.warn('Orders query warning during sync:', ordersError.message);
    }

    const orders = matchedOrders || [];

    // 2. Link unlinked guest orders to userId if authenticated
    let linkedOrdersCount = 0;
    if (userId && orders.length > 0) {
      const unlinkedOrderIds = orders
        .filter((o) => !o.customer_id)
        .map((o) => o.id);

      if (unlinkedOrderIds.length > 0) {
        const { error: linkError } = await supabase
          .from('orders')
          .update({ customer_id: userId })
          .in('id', unlinkedOrderIds);

        if (!linkError) {
          linkedOrdersCount = unlinkedOrderIds.length;
        }
      }
    }

    // 3. Extract shipping addresses from orders
    const extractedAddresses: AddressItem[] = [];
    orders.forEach((order, idx) => {
      const sa = order.shipping_address;
      if (sa && (sa.street || sa.city || sa.pincode)) {
        const addrPhone = (sa.phone || order.customer_phone || '').replace(/\D/g, '').slice(-10);
        extractedAddresses.push({
          id: `order_addr_${order.id || idx}`,
          fullName: sa.fullName || order.customer_name || 'Customer',
          email: sa.email || order.customer_email || cleanEmail || '',
          phone: addrPhone || cleanPhone || '',
          pincode: sa.pincode ? String(sa.pincode).trim() : '',
          street: sa.street ? String(sa.street).trim() : '',
          city: sa.city ? String(sa.city).trim() : '',
          state: sa.state ? String(sa.state).trim() : 'Kerala',
          landmark: sa.landmark ? String(sa.landmark).trim() : '',
          addressType: 'Home',
          isDefault: false
        });
      }
    });

    // 4. Merge client addresses + extracted addresses
    const allCandidates: AddressItem[] = [
      ...(Array.isArray(clientAddresses) ? clientAddresses : []),
      ...extractedAddresses
    ];

    // Deduplicate addresses by normalized street + pincode
    const mergedAddresses: AddressItem[] = [];
    const seenSignatures = new Set<string>();

    allCandidates.forEach((addr) => {
      if (!addr || !addr.street || !addr.pincode) return;

      const normStreet = addr.street.toLowerCase().replace(/[^a-z0-9]/g, '');
      const normPin = addr.pincode.replace(/\D/g, '');
      const signature = `${normStreet}_${normPin}`;

      if (!seenSignatures.has(signature)) {
        seenSignatures.add(signature);
        // Ensure email & clean phone are attached
        mergedAddresses.push({
          ...addr,
          email: addr.email || cleanEmail || '',
          phone: addr.phone ? addr.phone.replace(/\D/g, '').slice(-10) : cleanPhone || '',
          isDefault: mergedAddresses.length === 0 ? true : !!addr.isDefault
        });
      } else {
        // Enrich existing entry if current has missing phone or email
        const existingIdx = mergedAddresses.findIndex(
          (a) => `${a.street.toLowerCase().replace(/[^a-z0-9]/g, '')}_${a.pincode.replace(/\D/g, '')}` === signature
        );
        if (existingIdx !== -1) {
          if (!mergedAddresses[existingIdx].email && (addr.email || cleanEmail)) {
            mergedAddresses[existingIdx].email = addr.email || cleanEmail;
          }
          if (!mergedAddresses[existingIdx].phone && (addr.phone || cleanPhone)) {
            mergedAddresses[existingIdx].phone = (addr.phone || cleanPhone).replace(/\D/g, '').slice(-10);
          }
        }
      }
    });

    // Ensure exactly one default address if list is not empty
    if (mergedAddresses.length > 0) {
      const hasDefault = mergedAddresses.some((a) => a.isDefault);
      if (!hasDefault) {
        mergedAddresses[0].isDefault = true;
      }
    }

    // 5. If user is logged in, sync to Supabase user metadata
    if (userId) {
      try {
        const { data: { user } } = await userClient.auth.getUser();
        if (user && user.id === userId) {
          await userClient.auth.updateUser({
            data: { addresses: mergedAddresses }
          });
        }
      } catch (authErr) {
        console.warn('Failed to update user auth metadata in sync API:', authErr);
      }
    }

    return NextResponse.json({
      success: true,
      addresses: mergedAddresses,
      linkedOrdersCount,
      totalOrdersMatched: orders.length
    });
  } catch (err: any) {
    console.error('Error syncing user addresses and orders:', err);
    return NextResponse.json(
      { success: false, error: err?.message || 'Server error syncing user data' },
      { status: 500 }
    );
  }
}
