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
  Check,
  ShieldCheck
} from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { createClient } from '@/utils/supabase/client';
import toast from 'react-hot-toast';

export interface Address {
  id: string;
  fullName: string;
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

  // Form State
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [pincode, setPincode] = useState('');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('Kerala');
  const [landmark, setLandmark] = useState('');
  const [addressType, setAddressType] = useState<'Home' | 'Work' | 'Other'>('Home');
  const [isDefault, setIsDefault] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Load addresses from localStorage and Supabase user metadata
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

  // Persist addresses to localStorage and Supabase
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

    // If logged in, update Supabase user metadata
    if (user) {
      try {
        const supabase = createClient();
        await supabase.auth.updateUser({
          data: { addresses: updated }
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

      let updatedList: Address[] = [];

      if (editingId) {
        updatedList = addresses.map((a) => {
          if (a.id === editingId) {
            return {
              ...a,
              fullName: fullName.trim(),
              phone: phone.trim(),
              pincode: pincode.trim(),
              street: street.trim(),
              city: city.trim(),
              state: state.trim(),
              landmark: landmark.trim(),
              addressType,
              isDefault: makeDefault
            };
          }
          return makeDefault ? { ...a, isDefault: false } : a;
        });
        toast.success('Address updated successfully');
      } else {
        const newAddress: Address = {
          id: `addr_${Date.now()}`,
          fullName: fullName.trim(),
          phone: phone.trim(),
          pincode: pincode.trim(),
          street: street.trim(),
          city: city.trim(),
          state: state.trim(),
          landmark: landmark.trim(),
          addressType,
          isDefault: makeDefault
        };

        if (makeDefault) {
          updatedList = [newAddress, ...addresses.map((a) => ({ ...a, isDefault: false }))];
        } else {
          updatedList = [newAddress, ...addresses];
        }
        toast.success('New address added!');
      }

      await persistAddresses(updatedList);
      setIsModalOpen(false);
    } catch {
      toast.error('Failed to save address');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSetDefault = async (id: string) => {
    const updated = addresses.map((a) => ({
      ...a,
      isDefault: a.id === id
    }));
    await persistAddresses(updated);
    toast.success('Default delivery address updated');
  };

  const handleDelete = async (id: string) => {
    const toDelete = addresses.find((a) => a.id === id);
    const updated = addresses.filter((a) => a.id !== id);

    // If deleting default address and there are other addresses, make the first one default
    if (toDelete?.isDefault && updated.length > 0) {
      updated[0].isDefault = true;
    }

    await persistAddresses(updated);
    toast.success('Address removed');
  };

  const getTypeIcon = (type: 'Home' | 'Work' | 'Other') => {
    switch (type) {
      case 'Home':
        return <Home className="w-3.5 h-3.5" />;
      case 'Work':
        return <Briefcase className="w-3.5 h-3.5" />;
      default:
        return <Building className="w-3.5 h-3.5" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24 lg:pb-12 text-gray-900">
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
            <h1 className="text-base font-extrabold tracking-wide uppercase text-gray-800">
              My Addresses
            </h1>
          </div>

          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-1 px-3 py-1.5 bg-primary text-white text-xs font-bold rounded-lg hover:bg-primary/90 transition-colors shadow-xs cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 stroke-[3]" />
            Add New
          </button>
        </div>
      </div>

      <div className="max-w-xl mx-auto px-4 py-4 space-y-4">
        {/* Addresses list */}
        {mounted && addresses.length > 0 ? (
          <div className="space-y-3">
            {addresses.map((addr) => (
              <div
                key={addr.id}
                className={`bg-white rounded-2xl p-4 border transition-all ${
                  addr.isDefault
                    ? 'border-primary/80 ring-1 ring-primary/20 shadow-xs'
                    : 'border-gray-100 hover:border-gray-200 shadow-xs'
                }`}
              >
                {/* Header with Type & Default badge */}
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-700">
                      {getTypeIcon(addr.addressType)}
                      {addr.addressType}
                    </span>
                    {addr.isDefault && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <Check className="w-3 h-3 stroke-[3]" />
                        Default
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(addr)}
                      className="p-1.5 text-gray-400 hover:text-primary transition-colors cursor-pointer rounded-lg hover:bg-gray-100"
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

                {/* Name & Phone */}
                <h3 className="text-sm font-bold text-gray-900">{addr.fullName}</h3>
                <div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium mt-0.5 mb-2">
                  <Phone className="w-3.5 h-3.5 text-gray-400" />
                  <span>+91 {addr.phone}</span>
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
              className="absolute top-5 right-5 text-gray-400 hover:text-gray-600 p-1 rounded-full"
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
                    placeholder="e.g. Near Metro Station"
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
                    placeholder="e.g. Kerala"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-xs font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    required
                  />
                </div>
              </div>

              {/* Address Type Buttons */}
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
                          ? 'border-primary bg-primary/10 text-primary shadow-xs'
                          : 'border-gray-200 text-gray-600 hover:border-gray-300'
                      }`}
                    >
                      {getTypeIcon(type)}
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {/* Default Address Checkbox */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="makeDefault"
                  checked={isDefault}
                  onChange={(e) => setIsDefault(e.target.checked)}
                  className="w-4 h-4 rounded text-primary focus:ring-primary border-gray-300"
                />
                <label htmlFor="makeDefault" className="text-xs font-semibold text-gray-700 cursor-pointer">
                  Make this my default delivery address
                </label>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-3">
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
                  className="flex-1 py-2.5 bg-primary text-white font-bold text-xs rounded-xl hover:bg-primary/90 transition-colors shadow-xs cursor-pointer disabled:opacity-50"
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
