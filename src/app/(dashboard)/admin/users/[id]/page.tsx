'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  Users,
  ArrowLeft,
  Mail,
  Phone,
  Calendar,
  Shield,
  ShieldCheck,
  ShoppingBag,
  MapPin,
  Gift,
  CheckCircle2,
  Clock,
  AlertCircle,
  XCircle,
  Plus,
  Edit2,
  Trash2,
  ExternalLink,
  Copy,
  Check,
  Key,
  DollarSign,
  TrendingUp,
  RefreshCw,
  MoreVertical,
  Award,
  Sparkles,
} from 'lucide-react';
import { formatCurrency } from '@/utils/currency';
import toast from 'react-hot-toast';

export default function UserDetailPage() {
  const params = useParams();
  const router = useRouter();
  const userId = params.id as string;

  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'addresses' | 'referrals'>('overview');

  // Form states for profile edit
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'customer',
    status: 'active',
    referral_code: '',
  });
  const [savingProfile, setSavingProfile] = useState(false);

  // Password reset state
  const [newPassword, setNewPassword] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);

  // Address modal state
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [addressForm, setAddressForm] = useState({
    fullName: '',
    phone: '',
    street: '',
    city: '',
    state: 'Kerala',
    pincode: '',
    addressType: 'Home' as 'Home' | 'Work' | 'Other',
    isDefault: false,
  });
  const [savingAddress, setSavingAddress] = useState(false);

  // Assign Referral Modal state
  const [showAssignReferralModal, setShowAssignReferralModal] = useState(false);
  const [assignForm, setAssignForm] = useState({
    referred_name: '',
    referred_email: '',
    order_number: '',
    order_amount: '150',
    reward_amount: '50',
    status: 'completed' as 'pending' | 'order_placed' | 'return_period' | 'completed',
    note: 'Manually assigned by admin',
  });
  const [submittingAssign, setSubmittingAssign] = useState(false);

  // Instant Credit Reward Modal state
  const [showCreditModal, setShowCreditModal] = useState(false);
  const [creditAmount, setCreditAmount] = useState('50');
  const [creditNote, setCreditNote] = useState('Promotional bonus reward');
  const [submittingCredit, setSubmittingCredit] = useState(false);

  // Assign Referrer Modal state (who referred this user)
  const [showAssignReferrerModal, setShowAssignReferrerModal] = useState(false);
  const [referrerCodeInput, setReferrerCodeInput] = useState('');
  const [submittingReferrerCode, setSubmittingReferrerCode] = useState(false);

  // Copy referral code state
  const [copiedCode, setCopiedCode] = useState(false);

  // Fetch single user details
  const fetchUserDetails = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/users/${encodeURIComponent(userId)}`);
      const data = await res.json();
      if (data.success && data.user) {
        setUser(data.user);
        setEditForm({
          name: data.user.name || '',
          email: data.user.email || '',
          phone: data.user.phone || '',
          role: data.user.role || 'customer',
          status: data.user.status || 'active',
          referral_code: data.user.referral_code || '',
        });
      } else {
        toast.error(data.error || 'Failed to load user');
      }
    } catch {
      toast.error('Network error loading user details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchUserDetails();
    }
  }, [userId]);

  // Handle Save Profile
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const res = await fetch(`/api/admin/users/${encodeURIComponent(userId)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      });
      const data = await res.json();
      if (data.success) {
        toast.success('User profile updated successfully!');
        fetchUserDetails();
      } else {
        toast.error(data.error || 'Failed to update profile');
      }
    } catch {
      toast.error('Network error updating profile');
    } finally {
      setSavingProfile(false);
    }
  };

  // Handle Change Status
  const handleStatusChange = async (newStatus: 'active' | 'suspended' | 'banned') => {
    try {
      const res = await fetch(`/api/admin/users/${encodeURIComponent(userId)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`User status changed to ${newStatus}`);
        fetchUserDetails();
      } else {
        toast.error(data.error || 'Failed to change status');
      }
    } catch {
      toast.error('Network error');
    }
  };

  // Handle Change Role
  const handleRoleChange = async (newRole: 'customer' | 'admin' | 'vendor') => {
    try {
      const res = await fetch(`/api/admin/users/${encodeURIComponent(userId)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`User role updated to ${newRole}`);
        fetchUserDetails();
      } else {
        toast.error(data.error || 'Failed to update role');
      }
    } catch {
      toast.error('Network error');
    }
  };

  // Handle Reset Password
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    setSavingPassword(true);
    try {
      const res = await fetch(`/api/admin/users/${encodeURIComponent(userId)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: newPassword }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Password updated successfully!');
        setNewPassword('');
      } else {
        toast.error(data.error || 'Failed to update password');
      }
    } catch {
      toast.error('Network error updating password');
    } finally {
      setSavingPassword(false);
    }
  };

  // Handle Add Address
  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addressForm.street || !addressForm.city || !addressForm.pincode) {
      toast.error('Street, city, and pincode are required');
      return;
    }
    setSavingAddress(true);
    try {
      const res = await fetch(`/api/admin/users/${encodeURIComponent(userId)}/addresses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(addressForm),
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Address added successfully!');
        setShowAddressModal(false);
        setAddressForm({
          fullName: '',
          phone: '',
          street: '',
          city: '',
          state: 'Kerala',
          pincode: '',
          addressType: 'Home',
          isDefault: false,
        });
        fetchUserDetails();
      } else {
        toast.error(data.error || 'Failed to add address');
      }
    } catch {
      toast.error('Network error adding address');
    } finally {
      setSavingAddress(false);
    }
  };

  // Handle Set Default Address
  const handleSetDefaultAddress = async (addressId: string) => {
    try {
      const res = await fetch(`/api/admin/users/${encodeURIComponent(userId)}/addresses`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'set_default', addressId }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Default address updated');
        fetchUserDetails();
      } else {
        toast.error(data.error || 'Failed to update address');
      }
    } catch {
      toast.error('Network error');
    }
  };

  // Handle Delete Address
  const handleDeleteAddress = async (addressId: string) => {
    if (!confirm('Are you sure you want to delete this address?')) return;
    try {
      const res = await fetch(
        `/api/admin/users/${encodeURIComponent(userId)}/addresses?addressId=${encodeURIComponent(addressId)}`,
        { method: 'DELETE' }
      );
      const data = await res.json();
      if (data.success) {
        toast.success('Address removed');
        fetchUserDetails();
      } else {
        toast.error(data.error || 'Failed to delete address');
      }
    } catch {
      toast.error('Network error');
    }
  };

  // Handle Assign Referral to User
  const handleAssignReferral = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingAssign(true);
    try {
      const res = await fetch(`/api/admin/users/${encodeURIComponent(userId)}/referrals`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'assign_referral',
          userCode: user.referral_code,
          ...assignForm,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Referral assigned to user successfully!');
        setShowAssignReferralModal(false);
        setAssignForm({
          referred_name: '',
          referred_email: '',
          order_number: '',
          order_amount: '150',
          reward_amount: '50',
          status: 'completed',
          note: 'Manually assigned by admin',
        });
        fetchUserDetails();
      } else {
        toast.error(data.error || 'Failed to assign referral');
      }
    } catch {
      toast.error('Network error assigning referral');
    } finally {
      setSubmittingAssign(false);
    }
  };

  // Handle Instant Credit Reward
  const handleCreditReward = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingCredit(true);
    try {
      const res = await fetch(`/api/admin/users/${encodeURIComponent(userId)}/referrals`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'credit_reward',
          userCode: user.referral_code,
          amount: creditAmount,
          note: creditNote,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`₹${creditAmount} credited successfully!`);
        setShowCreditModal(false);
        fetchUserDetails();
      } else {
        toast.error(data.error || 'Failed to credit reward');
      }
    } catch {
      toast.error('Network error');
    } finally {
      setSubmittingCredit(false);
    }
  };

  // Handle Set Referrer (Who referred this user)
  const handleSetReferrer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!referrerCodeInput) return;
    setSubmittingReferrerCode(true);
    try {
      const res = await fetch(`/api/admin/users/${encodeURIComponent(userId)}/referrals`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'set_referrer',
          referrer_code: referrerCodeInput,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Referrer code assigned successfully!');
        setShowAssignReferrerModal(false);
        fetchUserDetails();
      } else {
        toast.error(data.error || 'Failed to assign referrer');
      }
    } catch {
      toast.error('Network error');
    } finally {
      setSubmittingReferrerCode(false);
    }
  };

  // Handle Approve Referral (1-Click Approval -> Completed & Credit ₹50)
  const handleApproveReferral = async (referralId: string) => {
    try {
      const res = await fetch(`/api/admin/users/${encodeURIComponent(userId)}/referrals`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'approve',
          referral_id: referralId,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Referral approved! ₹50 reward credited to user.');
        fetchUserDetails();
      } else {
        toast.error(data.error || 'Failed to approve referral');
      }
    } catch {
      toast.error('Network error');
    }
  };

  // Handle Change Referral Status
  const handleChangeReferralStatus = async (referralId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/admin/users/${encodeURIComponent(userId)}/referrals`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update_status',
          referral_id: referralId,
          status: newStatus,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Referral status updated to ${newStatus}`);
        fetchUserDetails();
      } else {
        toast.error(data.error || 'Failed to update referral status');
      }
    } catch {
      toast.error('Network error');
    }
  };

  // Handle Delete Referral
  const handleDeleteReferral = async (referralId: string) => {
    if (!confirm('Are you sure you want to remove this referral record?')) return;
    try {
      const res = await fetch(
        `/api/admin/users/${encodeURIComponent(userId)}/referrals?referral_id=${encodeURIComponent(referralId)}`,
        { method: 'DELETE' }
      );
      const data = await res.json();
      if (data.success) {
        toast.success('Referral record deleted');
        fetchUserDetails();
      } else {
        toast.error(data.error || 'Failed to delete referral');
      }
    } catch {
      toast.error('Network error');
    }
  };

  const copyCode = () => {
    if (user?.referral_code) {
      navigator.clipboard.writeText(user.referral_code);
      setCopiedCode(true);
      toast.success('Referral code copied!');
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="p-16 text-center">
        <div className="animate-spin rounded-full h-10 w-10 border-3 border-primary border-t-transparent mx-auto"></div>
        <p className="text-xs font-bold text-gray-600 mt-4">Loading user profile and records...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-12 text-center bg-white rounded-3xl border border-gray-100 shadow-2xs space-y-4">
        <AlertCircle size={40} className="text-amber-500 mx-auto" />
        <h2 className="text-lg font-black text-gray-900">User Not Found</h2>
        <p className="text-xs text-gray-500">The requested user ID does not exist or has been removed.</p>
        <Link
          href="/admin/users"
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary text-white rounded-xl text-xs font-bold hover:bg-primary/90 transition-all"
        >
          <ArrowLeft size={14} />
          <span>Back to Users</span>
        </Link>
      </div>
    );
  }

  const roleBadgeColors: Record<string, string> = {
    admin: 'bg-purple-50 text-purple-700 border-purple-200',
    vendor: 'bg-amber-50 text-amber-700 border-amber-200',
    customer: 'bg-blue-50 text-blue-700 border-blue-200',
  };

  const statusBadgeColors: Record<string, string> = {
    active: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    suspended: 'bg-amber-50 text-amber-700 border-amber-200',
    banned: 'bg-rose-50 text-rose-700 border-rose-200',
  };

  const regDate = new Date(user.created_at).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Top Breadcrumb & Navigation */}
      <div className="flex items-center justify-between">
        <Link
          href="/admin/users"
          className="inline-flex items-center gap-2 text-xs font-bold text-gray-500 hover:text-primary transition-colors cursor-pointer group"
        >
          <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
          <span>Back to Users List</span>
        </Link>

        <button
          type="button"
          onClick={fetchUserDetails}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-gray-50 border border-gray-200 text-xs font-bold text-gray-700 rounded-xl transition-all shadow-2xs cursor-pointer"
        >
          <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Hero Header Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start sm:items-center gap-4">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-primary to-purple-600 text-white font-black text-2xl flex items-center justify-center shadow-md flex-shrink-0">
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-full h-full rounded-2xl object-cover"
                />
              ) : (
                user.name.charAt(0).toUpperCase()
              )}
            </div>

            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
                  {user.name}
                </h1>
                <span
                  className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                    roleBadgeColors[user.role?.toLowerCase()] || roleBadgeColors.customer
                  }`}
                >
                  {user.role || 'Customer'}
                </span>
                <span
                  className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                    statusBadgeColors[user.status?.toLowerCase()] || statusBadgeColors.active
                  }`}
                >
                  {user.status || 'Active'}
                </span>
                {user.is_registered ? (
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <CheckCircle2 size={10} /> Registered
                  </span>
                ) : (
                  <span className="text-[10px] font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                    Guest Shopper
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500">
                {user.email && (
                  <span className="flex items-center gap-1.5">
                    <Mail size={13} className="text-gray-400" />
                    <span>{user.email}</span>
                  </span>
                )}
                {user.phone && (
                  <span className="flex items-center gap-1.5 font-mono">
                    <Phone size={13} className="text-gray-400" />
                    <span>{user.phone}</span>
                  </span>
                )}
                <span className="flex items-center gap-1.5">
                  <Calendar size={13} className="text-gray-400" />
                  <span>Member since {regDate}</span>
                </span>
              </div>
            </div>
          </div>

          {/* Quick Header Admin Actions */}
          <div className="flex flex-wrap items-center gap-2 pt-2 md:pt-0 border-t md:border-t-0 border-gray-100">
            {/* Status Change Dropdown */}
            <div className="flex items-center gap-1 bg-gray-50 p-1 rounded-xl border border-gray-200 text-xs">
              <span className="text-[10px] font-bold text-gray-400 px-2">STATUS:</span>
              {(['active', 'suspended', 'banned'] as const).map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => handleStatusChange(st)}
                  className={`px-2.5 py-1 rounded-lg font-bold capitalize transition-all cursor-pointer ${
                    user.status === st
                      ? 'bg-white text-gray-900 shadow-2xs font-extrabold'
                      : 'text-gray-500 hover:text-gray-900'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>

            {/* Role Change Dropdown */}
            <div className="flex items-center gap-1 bg-gray-50 p-1 rounded-xl border border-gray-200 text-xs">
              <span className="text-[10px] font-bold text-gray-400 px-2">ROLE:</span>
              {(['customer', 'vendor', 'admin'] as const).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => handleRoleChange(r)}
                  className={`px-2.5 py-1 rounded-lg font-bold capitalize transition-all cursor-pointer ${
                    user.role === r
                      ? 'bg-primary text-white shadow-2xs font-extrabold'
                      : 'text-gray-500 hover:text-gray-900'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Orders & Spend */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Lifetime Spend</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <ShoppingBag size={16} />
            </div>
          </div>
          <div className="text-2xl font-black text-gray-900 mt-2">
            {formatCurrency(user.stats?.totalSpent || 0)}
          </div>
          <p className="text-[11px] text-gray-400 mt-0.5">
            {user.stats?.totalOrders || 0} total order{user.stats?.totalOrders === 1 ? '' : 's'} placed
          </p>
        </div>

        {/* User Referral Code */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Referral Code</span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <Gift size={16} />
            </div>
          </div>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-xl font-black font-mono text-primary tracking-wider">
              {user.referral_code}
            </span>
            <button
              type="button"
              onClick={copyCode}
              className="p-1 text-gray-400 hover:text-primary transition-colors cursor-pointer"
              title="Copy Referral Code"
            >
              {copiedCode ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
            </button>
          </div>
          <p className="text-[11px] text-gray-400 mt-0.5">
            {user.stats?.totalReferrals || 0} friend{user.stats?.totalReferrals === 1 ? '' : 's'} referred
          </p>
        </div>

        {/* Approved Referral Rewards */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Referrals Earned</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Award size={16} />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-600 mt-2">
            {formatCurrency(user.stats?.totalReferralsEarned || 0)}
          </div>
          <p className="text-[11px] text-emerald-700 font-medium mt-0.5">
            {user.stats?.completedReferrals || 0} completed & approved
          </p>
        </div>

        {/* Pending Referral Rewards */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Pending Rewards</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-500 flex items-center justify-center">
              <Clock size={16} />
            </div>
          </div>
          <div className="text-2xl font-black text-amber-600 mt-2">
            {formatCurrency(user.stats?.pendingReferralsEarned || 0)}
          </div>
          <p className="text-[11px] text-amber-700 font-medium mt-0.5">
            {user.stats?.pendingReferrals || 0} in progress / return period
          </p>
        </div>
      </div>

      {/* Interactive Tabs Bar */}
      <div className="bg-white p-1.5 rounded-2xl border border-gray-100 shadow-2xs flex items-center gap-1 overflow-x-auto">
        {[
          { id: 'overview', label: 'Overview & Profile', icon: Users },
          { id: 'referrals', label: `Referrals & Rewards (${user.referralsMade?.length || 0})`, icon: Gift },
          { id: 'orders', label: `Orders (${user.orders?.length || 0})`, icon: ShoppingBag },
          { id: 'addresses', label: `Addresses (${user.addresses?.length || 0})`, icon: MapPin },
        ].map((t) => {
          const Icon = t.icon;
          const isActive = activeTab === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setActiveTab(t.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                isActive
                  ? 'bg-primary text-white shadow-2xs'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <Icon size={14} />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: OVERVIEW & PROFILE EDIT */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Edit Profile Form */}
          <div className="lg:col-span-2 bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-2xs space-y-6">
            <div>
              <h2 className="text-base font-black text-gray-900">Edit User Details</h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Admin has full permission to manipulate user attributes, identity, and access levels.
              </p>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    required
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:border-primary focus:bg-white transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    value={editForm.email}
                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                    required
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:border-primary focus:bg-white transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={editForm.phone}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                    placeholder="+91..."
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:border-primary focus:bg-white transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Referral Code</label>
                  <input
                    type="text"
                    value={editForm.referral_code}
                    onChange={(e) => setEditForm({ ...editForm, referral_code: e.target.value.toUpperCase() })}
                    required
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 font-mono focus:outline-none focus:border-primary focus:bg-white transition-colors uppercase"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Account Role</label>
                  <select
                    value={editForm.role}
                    onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:border-primary focus:bg-white transition-colors capitalize"
                  >
                    <option value="customer">Customer / Shopper</option>
                    <option value="vendor">Brand / Vendor</option>
                    <option value="admin">Administrator</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Account Status</label>
                  <select
                    value={editForm.status}
                    onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:border-primary focus:bg-white transition-colors capitalize"
                  >
                    <option value="active">Active (Full Access)</option>
                    <option value="suspended">Suspended (Temporary Freeze)</option>
                    <option value="banned">Banned (Forbidden)</option>
                  </select>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={savingProfile}
                  className="px-5 py-2.5 bg-primary text-white text-xs font-bold rounded-xl hover:bg-primary/90 transition-all shadow-2xs cursor-pointer disabled:opacity-50"
                >
                  {savingProfile ? 'Saving Changes...' : 'Save Profile Changes'}
                </button>
              </div>
            </form>
          </div>

          {/* Side Security & Authentication Cards */}
          <div className="space-y-6">
            {/* Password Reset Card */}
            <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-2xs space-y-4">
              <div className="flex items-center gap-2">
                <Key size={16} className="text-primary" />
                <h3 className="text-sm font-black text-gray-900">Admin Password Override</h3>
              </div>
              <p className="text-xs text-gray-500">
                Directly set a new password for this user without requiring confirmation.
              </p>

              <form onSubmit={handleResetPassword} className="space-y-3">
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password..."
                  className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:border-primary focus:bg-white transition-colors"
                />
                <button
                  type="submit"
                  disabled={savingPassword || !newPassword}
                  className="w-full py-2 bg-gray-900 text-white text-xs font-bold rounded-xl hover:bg-black transition-all cursor-pointer disabled:opacity-50"
                >
                  {savingPassword ? 'Updating...' : 'Set Password'}
                </button>
              </form>
            </div>

            {/* Account Metadata Card */}
            <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-2xs space-y-3 text-xs">
              <h3 className="text-sm font-black text-gray-900">Account Telemetry</h3>
              <div className="space-y-2 text-gray-600">
                <div className="flex justify-between py-1 border-b border-gray-50">
                  <span className="text-gray-400">User ID</span>
                  <span className="font-mono text-[11px] truncate max-w-[160px]">{user.id}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-gray-50">
                  <span className="text-gray-400">Email Status</span>
                  <span className={user.email_confirmed ? 'text-emerald-600 font-bold' : 'text-amber-500 font-bold'}>
                    {user.email_confirmed ? 'Verified' : 'Unverified'}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-gray-50">
                  <span className="text-gray-400">Last Sign In</span>
                  <span>{user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleString('en-IN') : 'Never'}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-gray-400">Registered</span>
                  <span>{new Date(user.created_at).toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: REFERRALS & REWARDS MANAGEMENT (FULL MANIPULATION) */}
      {activeTab === 'referrals' && (
        <div className="space-y-6">
          {/* Who Referred This User + Action Bar */}
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Gift size={18} className="text-primary" />
                <h3 className="text-base font-black text-gray-900">Referrals & Reward Manipulation</h3>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Admin can manually assign referrals, approve pending rewards, override statuses, or credit bonus referral amounts.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setShowAssignReferralModal(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary text-white text-xs font-bold rounded-xl hover:bg-primary/90 transition-all shadow-2xs cursor-pointer"
              >
                <Plus size={14} />
                <span>Assign New Referral</span>
              </button>

              <button
                type="button"
                onClick={() => setShowCreditModal(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 text-white text-xs font-bold rounded-xl hover:bg-emerald-700 transition-all shadow-2xs cursor-pointer"
              >
                <DollarSign size={14} />
                <span>Credit Reward (₹)</span>
              </button>
            </div>
          </div>

          {/* Referred By Section */}
          <div className="bg-purple-50/50 rounded-2xl p-4 border border-purple-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
                @
              </div>
              <div>
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">
                  Referred To EveryJust By
                </span>
                {user.referredBy ? (
                  <span className="font-bold text-gray-900">
                    Code <span className="font-mono text-primary font-black">{user.referredBy.referrer_code}</span>
                    {user.referredBy.status === 'completed' && ' (Reward Completed)'}
                  </span>
                ) : (
                  <span className="text-gray-500">None (Direct user signup)</span>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowAssignReferrerModal(true)}
              className="px-3 py-1.5 bg-white text-purple-700 border border-purple-200 text-xs font-bold rounded-xl hover:bg-purple-100 transition-all shadow-2xs self-start sm:self-auto cursor-pointer"
            >
              {user.referredBy ? 'Change Referrer' : 'Assign Referrer Code'}
            </button>
          </div>

          {/* Referred Friends Table */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-2xs overflow-hidden">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-sm font-black text-gray-900">
                Friends Referred by {user.name} ({user.referralsMade?.length || 0})
              </h3>
              <span className="text-xs text-gray-400">
                Reward: ₹50 after order delivery + 3-day return period
              </span>
            </div>

            {user.referralsMade && user.referralsMade.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-gray-50/80 border-b border-gray-100 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                      <th className="py-3 px-4">Referred Friend</th>
                      <th className="py-3 px-4">Order Info</th>
                      <th className="py-3 px-4">Reward</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Timeline / Return Period</th>
                      <th className="py-3 px-4 text-right">Admin Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {user.referralsMade.map((ref: any) => {
                      const reward = ref.reward_amount || 50;

                      return (
                        <tr key={ref.id} className="hover:bg-gray-50/60 transition-colors">
                          {/* Friend Info */}
                          <td className="py-3.5 px-4">
                            <div className="font-bold text-gray-900">
                              {ref.referred_user_name || 'Friend'}
                            </div>
                            <div className="text-[11px] text-gray-400">
                              {ref.referred_user_email || 'No email registered'}
                            </div>
                            {ref.admin_note && (
                              <span className="text-[10px] text-purple-600 bg-purple-50 px-1.5 py-0.2 rounded mt-0.5 inline-block">
                                {ref.admin_note}
                              </span>
                            )}
                          </td>

                          {/* Order Details */}
                          <td className="py-3.5 px-4">
                            {ref.order_number ? (
                              <div>
                                <span className="font-mono text-gray-800 font-bold">
                                  {ref.order_number}
                                </span>
                                <div className="text-[11px] text-gray-500">
                                  {formatCurrency(ref.order_amount || 0)}
                                </div>
                              </div>
                            ) : (
                              <span className="text-gray-400">Awaiting purchase</span>
                            )}
                          </td>

                          {/* Reward Amount */}
                          <td className="py-3.5 px-4 font-black text-gray-900">
                            ₹{reward}
                          </td>

                          {/* Status Badge */}
                          <td className="py-3.5 px-4">
                            {ref.status === 'completed' || ref.paid_out ? (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                                <CheckCircle2 size={11} /> Completed & Paid
                              </span>
                            ) : ref.status === 'return_period' ? (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-purple-700 bg-purple-50 border border-purple-200 px-2 py-0.5 rounded-full">
                                <Clock size={11} /> 3-Day Return Period
                              </span>
                            ) : ref.status === 'order_placed' ? (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full">
                                <ShoppingBag size={11} /> Order Placed
                              </span>
                            ) : ref.status === 'cancelled' ? (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full">
                                <XCircle size={11} /> Cancelled
                              </span>
                            ) : ref.status === 'expired' ? (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-gray-600 bg-gray-100 px-2 py-0.5 rounded-full">
                                Expired (30d)
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                                <Clock size={11} /> Pending Order
                              </span>
                            )}
                          </td>

                          {/* Timeline / Return Period details */}
                          <td className="py-3.5 px-4 text-[11px] text-gray-500">
                            {ref.delivered_at && (
                              <div>Delivered: {new Date(ref.delivered_at).toLocaleDateString('en-IN')}</div>
                            )}
                            {ref.return_period_ends_at && ref.status === 'return_period' && (
                              <div className="text-purple-600 font-medium">
                                Window ends: {new Date(ref.return_period_ends_at).toLocaleDateString('en-IN')}
                              </div>
                            )}
                            {ref.completed_at && (
                              <div className="text-emerald-600">
                                Credited: {new Date(ref.completed_at).toLocaleDateString('en-IN')}
                              </div>
                            )}
                            {!ref.delivered_at && !ref.completed_at && (
                              <span>Expires: {new Date(ref.expires_at).toLocaleDateString('en-IN')}</span>
                            )}
                          </td>

                          {/* Action Buttons */}
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {/* 1-Click Approval Button if not already completed */}
                              {ref.status !== 'completed' && !ref.paid_out && (
                                <button
                                  type="button"
                                  onClick={() => handleApproveReferral(ref.id)}
                                  className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold rounded-lg transition-all shadow-2xs cursor-pointer"
                                  title="Approve referral immediately and payout ₹50"
                                >
                                  Approve & Payout
                                </button>
                              )}

                              {/* Override Status Dropdown */}
                              <select
                                value={ref.status}
                                onChange={(e) => handleChangeReferralStatus(ref.id, e.target.value)}
                                className="px-2 py-1 bg-gray-50 border border-gray-200 rounded-lg text-[11px] text-gray-700 font-medium focus:outline-none cursor-pointer"
                              >
                                <option value="pending">Set Pending</option>
                                <option value="order_placed">Set Order Placed</option>
                                <option value="return_period">Set In Return Period</option>
                                <option value="completed">Set Completed</option>
                                <option value="cancelled">Set Cancelled</option>
                                <option value="expired">Set Expired</option>
                              </select>

                              {/* Delete button */}
                              <button
                                type="button"
                                onClick={() => handleDeleteReferral(ref.id)}
                                className="p-1 text-gray-400 hover:text-rose-600 transition-colors cursor-pointer"
                                title="Delete Referral Record"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-12 text-center space-y-2">
                <Gift className="w-8 h-8 text-gray-300 mx-auto" />
                <p className="text-xs font-bold text-gray-800">No referrals recorded yet</p>
                <p className="text-[11px] text-gray-400">
                  Use the &quot;Assign New Referral&quot; button above to manually assign or credit referrals.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: ORDERS HISTORY */}
      {activeTab === 'orders' && (
        <div className="bg-white rounded-3xl border border-gray-100 shadow-2xs overflow-hidden">
          <div className="p-5 border-b border-gray-100 flex items-center justify-between">
            <h3 className="text-sm font-black text-gray-900">
              Orders History ({user.orders?.length || 0})
            </h3>
            <span className="text-xs text-gray-400">
              Total lifetime purchases: {formatCurrency(user.stats?.totalSpent || 0)}
            </span>
          </div>

          {user.orders && user.orders.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-gray-50/80 border-b border-gray-100 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                    <th className="py-3 px-4">Order #</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Items</th>
                    <th className="py-3 px-4">Payment</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Total</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {user.orders.map((order: any) => {
                    const dateStr = new Date(order.created_at).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    });

                    return (
                      <tr key={order.id} className="hover:bg-gray-50/60 transition-colors">
                        <td className="py-3.5 px-4 font-mono font-bold text-gray-900">
                          {order.order_number}
                        </td>
                        <td className="py-3.5 px-4 text-gray-500 text-[11px]">{dateStr}</td>
                        <td className="py-3.5 px-4 text-gray-600">
                          {order.order_items?.length || 1} item{order.order_items?.length === 1 ? '' : 's'}
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md ${
                              order.payment_status === 'paid'
                                ? 'bg-emerald-50 text-emerald-700'
                                : 'bg-amber-50 text-amber-700'
                            }`}
                          >
                            {order.payment_method || 'UPI'} • {order.payment_status || 'Paid'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                              order.status === 'delivered'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : order.status === 'cancelled'
                                ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                : 'bg-blue-50 text-blue-700 border border-blue-200'
                            }`}
                          >
                            {order.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right font-black text-gray-900">
                          {formatCurrency(order.total_amount)}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <Link
                            href={`/admin/orders/${order.id}`}
                            className="inline-flex items-center gap-1 text-[11px] font-bold text-primary hover:underline cursor-pointer"
                          >
                            <span>View</span>
                            <ExternalLink size={11} />
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-12 text-center space-y-2">
              <ShoppingBag className="w-8 h-8 text-gray-300 mx-auto" />
              <p className="text-xs font-bold text-gray-800">No orders placed yet</p>
              <p className="text-[11px] text-gray-400">This user hasn&apos;t made any purchases so far.</p>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: ADDRESSES */}
      {activeTab === 'addresses' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-black text-gray-900">Saved Delivery Addresses</h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Delivery destinations configured for this customer account.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowAddressModal(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-primary text-white text-xs font-bold rounded-xl hover:bg-primary/90 transition-all shadow-2xs cursor-pointer"
            >
              <Plus size={14} />
              <span>Add New Address</span>
            </button>
          </div>

          {user.addresses && user.addresses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {user.addresses.map((addr: any, idx: number) => (
                <div
                  key={addr.id || idx}
                  className={`bg-white rounded-2xl p-5 border transition-all ${
                    addr.isDefault
                      ? 'border-primary ring-2 ring-primary/10 shadow-sm'
                      : 'border-gray-100 shadow-2xs'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-gray-100 text-gray-700">
                      {addr.addressType || 'Home'}
                    </span>
                    {addr.isDefault && (
                      <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                        Default
                      </span>
                    )}
                  </div>

                  <p className="font-bold text-xs text-gray-900">{addr.fullName || user.name}</p>
                  <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                    {addr.street}, {addr.city}, {addr.state} - <span className="font-mono font-bold">{addr.pincode}</span>
                  </p>
                  {addr.phone && (
                    <p className="text-[11px] text-gray-500 mt-2 font-mono flex items-center gap-1">
                      <Phone size={11} className="text-gray-400" />
                      {addr.phone}
                    </p>
                  )}

                  <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
                    {!addr.isDefault ? (
                      <button
                        type="button"
                        onClick={() => handleSetDefaultAddress(addr.id)}
                        className="text-primary font-bold hover:underline cursor-pointer text-[11px]"
                      >
                        Set as Default
                      </button>
                    ) : (
                      <span className="text-[11px] text-emerald-600 font-bold">Primary</span>
                    )}

                    <button
                      type="button"
                      onClick={() => handleDeleteAddress(addr.id)}
                      className="p-1 text-gray-400 hover:text-rose-600 transition-colors cursor-pointer"
                      title="Delete Address"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 shadow-2xs space-y-2">
              <MapPin className="w-8 h-8 text-gray-300 mx-auto" />
              <p className="text-xs font-bold text-gray-800">No addresses on file</p>
              <p className="text-[11px] text-gray-400">Click &quot;Add New Address&quot; above to create one.</p>
            </div>
          )}
        </div>
      )}

      {/* MODAL: ASSIGN REFERRAL TO USER */}
      {showAssignReferralModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto"
          onClick={() => setShowAssignReferralModal(false)}
        >
          <div
            className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-gray-100 overflow-hidden my-auto p-6 space-y-5 animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div>
                <h3 className="text-base font-black text-gray-900">Assign Referral to {user.name}</h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Manually link a friend or order to this user&apos;s referral account.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowAssignReferralModal(false)}
                className="text-gray-400 hover:text-gray-700 cursor-pointer p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAssignReferral} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Referred Friend Name</label>
                  <input
                    type="text"
                    value={assignForm.referred_name}
                    onChange={(e) => setAssignForm({ ...assignForm, referred_name: e.target.value })}
                    required
                    placeholder="e.g. Rahul Sharma"
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Friend Email</label>
                  <input
                    type="email"
                    value={assignForm.referred_email}
                    onChange={(e) => setAssignForm({ ...assignForm, referred_email: e.target.value })}
                    placeholder="rahul@example.com"
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Initial Status</label>
                  <select
                    value={assignForm.status}
                    onChange={(e) => setAssignForm({ ...assignForm, status: e.target.value as any })}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:border-primary"
                  >
                    <option value="completed">Completed & Paid (Immediate ₹50 Credit)</option>
                    <option value="return_period">In 3-Day Return Period</option>
                    <option value="order_placed">Order Placed (Awaiting Delivery)</option>
                    <option value="pending">Pending (Awaiting Purchase)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Reward Amount (₹)</label>
                  <input
                    type="number"
                    value={assignForm.reward_amount}
                    onChange={(e) => setAssignForm({ ...assignForm, reward_amount: e.target.value })}
                    required
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Order Number (Optional)</label>
                  <input
                    type="text"
                    value={assignForm.order_number}
                    onChange={(e) => setAssignForm({ ...assignForm, order_number: e.target.value })}
                    placeholder="e.g. ORD-109283"
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Order Amount (₹)</label>
                  <input
                    type="number"
                    value={assignForm.order_amount}
                    onChange={(e) => setAssignForm({ ...assignForm, order_amount: e.target.value })}
                    placeholder="150"
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Admin Note</label>
                <input
                  type="text"
                  value={assignForm.note}
                  onChange={(e) => setAssignForm({ ...assignForm, note: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:border-primary"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowAssignReferralModal(false)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-xs font-bold text-gray-700 rounded-xl transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingAssign}
                  className="px-5 py-2 bg-primary text-white text-xs font-bold rounded-xl hover:bg-primary/90 transition-all shadow-2xs cursor-pointer disabled:opacity-50"
                >
                  {submittingAssign ? 'Assigning...' : 'Assign Referral'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: INSTANT CREDIT REWARD */}
      {showCreditModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto"
          onClick={() => setShowCreditModal(false)}
        >
          <div
            className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-gray-100 p-6 space-y-4 animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-base font-black text-gray-900">Direct Credit Referral Reward</h3>
              <button
                type="button"
                onClick={() => setShowCreditModal(false)}
                className="text-gray-400 hover:text-gray-700 cursor-pointer p-1"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-gray-500">
              Immediately credits reward money to {user.name}&apos;s account balance without needing an order.
            </p>

            <form onSubmit={handleCreditReward} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Credit Amount (₹)</label>
                <input
                  type="number"
                  value={creditAmount}
                  onChange={(e) => setCreditAmount(e.target.value)}
                  required
                  min="1"
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-black text-gray-900 focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Credit Reason / Note</label>
                <input
                  type="text"
                  value={creditNote}
                  onChange={(e) => setCreditNote(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:border-primary"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreditModal(false)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-xs font-bold text-gray-700 rounded-xl transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingCredit}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all shadow-2xs cursor-pointer disabled:opacity-50"
                >
                  {submittingCredit ? 'Crediting...' : `Credit ₹${creditAmount}`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ASSIGN REFERRER CODE */}
      {showAssignReferrerModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto"
          onClick={() => setShowAssignReferrerModal(false)}
        >
          <div
            className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-gray-100 p-6 space-y-4 animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-base font-black text-gray-900">Set Who Referred {user.name}</h3>
              <button
                type="button"
                onClick={() => setShowAssignReferrerModal(false)}
                className="text-gray-400 hover:text-gray-700 cursor-pointer p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSetReferrer} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Referrer Code</label>
                <input
                  type="text"
                  value={referrerCodeInput}
                  onChange={(e) => setReferrerCodeInput(e.target.value.toUpperCase())}
                  required
                  placeholder="e.g. EJABCD12"
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-mono font-black text-gray-900 uppercase focus:outline-none focus:border-primary"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAssignReferrerModal(false)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-xs font-bold text-gray-700 rounded-xl transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingReferrerCode || !referrerCodeInput}
                  className="px-5 py-2 bg-primary hover:bg-primary/90 text-white text-xs font-bold rounded-xl transition-all shadow-2xs cursor-pointer disabled:opacity-50"
                >
                  {submittingReferrerCode ? 'Linking...' : 'Link Referrer Code'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD ADDRESS */}
      {showAddressModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto"
          onClick={() => setShowAddressModal(false)}
        >
          <div
            className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-gray-100 p-6 space-y-4 animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-base font-black text-gray-900">Add Address for {user.name}</h3>
              <button
                type="button"
                onClick={() => setShowAddressModal(false)}
                className="text-gray-400 hover:text-gray-700 cursor-pointer p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddAddress} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    value={addressForm.fullName}
                    onChange={(e) => setAddressForm({ ...addressForm, fullName: e.target.value })}
                    placeholder={user.name}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={addressForm.phone}
                    onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })}
                    placeholder={user.phone}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Street Address</label>
                <input
                  type="text"
                  value={addressForm.street}
                  onChange={(e) => setAddressForm({ ...addressForm, street: e.target.value })}
                  required
                  placeholder="House/Flat No, Street, Area"
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:border-primary"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">City</label>
                  <input
                    type="text"
                    value={addressForm.city}
                    onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                    required
                    placeholder="City"
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">State</label>
                  <input
                    type="text"
                    value={addressForm.state}
                    onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                    required
                    placeholder="Kerala"
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Pincode</label>
                  <input
                    type="text"
                    value={addressForm.pincode}
                    onChange={(e) => setAddressForm({ ...addressForm, pincode: e.target.value })}
                    required
                    placeholder="682001"
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div className="flex items-center gap-4 pt-2">
                <label className="flex items-center gap-2 cursor-pointer text-xs text-gray-700 font-bold">
                  <input
                    type="checkbox"
                    checked={addressForm.isDefault}
                    onChange={(e) => setAddressForm({ ...addressForm, isDefault: e.target.checked })}
                    className="rounded text-primary focus:ring-primary"
                  />
                  <span>Set as Default Address</span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowAddressModal(false)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-xs font-bold text-gray-700 rounded-xl transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingAddress}
                  className="px-5 py-2 bg-primary text-white text-xs font-bold rounded-xl hover:bg-primary/90 transition-all shadow-2xs cursor-pointer disabled:opacity-50"
                >
                  {savingAddress ? 'Saving...' : 'Save Address'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
