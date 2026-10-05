import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/utils/supabase/admin';
import { createClient } from '@/utils/supabase/server';

// POST /api/admin/users/[id]/addresses - Add new address for user
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { fullName, phone, street, city, state = 'Kerala', pincode, addressType = 'Home', isDefault = false } = body;

    if (!street || !city || !pincode) {
      return NextResponse.json(
        { success: false, error: 'Street, city, and pincode are required' },
        { status: 400 }
      );
    }

    const adminClient = createAdminClient();
    const userClient = await createClient();

    let currentAddresses: any[] = [];

    // Fetch existing addresses from auth metadata
    if (adminClient?.auth?.admin) {
      const { data } = await adminClient.auth.admin.getUserById(id);
      if (data?.user?.user_metadata?.addresses) {
        currentAddresses = [...data.user.user_metadata.addresses];
      }
    }

    const newAddress = {
      id: `addr-${Date.now()}`,
      fullName: fullName || 'Customer',
      phone: phone || '',
      street,
      city,
      state,
      pincode,
      addressType,
      isDefault: isDefault || currentAddresses.length === 0,
    };

    if (newAddress.isDefault) {
      currentAddresses = currentAddresses.map((a) => ({ ...a, isDefault: false }));
    }

    currentAddresses.unshift(newAddress);

    // Save to user metadata
    if (adminClient?.auth?.admin) {
      await adminClient.auth.admin.updateUserById(id, {
        user_metadata: { addresses: currentAddresses },
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Address added successfully',
      addresses: currentAddresses,
      address: newAddress,
    });
  } catch (err: any) {
    console.error('Error adding user address:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to add address' },
      { status: 500 }
    );
  }
}

// PATCH /api/admin/users/[id]/addresses - Update address or set default
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { addressId, action, updatedAddress } = body;

    const adminClient = createAdminClient();
    if (!adminClient?.auth?.admin) {
      return NextResponse.json(
        { success: false, error: 'Admin client not available' },
        { status: 500 }
      );
    }

    const { data } = await adminClient.auth.admin.getUserById(id);
    let addresses: any[] = data?.user?.user_metadata?.addresses || [];

    if (action === 'set_default') {
      addresses = addresses.map((a) => ({
        ...a,
        isDefault: a.id === addressId,
      }));
    } else if (action === 'update' && updatedAddress) {
      addresses = addresses.map((a) => (a.id === addressId ? { ...a, ...updatedAddress } : a));
    }

    await adminClient.auth.admin.updateUserById(id, {
      user_metadata: { addresses },
    });

    return NextResponse.json({
      success: true,
      message: 'Address updated successfully',
      addresses,
    });
  } catch (err: any) {
    console.error('Error updating address:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// DELETE /api/admin/users/[id]/addresses - Delete an address
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(req.url);
    const addressId = searchParams.get('addressId');

    const adminClient = createAdminClient();
    if (!adminClient?.auth?.admin) {
      return NextResponse.json(
        { success: false, error: 'Admin client not available' },
        { status: 500 }
      );
    }

    const { data } = await adminClient.auth.admin.getUserById(id);
    let addresses: any[] = data?.user?.user_metadata?.addresses || [];

    addresses = addresses.filter((a) => a.id !== addressId);
    if (addresses.length > 0 && !addresses.some((a) => a.isDefault)) {
      addresses[0].isDefault = true;
    }

    await adminClient.auth.admin.updateUserById(id, {
      user_metadata: { addresses },
    });

    return NextResponse.json({
      success: true,
      message: 'Address deleted successfully',
      addresses,
    });
  } catch (err: any) {
    console.error('Error deleting address:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
