'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Users,
  Search,
  Plus,
  RefreshCw,
  ShoppingBag,
  Gift,
  Award,
  ShieldCheck,
  ChevronRight,
  ExternalLink,
  Mail,
  Phone,
  Calendar,
  CheckCircle2,
  Clock,
  MapPin,
  Star,
  Copy,
  Check,
  AlertCircle,
  MoreVertical,
  X,
  UserCheck,
} from 'lucide-react';
import { formatCurrency } from '@/utils/currency';
import toast from 'react-hot-toast';

interface UserRecord {
  id: string;
  user_id?: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string | null;
  role: string;
  status: string;
  referral_code: string;
  created_at: string;
  orders: any[];
  orders_count: number;
  total_spent: number;
  addresses: any[];
  referrals_count: number;
  referrals_earned: number;
  referrals_pending: number;
  is_registered: boolean;
  email_confirmed?: boolean;
}

export default function UsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'customer' | 'admin' | 'vendor'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'suspended' | 'banned'>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | 'registered' | 'buyers'>('all');

  // Stats
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalRegistered: 0,
    totalBuyers: 0,
    totalPlatformSpent: 0,
    totalReferralRewardsEarned: 0,
  });

  // Create User Modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState({
    email: '',
    name: '',
    phone: '',
    password: '',
    role: 'customer',
    status: 'active',
    customReferralCode: '',
  });
  const [creatingUser, setCreatingUser] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/users');
      const data = await res.json();
      if (data.success) {
        setUsers(data.users || []);
        if (data.stats) setStats(data.stats);
      } else {
        toast.error(data.error || 'Failed to load users');
      }
    } catch {
      toast.error('Network error loading users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Filtered Users List
  const filteredUsers = users.filter((u) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      u.name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.phone.includes(q) ||
      (u.referral_code && u.referral_code.toLowerCase().includes(q));

    if (!matchesSearch) return false;

    if (roleFilter !== 'all' && u.role?.toLowerCase() !== roleFilter) return false;
    if (statusFilter !== 'all' && u.status?.toLowerCase() !== statusFilter) return false;
    if (typeFilter === 'registered' && !u.is_registered) return false;
    if (typeFilter === 'buyers' && u.orders_count === 0) return false;

    return true;
  });

  // Handle Quick Create User
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createForm.email) {
      toast.error('Email is required');
      return;
    }
    setCreatingUser(true);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(createForm),
      });
      const data = await res.json();
      if (data.success) {
        toast.success('User account created successfully!');
        setShowCreateModal(false);
        setCreateForm({
          email: '',
          name: '',
          phone: '',
          password: '',
          role: 'customer',
          status: 'active',
          customReferralCode: '',
        });
        fetchUsers();
      } else {
        toast.error(data.error || 'Failed to create user');
      }
    } catch {
      toast.error('Network error creating user');
    } finally {
      setCreatingUser(false);
    }
  };

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

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">
            User & Customer Management
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Full administrative control over user accounts, roles, addresses, order records, and referral reward approvals.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={fetchUsers}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-gray-50 border border-gray-200 text-xs font-bold text-gray-700 rounded-xl transition-all shadow-2xs cursor-pointer"
          >
            <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>

          <button
            type="button"
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary hover:bg-primary/90 text-white text-xs font-bold rounded-xl transition-all shadow-2xs cursor-pointer"
          >
            <Plus size={14} />
            <span>Add New User</span>
          </button>
        </div>
      </div>

      {/* KPI Metrics Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Total Users</span>
            <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <Users size={16} />
            </div>
          </div>
          <div className="text-2xl font-black text-gray-900 mt-2">{stats.totalUsers}</div>
          <p className="text-[11px] text-gray-400 mt-0.5">
            {stats.totalRegistered} registered auth members
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Active Buyers</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <ShoppingBag size={16} />
            </div>
          </div>
          <div className="text-2xl font-black text-gray-900 mt-2">{stats.totalBuyers}</div>
          <p className="text-[11px] text-emerald-600 font-medium mt-0.5">
            {stats.totalUsers > 0 ? Math.round((stats.totalBuyers / stats.totalUsers) * 100) : 0}% purchase conversion
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Customer Revenue</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <ShieldCheck size={16} />
            </div>
          </div>
          <div className="text-2xl font-black text-gray-900 mt-2">
            {formatCurrency(stats.totalPlatformSpent)}
          </div>
          <p className="text-[11px] text-gray-400 mt-0.5">Total lifetime sales revenue</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Referral Payouts</span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <Award size={16} />
            </div>
          </div>
          <div className="text-2xl font-black text-purple-600 mt-2">
            {formatCurrency(stats.totalReferralRewardsEarned)}
          </div>
          <p className="text-[11px] text-purple-700 font-medium mt-0.5">Approved referral money</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-3.5 rounded-2xl border border-gray-100 shadow-2xs space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Main filter pills */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {[
              { id: 'all', label: `All (${users.length})` },
              { id: 'buyers', label: `Buyers (${stats.totalBuyers})` },
              { id: 'registered', label: `Registered (${stats.totalRegistered})` },
            ].map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTypeFilter(t.id as any)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  typeFilter === t.id
                    ? 'bg-primary text-white shadow-2xs'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {t.label}
              </button>
            ))}

            <div className="h-4 w-px bg-gray-200 mx-1 hidden sm:block"></div>

            {/* Role dropdown filter */}
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value as any)}
              className="px-2.5 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-700 font-bold focus:outline-none cursor-pointer"
            >
              <option value="all">Role: All Roles</option>
              <option value="customer">Role: Customers</option>
              <option value="vendor">Role: Vendors</option>
              <option value="admin">Role: Admins</option>
            </select>

            {/* Status dropdown filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-2.5 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-700 font-bold focus:outline-none cursor-pointer"
            >
              <option value="all">Status: All</option>
              <option value="active">Status: Active</option>
              <option value="suspended">Status: Suspended</option>
              <option value="banned">Status: Banned</option>
            </select>
          </div>

          {/* Search Input */}
          <div className="relative flex-1 max-w-xs min-w-[220px]">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, email, phone, code..."
              className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-primary focus:bg-white transition-colors"
            />
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-2xs overflow-hidden">
        {loading ? (
          <div className="p-16 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-3 border-primary border-t-transparent mx-auto"></div>
            <p className="text-xs font-bold text-gray-600 mt-3">Loading users database...</p>
          </div>
        ) : filteredUsers.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/80 border-b border-gray-100 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">Contact</th>
                  <th className="py-3 px-4">Role & Status</th>
                  <th className="py-3 px-4">Referral Code</th>
                  <th className="py-3 px-4 text-center">Orders</th>
                  <th className="py-3 px-4 text-right">Total Spent</th>
                  <th className="py-3 px-4 text-center">Referrals Earned</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-xs">
                {filteredUsers.map((u) => {
                  const dateStr = new Date(u.created_at).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  });

                  return (
                    <tr
                      key={u.id}
                      onClick={() => router.push(`/admin/users/${u.id}`)}
                      className="hover:bg-gray-50/70 transition-colors group cursor-pointer"
                    >
                      {/* User Info */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-primary to-purple-600 text-white font-bold flex items-center justify-center text-xs flex-shrink-0 shadow-2xs">
                            {u.avatar ? (
                              <img
                                src={u.avatar}
                                alt={u.name}
                                className="w-full h-full rounded-full object-cover"
                              />
                            ) : (
                              u.name.charAt(0).toUpperCase()
                            )}
                          </div>
                          <div>
                            <div className="font-bold text-gray-900 group-hover:text-primary transition-colors flex items-center gap-1.5">
                              <span>{u.name}</span>
                              {u.is_registered ? (
                                <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.2 rounded-md">
                                  Member
                                </span>
                              ) : (
                                <span className="text-[9px] font-bold text-gray-500 bg-gray-100 px-1.5 py-0.2 rounded-md">
                                  Guest
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] text-gray-400">Joined {dateStr}</span>
                          </div>
                        </div>
                      </td>

                      {/* Contact */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-0.5">
                          <p className="text-gray-800 font-medium truncate max-w-[170px]">
                            {u.email || '—'}
                          </p>
                          <p className="text-gray-400 font-mono text-[11px]">
                            {u.phone || '—'}
                          </p>
                        </div>
                      </td>

                      {/* Role & Status */}
                      <td className="py-3.5 px-4">
                        <div className="flex flex-col gap-1 items-start">
                          <span
                            className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.2 rounded-md border ${
                              roleBadgeColors[u.role?.toLowerCase()] || roleBadgeColors.customer
                            }`}
                          >
                            {u.role || 'Customer'}
                          </span>
                          <span
                            className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.2 rounded-md border ${
                              statusBadgeColors[u.status?.toLowerCase()] || statusBadgeColors.active
                            }`}
                          >
                            {u.status || 'Active'}
                          </span>
                        </div>
                      </td>

                      {/* Referral Code */}
                      <td className="py-3.5 px-4">
                        <span className="font-mono text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-lg">
                          {u.referral_code}
                        </span>
                        <div className="text-[10px] text-gray-400 mt-0.5">
                          {u.referrals_count} referred
                        </div>
                      </td>

                      {/* Orders */}
                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold ${
                            u.orders_count > 0
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-gray-100 text-gray-500'
                          }`}
                        >
                          {u.orders_count}
                        </span>
                      </td>

                      {/* Total Spent */}
                      <td className="py-3.5 px-4 text-right font-black text-gray-900">
                        {formatCurrency(u.total_spent)}
                      </td>

                      {/* Referrals Earned */}
                      <td className="py-3.5 px-4 text-center">
                        <div className="font-black text-emerald-600">
                          {formatCurrency(u.referrals_earned)}
                        </div>
                        {u.referrals_pending > 0 && (
                          <div className="text-[10px] text-amber-600 font-medium">
                            +{formatCurrency(u.referrals_pending)} pending
                          </div>
                        )}
                      </td>

                      {/* Action */}
                      <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <Link
                          href={`/admin/users/${u.id}`}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-gray-200 text-gray-700 hover:text-primary hover:border-primary/40 text-xs font-bold transition-all shadow-2xs cursor-pointer"
                        >
                          <span>Manage</span>
                          <ChevronRight size={13} />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-16 text-center space-y-2">
            <Users className="w-10 h-10 text-gray-300 mx-auto" />
            <p className="text-sm font-bold text-gray-800">No users found</p>
            <p className="text-xs text-gray-400">Try adjusting your filters or search keywords.</p>
          </div>
        )}
      </div>

      {/* CREATE NEW USER MODAL */}
      {showCreateModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto"
          onClick={() => setShowCreateModal(false)}
        >
          <div
            className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-gray-100 p-6 space-y-4 animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <h3 className="text-base font-black text-gray-900">Create New User Account</h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Directly provision an account with credentials and role privileges.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-gray-700 cursor-pointer p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    value={createForm.email}
                    onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                    required
                    placeholder="user@example.com"
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    value={createForm.name}
                    onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                    required
                    placeholder="User Name"
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Password</label>
                  <input
                    type="password"
                    value={createForm.password}
                    onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                    required
                    placeholder="Min 6 characters"
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={createForm.phone}
                    onChange={(e) => setCreateForm({ ...createForm, phone: e.target.value })}
                    placeholder="+91..."
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Role</label>
                  <select
                    value={createForm.role}
                    onChange={(e) => setCreateForm({ ...createForm, role: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:border-primary"
                  >
                    <option value="customer">Customer</option>
                    <option value="vendor">Vendor / Brand</option>
                    <option value="admin">Administrator</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Custom Referral Code (Optional)</label>
                  <input
                    type="text"
                    value={createForm.customReferralCode}
                    onChange={(e) => setCreateForm({ ...createForm, customReferralCode: e.target.value.toUpperCase() })}
                    placeholder="Auto-generated if blank"
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 font-mono uppercase focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-xs font-bold text-gray-700 rounded-xl transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creatingUser}
                  className="px-5 py-2 bg-primary text-white text-xs font-bold rounded-xl hover:bg-primary/90 transition-all shadow-2xs cursor-pointer disabled:opacity-50"
                >
                  {creatingUser ? 'Creating...' : 'Create Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
