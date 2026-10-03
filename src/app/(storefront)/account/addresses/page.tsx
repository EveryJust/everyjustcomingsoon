'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ChevronLeft,
  MapPin,
  Plus,
  Home,
  Briefcase,
  Building,
  CheckCircle2,
  Trash2,
  Edit2,
  X,
  Phone,
  Mail,
  Check,
  ShieldCheck,
  RefreshCw
} from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { createClient } from '@/utils/supabase/client';
import toast from 'react-hot-toast';

export interface Address {
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

export default function AddressesPage() {
  const router = useRouter();
  const { user, initialize } = useAuthStore();

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [mounted, setMounted] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  // Form State
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [pincode, setPincode] = useState('');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('Kerala');
  const [landmark, setLandmark] = useState('');
  const [addressType, setAddressType] = useState<'Home' | 'Work' | 'Other'>('Home');
  const [isDefault, setIsDefault] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Load addresses & sync with email and phone
  useEffect(() => {
    setMounted(true);
    let loaded: Address[] = [];

    try {
      const stored = localStorage.getItem('everyjust_user_addresses');
      if (stored) {
        loaded = JSON.parse(stored);
      }
    } catch {}

    // Check if single address exists in checkout localStorage
    if (loaded.length === 0) {
      try {
        const single = localStorage.getItem('saved_shipping_address');
        if (single) {
          const parsed = JSON.parse(single);
          if (parsed.fullName && parsed.street) {
            loaded = [
              {
                id: 'addr_1',
                fullName: parsed.fullName,
                email: parsed.email || '',
                phone: parsed.phone || '',
                pincode: parsed.pincode || '',
                street: parsed.street || '',
                city: parsed.city || '',
                state: parsed.state || 'Kerala',
                landmark: parsed.landmark || '',
                addressType: 'Home',
                isDefault: true
              }
            ];
          }
        }
      } catch {}
    }

    // Merge with user metadata if logged in
    if (user?.user_metadata?.addresses && Array.isArray(user.user_metadata.addresses)) {
      if (user.user_metadata.addresses.length > 0) {
        loaded = user.user_metadata.addresses;
      }
    }

    setAddresses(loaded);

    // Auto-sync addresses by email and phone across orders & profile
    const userEmail = user?.email || (typeof window !== 'undefined' ? localStorage.getItem('last_customer_email') || '' : '');
    const userPhone = user?.user_metadata?.phone || user?.phone || '';

    if (userEmail || userPhone) {
      setIsSyncing(true);
      fetch('/api/user/sync-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: userEmail,
          phone: userPhone,
          userId: user?.id,
          clientAddresses: loaded
        })
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.success && Array.isArray(data.addresses) && data.addresses.length > 0) {
            setAddresses(data.addresses);
            try {
              localStorage.setItem('everyjust_user_addresses', JSON.stringify(data.addresses));
              const def = data.addresses.find((a: Address) => a.isDefault) || data.addresses[0];
              if (def) {
                localStorage.setItem('saved_shipping_address', JSON.stringify(def));
              }
            } catch {}
          }
        })
        .catch(() => {})
        .finally(() => setIsSyncing(false));
    }
  }, [user]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isModalOpen]);

  // Persist addresses to localStorage, user metadata, and sync API
  const persistAddresses = async (updated: Address[]) => {
    setAddresses(updated);
    try {
      localStorage.setItem('everyjust_user_addresses', JSON.stringify(updated));

      // Also sync the default address to checkout's saved_shipping_address
      const defaultAddr = updated.find((a) => a.isDefault) || updated[0];
      if (defaultAddr) {
        localStorage.setItem(
          'saved_shipping_address',
          JSON.stringify({
            fullName: defaultAddr.fullName,
            email: defaultAddr.email || user?.email || '',
            phone: defaultAddr.phone,
            pincode: defaultAddr.pincode,
            street: defaultAddr.street,
            city: defaultAddr.city,
            state: defaultAddr.state,
            landmark: defaultAddr.landmark || '',
            country: 'India'
          })
        );
      } else {
        localStorage.removeItem('saved_shipping_address');
      }
    } catch {}

    // If logged in, update Supabase user metadata and trigger sync API
    if (user) {
      try {
        const supabase = createClient();
        await supabase.auth.updateUser({
          data: { addresses: updated }
        });
        await fetch('/api/user/sync-data', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: user.email,
            phone: user.user_metadata?.phone || user.phone,
            userId: user.id,
            clientAddresses: updated
          })
        });
        await initialize();
      } catch (err) {
        console.error('Failed to sync addresses to Supabase:', err);
      }
    }
  };

  const handleOpenAdd = () => {
    setEditingId(null);
    setFullName(user?.user_metadata?.full_name || '');
    setEmail(user?.email || '');
    setPhone(user?.user_metadata?.phone || '');
    setPincode('');
    setStreet('');
    setCity('');
    setState('Kerala');
    setLandmark('');
    setAddressType('Home');
    setIsDefault(addresses.length === 0);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (addr: Address) => {
    setEditingId(addr.id);
    setFullName(addr.fullName);
    setEmail(addr.email || user?.email || '');
    setPhone(addr.phone);
    setPincode(addr.pincode);
    setStreet(addr.street);
    setCity(addr.city);
    setState(addr.state);
    setLandmark(addr.landmark || '');
    setAddressType(addr.addressType);
    setIsDefault(addr.isDefault);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) return toast.error('Full name is required');
    if (!phone.trim() || phone.trim().length < 10) return toast.error('Valid 10-digit mobile number is required');
    if (!pincode.trim() || pincode.trim().length < 6) return toast.error('Valid 6-digit pincode is required');
    if (!street.trim()) return toast.error('House / flat / street address is required');
    if (!city.trim()) return toast.error('City / Town is required');

    setIsSaving(true);
    try {
      const isFirst = addresses.length === 0;
      const makeDefault = isDefault || isFirst;

      let updated: Address[] = [];

      if (editingId) {
        updated = addresses.map((addr) => {
          if (addr.id === editingId) {
            return {
              ...addr,
              fullName: fullName.trim(),
              email: email.trim() || user?.email || '',
              phone: phone.trim().slice(-10),
              pincode: pincode.trim(),
              street: street.trim(),
              city: city.trim(),
              state: state.trim(),
              landmark: landmark.trim() || undefined,
              addressType,
              isDefault: makeDefault
            };
          }
          return makeDefault ? { ...addr, isDefault: false } : addr;
        });
        toast.success('Address updated successfully');
      } else {
        const newAddress: Address = {
          id: `addr_${Date.now()}`,
          fullName: fullName.trim(),
          email: email.trim() || user?.email || '',
          phone: phone.trim().slice(-10),
          pincode: pincode.trim(),
          street: street.trim(),
          city: city.trim(),
          state: state.trim(),
          landmark: landmark.trim() || undefined,
          addressType,
          isDefault: makeDefault
        };

        const existingMapped = makeDefault
          ? addresses.map((a) => ({ ...a, isDefault: false }))
          : [...addresses];

        updated = [newAddress, ...existingMapped];
        toast.success('New address added successfully');
      }

      await persistAddresses(updated);
      setIsModalOpen(false);
    } catch {
      toast.error('Failed to save address');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this address?')) return;

    const remaining = addresses.filter((a) => a.id !== id);
    if (remaining.length > 0 && !remaining.some((a) => a.isDefault)) {
      remaining[0].isDefault = true;
    }
    await persistAddresses(remaining);
    toast.success('Address deleted');
  };

  const handleSetDefault = async (id: string) => {
    const updated = addresses.map((a) => ({
      ...a,
      isDefault: a.id === id
    }));
    await persistAddresses(updated);
    toast.success('Default delivery address updated');
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'Work':
        return <Briefcase className="w-3.5 h-3.5" />;
      case 'Other':
        return <Building className="w-3.5 h-3.5" />;
      default:
        return <Home className="w-3.5 h-3.5" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20 text-gray-900">
      {/* Top Header */}
      <div className="sticky top-0 z-40 bg-white border-b border-gray-100 shadow-xs">
        <div className="max-w-xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              aria-label="Go back"
              className="p-1.5 -ml-1 text-gray-700 hover:text-primary transition-colors cursor-pointer rounded-full hover:bg-gray-100"
            >
              <ChevronLeft className="w-6 h-6 stroke-[2.5]" />
            </button>
            <div>
              <h1 className="text-base font-extrabold tracking-wide uppercase text-gray-800">
                My Addresses
              </h1>
            </div>
          </div>

          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary text-white font-bold text-xs rounded-xl hover:bg-primary/90 transition-all shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Add New</span>
          </button>
        </div>
      </div>

      <div className="max-w-xl mx-auto px-4 py-4 space-y-4">
        {/* Info Banner */}
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-xs flex items-start gap-3">
          <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0 mt-0.5">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div className="space-y-0.5 flex-1">
            <h2 className="text-xs font-bold text-gray-800">Linked to your Account</h2>
            <p className="text-[11px] text-gray-500 leading-relaxed">
              Addresses from your past orders placed with your email or mobile number are automatically saved here for quick 1-click checkout.
            </p>
          </div>
          {isSyncing && (
            <RefreshCw className="w-3.5 h-3.5 text-primary animate-spin mt-1 flex-shrink-0" />
          )}
        </div>

        {/* Address Cards List */}
        {addresses.length > 0 ? (
          <div className="space-y-3">
            {addresses.map((addr) => (
              <div
                key={addr.id}
                className={`bg-white rounded-2xl p-4 border transition-all ${
                  addr.isDefault
                    ? 'border-primary ring-1 ring-primary/30 shadow-xs'
                    : 'border-gray-100 shadow-xs hover:border-gray-200'
                }`}
              >
                {/* Header: Type Tag & Actions */}
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-gray-100 text-gray-700">
                      {getTypeIcon(addr.addressType)}
                      {addr.addressType}
                    </span>
                    {addr.isDefault && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200/80">
                        <Check className="w-3 h-3 stroke-[3]" />
                        Default
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(addr)}
                      className="p-1.5 text-gray-400 hover:text-gray-700 transition-colors cursor-pointer rounded-lg hover:bg-gray-100"
                      title="Edit Address"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(addr.id)}
                      className="p-1.5 text-gray-400 hover:text-rose-600 transition-colors cursor-pointer rounded-lg hover:bg-rose-50"
                      title="Delete Address"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Name & Contact */}
                <h3 className="text-sm font-bold text-gray-900">{addr.fullName}</h3>
                <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 font-medium mt-1 mb-2">
                  <div className="flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-gray-400" />
                    <span>+91 {addr.phone}</span>
                  </div>
                  {addr.email && (
                    <div className="flex items-center gap-1">
                      <Mail className="w-3.5 h-3.5 text-gray-400" />
                      <span className="truncate max-w-[200px]">{addr.email}</span>
                    </div>
                  )}
                </div>

                {/* Full Address details */}
                <p className="text-xs text-gray-600 leading-relaxed">
                  {addr.street}
                  {addr.landmark && `, near ${addr.landmark}`}, {addr.city}, {addr.state} -{' '}
                  <span className="font-bold text-gray-800">{addr.pincode}</span>
                </p>

                {/* Footer action to set default */}
                {!addr.isDefault && (
                  <div className="pt-3 mt-3 border-t border-gray-100 flex justify-end">
                    <button
                      onClick={() => handleSetDefault(addr.id)}
                      className="text-xs font-bold text-primary hover:underline cursor-pointer"
                    >
                      Set as Default Delivery Address
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-xs text-center space-y-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 text-primary flex items-center justify-center">
              <MapPin className="w-8 h-8" />
            </div>

            <div>
              <h2 className="text-lg font-bold text-gray-900">No Addresses Saved</h2>
              <p className="text-xs text-gray-500 mt-1 max-w-xs mx-auto">
                Save your home or work delivery address for faster 1-click checkout and accurate delivery times.
              </p>
            </div>

            <button
              onClick={handleOpenAdd}
              className="inline-flex items-center gap-1.5 px-6 py-3 bg-primary text-white font-bold text-xs rounded-xl hover:bg-primary/90 transition-all shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              Add Your First Address
            </button>
          </div>
        )}
      </div>

      {/* MODAL: Add / Edit Address */}
      {isModalOpen && (
        <div
          onClick={() => setIsModalOpen(false)}
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-100 relative max-h-[90vh] overflow-y-auto"
          >
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-5 right-5 text-gray-400 hover:text-gray-600 p-1 rounded-full cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-gray-900 mb-0.5">
              {editingId ? 'Edit Address' : 'Add New Address'}
            </h3>
            <p className="text-xs text-gray-500 mb-4">
              Enter your accurate delivery details for safe doorstep shipping.
            </p>

            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. John Doe"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-xs font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Mobile Number (10 digits) <span className="text-rose-500">*</span>
                  </label>
                  <div className="flex">
                    <span className="inline-flex items-center px-3 bg-gray-100 border border-r-0 border-gray-300 rounded-l-xl text-xs font-bold text-gray-600">
                      +91
                    </span>
                    <input
                      type="tel"
                      maxLength={10}
                      placeholder="9876543210"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                      className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-r-xl text-xs font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent font-mono"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Email Address (Optional)
                  </label>
                  <input
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-xs font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Pincode (6 digits) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    placeholder="682001"
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-xs font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    City / Town <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Kochi"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-xs font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Flat, House No, Building, Street <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Flat 4B, Emerald Heights, MG Road"
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-xs font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Landmark (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Near Metro Pillar 42"
                    value={landmark}
                    onChange={(e) => setLandmark(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-xs font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    State <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-xs font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    required
                  />
                </div>
              </div>

              {/* Address Type Selector */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  Address Type
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['Home', 'Work', 'Other'] as const).map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setAddressType(type)}
                      className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        addressType === type
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      {getTypeIcon(type)}
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {/* Set as Default Checkbox */}
              <label className="flex items-center gap-2.5 pt-1 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isDefault}
                  onChange={(e) => setIsDefault(e.target.checked)}
                  className="w-4 h-4 text-primary rounded border-gray-300 focus:ring-primary"
                />
                <span className="text-xs font-semibold text-gray-700">
                  Make this my default delivery address
                </span>
              </label>

              {/* Modal Buttons */}
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2.5 bg-gray-100 text-gray-700 font-bold text-xs rounded-xl hover:bg-gray-200 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex-1 py-2.5 bg-primary text-white font-bold text-xs rounded-xl hover:bg-primary/90 transition-colors shadow-xs disabled:opacity-50 cursor-pointer"
                >
                  {isSaving ? 'Saving...' : 'Save Address'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
