'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ChevronLeft,
  ChevronRight,
  Search,
  ShoppingCart,
  PhoneCall,
  Languages,
  Sparkles,
  Building2,
  Package,
  Heart,
  Wallet,
  LogOut,
  LogIn,
  Camera,
  Check,
  X,
  User as UserIcon,
  ShieldCheck,
  Loader2,
  Trash2,
  MapPin,
  Phone
} from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { useCartStore } from '@/store/useCartStore';
import { useWishlistStore } from '@/store/useWishlistStore';
import { createClient } from '@/utils/supabase/client';
import { uploadToCloudinary } from '@/utils/uploadCloudinary';
import ImageCropperModal from '@/components/Admin/ImageCropperModal';
import CartDrawer from '@/components/CartDrawer';
import toast from 'react-hot-toast';

export default function AccountPage() {
  const router = useRouter();
  const { user, signOut, initialize } = useAuthStore();
  const { items: cartItems } = useCartStore();
  const { items: wishlistItems } = useWishlistStore();

  const [mounted, setMounted] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Modals state
  const [activeModal, setActiveModal] = useState<'language' | 'balance' | 'editProfile' | null>(null);

  // Profile Edit State
  const [editingName, setEditingName] = useState('');
  const [editingPhone, setEditingPhone] = useState('');
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  // Cloudinary Avatar Upload & Cropping State
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedImageForCrop, setSelectedImageForCrop] = useState<string | null>(null);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Lock body scroll when any modal is open
  useEffect(() => {
    if (activeModal || selectedImageForCrop) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [activeModal, selectedImageForCrop]);

  useEffect(() => {
    if (user) {
      setEditingName(user.user_metadata?.full_name || user.user_metadata?.name || '');
      setEditingPhone(user.user_metadata?.phone || user.phone || '');
    }
  }, [user]);

  const cartCount = mounted ? cartItems.reduce((acc, item) => acc + item.qty, 0) : 0;
  const wishlistCount = mounted ? wishlistItems.length : 0;

  // File selection for avatar
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      if (file.size > 10 * 1024 * 1024) {
        toast.error('Image size must be less than 10MB');
        return;
      }
      const url = URL.createObjectURL(file);
      setSelectedImageForCrop(url);
    }
    if (e.target) {
      e.target.value = '';
    }
  };

  // Crop complete: upload blob to Cloudinary & update Supabase user
  const handleCropComplete = async (croppedBlob: Blob) => {
    setSelectedImageForCrop(null);
    setIsUploadingPhoto(true);
    const toastId = toast.loading('Uploading profile picture to Cloudinary...');

    try {
      const secureUrl = await uploadToCloudinary(croppedBlob);

      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({
        data: { avatar_url: secureUrl }
      });

      if (error) throw error;

      await initialize();
      toast.success('Profile picture updated successfully!', { id: toastId });
    } catch (err: any) {
      console.error('Cloudinary upload error:', err);
      toast.error(err.message || 'Failed to upload image', { id: toastId });
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  // Remove photo
  const handleRemovePhoto = async () => {
    setIsUploadingPhoto(true);
    const toastId = toast.loading('Removing profile picture...');
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({
        data: { avatar_url: null }
      });

      if (error) throw error;

      await initialize();
      toast.success('Profile picture removed', { id: toastId });
    } catch (err: any) {
      toast.error(err.message || 'Failed to remove picture', { id: toastId });
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingName.trim()) {
      toast.error('Name cannot be empty');
      return;
    }
    if (editingPhone.trim() && editingPhone.trim().length !== 10) {
      toast.error('Mobile number must be 10 digits');
      return;
    }

    setIsUpdatingProfile(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({
        data: {
          full_name: editingName.trim(),
          phone: editingPhone.trim()
        }
      });
      if (error) throw error;

      // Automatically sync all past guest orders and addresses for this phone & email
      try {
        await fetch('/api/user/sync-data', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: user?.email,
            phone: editingPhone.trim(),
            userId: user?.id
          })
        });
      } catch {}

      await initialize();
      toast.success('Profile updated successfully!');
      setActiveModal(null);
    } catch (err: any) {
      toast.error(err.message || 'Failed to update profile');
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success('Logged out successfully');
      router.push('/');
    } catch {
      toast.error('Error logging out');
    }
  };

  const userName = user?.user_metadata?.full_name || user?.user_metadata?.name || (user?.email ? user.email.split('@')[0] : '');
  const userEmail = user?.email || '';
  const userAvatar = user?.user_metadata?.avatar_url || '';
  const userPhone = user?.user_metadata?.phone || user?.phone || '';

  return (
    <div className="min-h-screen bg-gray-50 pb-24 lg:pb-12 text-gray-900">
      {/* Hidden file input for avatar upload */}
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/png, image/jpeg, image/webp, image/jpg"
        onChange={handleFileChange}
      />

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
              Account
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/categories')}
              aria-label="Search"
              className="p-1.5 text-gray-700 hover:text-primary transition-colors cursor-pointer rounded-full hover:bg-gray-100"
            >
              <Search className="w-5 h-5 stroke-[2.2]" />
            </button>

            <button
              onClick={() => setIsCartOpen(true)}
              aria-label="View Cart"
              className="p-1.5 text-gray-700 hover:text-primary transition-colors relative cursor-pointer rounded-full hover:bg-gray-100"
            >
              <ShoppingCart className="w-5 h-5 stroke-[2.2]" />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-[#d81b60] text-white text-[10px] min-w-4 h-4 px-1 rounded-full flex items-center justify-center font-bold shadow-xs">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-xl mx-auto px-4 py-4 space-y-4">
        {/* User Profile Card */}
        <div className="bg-white rounded-2xl p-4 shadow-xs border border-gray-100 transition-all">
          {user ? (
            <div className="flex items-center justify-between">
              <div 
                onClick={() => setActiveModal('editProfile')}
                className="flex items-center gap-4 min-w-0 cursor-pointer flex-1 group"
              >
                {/* Avatar with Camera badge */}
                <div 
                  className="relative flex-shrink-0 group/avatar"
                  onClick={(e) => {
                    e.stopPropagation();
                    fileInputRef.current?.click();
                  }}
                  title="Change profile picture"
                >
                  <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-100 border-2 border-white shadow-xs flex items-center justify-center relative">
                    {isUploadingPhoto ? (
                      <div className="w-full h-full bg-black/50 flex items-center justify-center">
                        <Loader2 className="w-6 h-6 text-white animate-spin" />
                      </div>
                    ) : userAvatar ? (
                      <img src={userAvatar} alt={userName} className="w-full h-full object-cover group-hover/avatar:opacity-90 transition-opacity" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-tr from-gray-700 to-gray-900 text-white font-extrabold text-2xl flex items-center justify-center">
                        {userName ? userName.charAt(0).toUpperCase() : 'U'}
                      </div>
                    )}
                  </div>
                  <button 
                    type="button"
                    aria-label="Upload photo"
                    className="absolute -bottom-1 -right-1 bg-white border border-gray-200 rounded-full p-1 shadow-xs hover:bg-primary hover:text-white transition-colors cursor-pointer"
                  >
                    <Camera className="w-3.5 h-3.5 text-gray-600 hover:text-white" />
                  </button>
                </div>

                {/* User Info */}
                <div className="min-w-0 flex-1">
                  <h2 className="text-lg font-bold text-gray-900 truncate group-hover:text-primary transition-colors">
                    {userName || 'Valued Customer'}
                  </h2>
                  <p className="text-xs text-gray-500 truncate mt-0.5 font-medium">
                    {userEmail}
                  </p>
                  {userPhone ? (
                    <p className="text-xs text-gray-600 font-semibold truncate mt-0.5 flex items-center gap-1">
                      <Phone className="w-3 h-3 text-gray-400" />
                      +91 {userPhone}
                    </p>
                  ) : (
                    <span className="inline-block mt-0.5 text-[11px] font-semibold text-primary">
                      + Add mobile number
                    </span>
                  )}
                </div>
              </div>

              <button
                onClick={() => setActiveModal('editProfile')}
                className="p-2 text-gray-400 hover:text-gray-600 cursor-pointer"
                title="Edit profile"
              >
                <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600 group-hover:translate-x-0.5 transition-all flex-shrink-0" />
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 min-w-0">
                {/* Guest Avatar */}
                <div className="relative flex-shrink-0">
                  <div className="w-16 h-16 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-400">
                    <UserIcon className="w-8 h-8" />
                  </div>
                  <div className="absolute -bottom-1 -right-1 bg-white border border-gray-200 rounded-full p-1 shadow-xs">
                    <Camera className="w-3.5 h-3.5 text-gray-400" />
                  </div>
                </div>

                <div className="min-w-0">
                  <h2 className="text-base font-bold text-gray-900">
                    Welcome to EveryJust
                  </h2>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Sign in to track orders, saved cards & details
                  </p>
                  <Link
                    href="/login"
                    className="inline-flex items-center gap-1.5 mt-2 px-4 py-1.5 bg-primary text-white text-xs font-bold rounded-lg hover:bg-primary/90 transition-colors shadow-xs"
                  >
                    <LogIn className="w-3.5 h-3.5" />
                    Sign Up / Log In
                  </Link>
                </div>
              </div>

              <Link href="/login" className="p-2 text-gray-400 hover:text-gray-600">
                <ChevronRight className="w-5 h-5" />
              </Link>
            </div>
          )}
        </div>

        {/* 2 Quick Action Cards: Help Centre & Change Language */}
        <div className="grid grid-cols-2 gap-3">
          <Link
            href="/help"
            className="bg-white rounded-2xl p-4 border border-gray-100 shadow-xs flex flex-col items-center justify-center text-center hover:border-gray-200 transition-all group"
          >
            <div className="w-11 h-11 rounded-full bg-sky-50 text-sky-600 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
              <PhoneCall className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-gray-800 group-hover:text-primary transition-colors">
              Help Centre
            </span>
          </Link>

          <button
            onClick={() => setActiveModal('language')}
            className="bg-white rounded-2xl p-4 border border-gray-100 shadow-xs flex flex-col items-center justify-center text-center hover:border-gray-200 transition-all group cursor-pointer"
          >
            <div className="w-11 h-11 rounded-full bg-fuchsia-50 text-fuchsia-600 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform font-bold text-sm">
              अ A
            </div>
            <span className="text-xs font-bold text-gray-800 group-hover:text-primary transition-colors">
              Change Language
            </span>
          </button>
        </div>

        {/* Invite Friends & Earn Banner Card (Links to dedicated page) */}
        <Link
          href="/account/invite"
          className="bg-white rounded-2xl p-4 border border-gray-100 shadow-xs flex items-center justify-between hover:border-emerald-200 transition-all group block"
        >
          <div className="space-y-0.5">
            <h3 className="text-sm font-bold text-gray-800 flex items-center gap-1.5">
              Invite Friends & Earn
            </h3>
            <p className="text-xs text-gray-500">
              Cash in EveryJust Balance
            </p>
          </div>

          <div className="flex items-center gap-2 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200/80 rounded-xl px-4 py-2 text-emerald-700 shadow-xs group-hover:scale-105 transition-transform">
            <span className="text-lg font-extrabold tracking-tight">₹78</span>
            <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
          </div>
        </Link>

        {/* SECTION: My Payments (Only EveryJust Balance & Bank & UPI Details) */}
        <div className="space-y-1">
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-gray-600 px-2 py-1">
            My Payments
          </h3>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-xs divide-y divide-gray-100 overflow-hidden">
            {/* EveryJust Balance */}
            <button
              onClick={() => setActiveModal('balance')}
              className="w-full px-4 py-3.5 flex items-center justify-between hover:bg-gray-50/80 transition-colors text-left cursor-pointer"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
                  <Wallet className="w-4 h-4" />
                </div>
                <span className="text-sm font-semibold text-gray-800">
                  EveryJust Balance
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="bg-emerald-50 text-emerald-700 text-xs font-extrabold px-2.5 py-0.5 rounded-full border border-emerald-100">
                  ₹0
                </span>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </div>
            </button>

            {/* Bank & UPI Details (Links to dedicated page) */}
            <Link
              href="/account/bank-upi"
              className="w-full px-4 py-3.5 flex items-center justify-between hover:bg-gray-50/80 transition-colors text-left"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Building2 className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-sm font-semibold text-gray-800 block">
                    Bank & UPI Details
                  </span>
                  <span className="text-[11px] text-gray-400 font-medium">
                    For instant refund purposes
                  </span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </Link>
          </div>
        </div>

        {/* SECTION: My Activity (My Orders, My Addresses, Change Language, Wishlisted Products) */}
        <div className="space-y-1">
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-gray-600 px-2 py-1">
            My Activity
          </h3>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-xs divide-y divide-gray-100 overflow-hidden">
            {/* My Orders / Track Order */}
            <Link
              href="/orders"
              className="w-full px-4 py-3.5 flex items-center justify-between hover:bg-gray-50/80 transition-colors text-left"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                  <Package className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-sm font-semibold text-gray-800 block">
                    My Orders
                  </span>
                  <span className="text-[11px] text-gray-400 font-medium">
                    Track orders & view history
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-semibold text-primary">
                  Track
                </span>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </div>
            </Link>

            {/* My Addresses */}
            <Link
              href="/account/addresses"
              className="w-full px-4 py-3.5 flex items-center justify-between hover:bg-gray-50/80 transition-colors text-left"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-sm font-semibold text-gray-800 block">
                    My Addresses
                  </span>
                  <span className="text-[11px] text-gray-400 font-medium">
                    Manage saved delivery locations
                  </span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </Link>

            {/* Change Language */}
            <button
              onClick={() => setActiveModal('language')}
              className="w-full px-4 py-3.5 flex items-center justify-between hover:bg-gray-50/80 transition-colors text-left cursor-pointer"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-8 h-8 rounded-xl bg-fuchsia-50 text-fuchsia-600 flex items-center justify-center font-bold text-xs">
                  अ A
                </div>
                <span className="text-sm font-semibold text-gray-800">
                  Change Language
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400 font-medium">
                  English
                </span>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </div>
            </button>

            {/* Wishlisted Products */}
            <Link
              href="/wishlist"
              className="w-full px-4 py-3.5 flex items-center justify-between hover:bg-gray-50/80 transition-colors text-left"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-500 flex items-center justify-center">
                  <Heart className="w-4 h-4 fill-rose-500" />
                </div>
                <span className="text-sm font-semibold text-gray-800">
                  Wishlisted Products
                </span>
              </div>
              <div className="flex items-center gap-2">
                {wishlistCount > 0 && (
                  <span className="bg-rose-50 text-rose-600 text-xs font-bold px-2 py-0.5 rounded-full">
                    {wishlistCount}
                  </span>
                )}
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </div>
            </Link>
          </div>
        </div>

        {/* SECTION: Others (Customer Support, About & Policies, Log In / Log Out) */}
        <div className="space-y-1">
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-gray-600 px-2 py-1">
            Others
          </h3>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-xs divide-y divide-gray-100 overflow-hidden">
            {/* Customer Support */}
            <Link
              href="/contact"
              className="w-full px-4 py-3.5 flex items-center justify-between hover:bg-gray-50/80 transition-colors text-left"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <PhoneCall className="w-4 h-4" />
                </div>
                <span className="text-sm font-semibold text-gray-800">
                  Customer Support
                </span>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </Link>

            {/* About & Policies */}
            <Link
              href="/about-us"
              className="w-full px-4 py-3.5 flex items-center justify-between hover:bg-gray-50/80 transition-colors text-left"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-8 h-8 rounded-xl bg-gray-50 text-gray-600 flex items-center justify-center">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <span className="text-sm font-semibold text-gray-800">
                  About & Policies
                </span>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </Link>

            {/* Log Out / Log In */}
            {user ? (
              <button
                onClick={handleSignOut}
                className="w-full px-4 py-3.5 flex items-center justify-between hover:bg-rose-50/60 transition-colors text-left cursor-pointer group"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center group-hover:bg-rose-100 transition-colors">
                    <LogOut className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-bold text-rose-600">
                    Log Out
                  </span>
                </div>
                <ChevronRight className="w-4 h-4 text-rose-400" />
              </button>
            ) : (
              <Link
                href="/login"
                className="w-full px-4 py-3.5 flex items-center justify-between hover:bg-primary/5 transition-colors text-left cursor-pointer group"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                    <LogIn className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-bold text-primary">
                    Sign Up / Log In
                  </span>
                </div>
                <ChevronRight className="w-4 h-4 text-primary" />
              </Link>
            )}
          </div>
        </div>

        {/* App Version Info */}
        <div className="text-center pt-2 pb-6">
          <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
            EveryJust v1.0.4 • 100% Genuine Products
          </p>
        </div>
      </div>

      {/* Cart Drawer */}
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />

      {/* MODAL: Image Cropper Modal */}
      {selectedImageForCrop && (
        <ImageCropperModal
          isOpen={true}
          imageSrc={selectedImageForCrop}
          aspectRatio={1}
          cropShape="round"
          title="Crop Profile Picture"
          onClose={() => setSelectedImageForCrop(null)}
          onCropComplete={handleCropComplete}
        />
      )}

      {/* MODAL: Edit Profile */}
      {activeModal === 'editProfile' && user && (
        <div 
          onClick={() => setActiveModal(null)}
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-gray-100 relative"
          >
            <button
              onClick={() => setActiveModal(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-gray-900 mb-1">Your Profile</h3>
            <p className="text-xs text-gray-500 mb-4">View and update your personal information.</p>

            {/* Profile Picture Upload Section */}
            <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl mb-4 border border-gray-100">
              <div className="w-14 h-14 rounded-full overflow-hidden bg-gray-200 flex-shrink-0 flex items-center justify-center relative border border-gray-200">
                {isUploadingPhoto ? (
                  <Loader2 className="w-5 h-5 text-primary animate-spin" />
                ) : userAvatar ? (
                  <img src={userAvatar} alt={userName} className="w-full h-full object-cover" />
                ) : (
                  <span className="font-extrabold text-xl text-gray-700">
                    {userName ? userName.charAt(0).toUpperCase() : 'U'}
                  </span>
                )}
              </div>
              <div className="space-y-1">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploadingPhoto}
                  className="px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-xs font-bold text-gray-800 hover:bg-gray-100 flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                >
                  <Camera className="w-3.5 h-3.5 text-primary" />
                  {userAvatar ? 'Change Photo' : 'Upload Photo'}
                </button>
                {userAvatar && (
                  <button
                    type="button"
                    onClick={handleRemovePhoto}
                    disabled={isUploadingPhoto}
                    className="text-[11px] font-semibold text-rose-500 hover:underline block cursor-pointer disabled:opacity-50"
                  >
                    Remove Photo
                  </button>
                )}
              </div>
            </div>

            <form onSubmit={handleUpdateProfile} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Email Address</label>
                <input
                  type="email"
                  value={userEmail}
                  disabled
                  className="w-full px-3.5 py-2.5 bg-gray-100 border border-gray-200 rounded-xl text-xs font-semibold text-gray-500 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Full Name</label>
                <input
                  type="text"
                  value={editingName}
                  onChange={(e) => setEditingName(e.target.value)}
                  placeholder="Enter your full name"
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-sm font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Mobile Number</label>
                <div className="flex">
                  <span className="inline-flex items-center px-3 bg-gray-100 border border-r-0 border-gray-300 rounded-l-xl text-xs font-bold text-gray-600">
                    +91
                  </span>
                  <input
                    type="tel"
                    maxLength={10}
                    placeholder="Enter 10-digit mobile number"
                    value={editingPhone}
                    onChange={(e) => setEditingPhone(e.target.value.replace(/\D/g, ''))}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-r-xl text-xs font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent font-mono"
                  />
                </div>
                <p className="text-[10px] text-gray-400 mt-1">Used for doorstep delivery updates & OTP verification</p>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="flex-1 py-2.5 bg-gray-100 text-gray-700 font-bold text-xs rounded-xl hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdatingProfile}
                  className="flex-1 py-2.5 bg-primary text-white font-bold text-xs rounded-xl hover:bg-primary/90 transition-colors shadow-xs disabled:opacity-50"
                >
                  {isUpdatingProfile ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Change Language (English Only with Coming Soon note) */}
      {activeModal === 'language' && (
        <div 
          onClick={() => setActiveModal(null)}
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-gray-100 relative"
          >
            <button
              onClick={() => setActiveModal(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-12 h-12 rounded-2xl bg-fuchsia-50 text-fuchsia-600 flex items-center justify-center text-lg font-bold mb-3">
              अ A
            </div>

            <h3 className="text-lg font-bold text-gray-900 mb-1">Select Language</h3>
            <p className="text-xs text-gray-500 mb-4">Choose your preferred display language for EveryJust.</p>

            <div className="space-y-2 mb-4">
              {/* English (Active) */}
              <div className="w-full px-4 py-3 rounded-xl border border-primary bg-primary/5 flex items-center justify-between text-left">
                <div>
                  <span className="text-sm font-bold text-primary block">English</span>
                  <span className="text-[11px] text-gray-500">Currently active language</span>
                </div>
                <div className="w-5 h-5 rounded-full bg-primary text-white flex items-center justify-center">
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </div>
              </div>

              {/* Hindi (Coming Soon) */}
              <div className="w-full px-4 py-2.5 rounded-xl border border-gray-100 bg-gray-50/70 flex items-center justify-between text-left opacity-75">
                <div>
                  <span className="text-sm font-semibold text-gray-700 block">हिन्दी (Hindi)</span>
                  <span className="text-[10px] text-gray-400">Coming soon</span>
                </div>
                <span className="bg-gray-200 text-gray-600 text-[10px] font-bold px-2 py-0.5 rounded-full">
                  Soon
                </span>
              </div>

              {/* Bengali (Coming Soon) */}
              <div className="w-full px-4 py-2.5 rounded-xl border border-gray-100 bg-gray-50/70 flex items-center justify-between text-left opacity-75">
                <div>
                  <span className="text-sm font-semibold text-gray-700 block">বাংলা (Bengali)</span>
                  <span className="text-[10px] text-gray-400">Coming soon</span>
                </div>
                <span className="bg-gray-200 text-gray-600 text-[10px] font-bold px-2 py-0.5 rounded-full">
                  Soon
                </span>
              </div>

              {/* Tamil (Coming Soon) */}
              <div className="w-full px-4 py-2.5 rounded-xl border border-gray-100 bg-gray-50/70 flex items-center justify-between text-left opacity-75">
                <div>
                  <span className="text-sm font-semibold text-gray-700 block">தமிழ் (Tamil)</span>
                  <span className="text-[10px] text-gray-400">Coming soon</span>
                </div>
                <span className="bg-gray-200 text-gray-600 text-[10px] font-bold px-2 py-0.5 rounded-full">
                  Soon
                </span>
              </div>
            </div>

            <button
              onClick={() => {
                toast.success('English is set as default');
                setActiveModal(null);
              }}
              className="w-full py-2.5 bg-primary text-white font-bold text-xs rounded-xl hover:bg-primary/90 transition-colors shadow-xs cursor-pointer"
            >
              Continue in English
            </button>
          </div>
        </div>
      )}

      {/* MODAL: EveryJust Balance */}
      {activeModal === 'balance' && (
        <div 
          onClick={() => setActiveModal(null)}
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-gray-100 relative"
          >
            <button
              onClick={() => setActiveModal(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-12 h-12 rounded-2xl bg-teal-100 text-teal-700 flex items-center justify-center mb-3">
              <Wallet className="w-6 h-6" />
            </div>

            <h3 className="text-lg font-bold text-gray-900 mb-1">EveryJust Balance</h3>
            <p className="text-xs text-gray-500 mb-4">
              Your wallet balance is automatically redeemed on checkout for instant savings.
            </p>

            <div className="bg-teal-50/70 border border-teal-100 rounded-xl p-4 mb-4 text-center">
              <p className="text-xs text-gray-600 font-medium mb-1">Available Balance</p>
              <p className="text-3xl font-extrabold text-teal-700">₹0.00</p>
              <p className="text-[11px] text-gray-400 mt-1">Earn ₹78 per friend invited!</p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setActiveModal(null)}
                className="flex-1 py-2.5 bg-gray-100 text-gray-700 font-bold text-xs rounded-xl hover:bg-gray-200 transition-colors"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setActiveModal(null);
                  router.push('/account/invite');
                }}
                className="flex-1 py-2.5 bg-primary text-white font-bold text-xs rounded-xl hover:bg-primary/90 transition-colors shadow-xs"
              >
                Earn Balance
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
