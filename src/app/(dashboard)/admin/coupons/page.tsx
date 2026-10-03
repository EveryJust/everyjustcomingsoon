'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { Coupon, getAdminCoupons } from '@/utils/supabase/adminData';
import { formatCurrency } from '@/utils/currency';
import { 
  Ticket, 
  Plus, 
  Search, 
  Filter, 
  RefreshCw, 
  Edit3, 
  Trash2, 
  Power, 
  Check, 
  Copy, 
  X, 
  Percent, 
  DollarSign, 
  AlertCircle,
  Calendar,
  Layers,
  ArrowRight,
  Loader2,
  CheckCircle2
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'active' | 'inactive' | 'percentage' | 'fixed'>('all');
  const [mounted, setMounted] = useState(false);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [modalSubmitting, setModalSubmitting] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Prevent background scroll and handle ESC key when modal is open
  useEffect(() => {
    if (isModalOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          setIsModalOpen(false);
        }
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        document.body.style.overflow = originalOverflow || 'unset';
        window.removeEventListener('keydown', handleKeyDown);
      };
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isModalOpen]);

  // Form Fields
  const [formCode, setFormCode] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formDiscountType, setFormDiscountType] = useState<'percentage' | 'fixed'>('fixed');
  const [formDiscountValue, setFormDiscountValue] = useState<number | string>('');
  const [formMinOrder, setFormMinOrder] = useState<number | string>('');
  const [formMaxDiscount, setFormMaxDiscount] = useState<number | string>('');
  const [formUsageLimit, setFormUsageLimit] = useState<number | string>('');
  const [formEndDate, setFormEndDate] = useState('');
  const [formIsActive, setFormIsActive] = useState(true);

  // Load coupons
  const fetchCoupons = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/coupons');
      const data = await res.json();
      if (res.ok && data.success) {
        setCoupons(data.coupons || []);
      } else {
        // Fallback to helper
        const fallback = await getAdminCoupons();
        setCoupons(fallback.coupons || []);
      }
    } catch {
      const fallback = await getAdminCoupons();
      setCoupons(fallback.coupons || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  // Filtered coupons
  const filteredCoupons = useMemo(() => {
    return coupons.filter((c) => {
      const q = searchTerm.toLowerCase().trim();
      const matchesSearch = 
        !q ||
        c.code.toLowerCase().includes(q) ||
        (c.description && c.description.toLowerCase().includes(q));

      if (!matchesSearch) return false;

      if (typeFilter === 'active') return c.is_active;
      if (typeFilter === 'inactive') return !c.is_active;
      if (typeFilter === 'percentage') return c.discount_type === 'percentage';
      if (typeFilter === 'fixed') return c.discount_type === 'fixed';
      return true;
    });
  }, [coupons, searchTerm, typeFilter]);

  // Open Create Modal
  const openCreateModal = () => {
    setEditingCoupon(null);
    setFormCode('');
    setFormDescription('');
    setFormDiscountType('fixed');
    setFormDiscountValue('');
    setFormMinOrder('');
    setFormMaxDiscount('');
    setFormUsageLimit('');
    setFormEndDate('');
    setFormIsActive(true);
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const openEditModal = (coupon: Coupon) => {
    setEditingCoupon(coupon);
    setFormCode(coupon.code);
    setFormDescription(coupon.description || '');
    setFormDiscountType(coupon.discount_type);
    setFormDiscountValue(coupon.discount_value);
    setFormMinOrder(coupon.min_order_amount || '');
    setFormMaxDiscount(coupon.max_discount_amount || '');
    setFormUsageLimit(coupon.usage_limit || '');
    setFormEndDate(coupon.end_date ? new Date(coupon.end_date).toISOString().split('T')[0] : '');
    setFormIsActive(coupon.is_active);
    setIsModalOpen(true);
  };

  // Toggle Active / Deactivate
  const handleToggleActive = async (coupon: Coupon) => {
    const updatedStatus = !coupon.is_active;
    try {
      const res = await fetch(`/api/admin/coupons/${coupon.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: updatedStatus })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to update coupon status');
      }

      setCoupons((prev) =>
        prev.map((c) => (c.id === coupon.id ? { ...c, is_active: updatedStatus } : c))
      );
      toast.success(`Coupon '${coupon.code}' ${updatedStatus ? 'Activated' : 'Deactivated'}`);
    } catch (err: any) {
      toast.error(err.message || 'Error updating status');
    }
  };

  // Delete Coupon
  const handleDeleteCoupon = async (coupon: Coupon) => {
    if (!window.confirm(`Are you sure you want to delete coupon '${coupon.code}'?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/coupons/${coupon.id}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to delete coupon');
      }

      setCoupons((prev) => prev.filter((c) => c.id !== coupon.id));
      toast.success(`Coupon '${coupon.code}' deleted successfully`);
    } catch (err: any) {
      toast.error(err.message || 'Error deleting coupon');
    }
  };

  // Form Submit (Create or Update)
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formCode.trim()) {
      toast.error('Coupon code is required');
      return;
    }

    if (!formDiscountValue || Number(formDiscountValue) <= 0) {
      toast.error('Discount value must be greater than 0');
      return;
    }

    if (formDiscountType === 'percentage' && Number(formDiscountValue) > 100) {
      toast.error('Percentage discount cannot exceed 100%');
      return;
    }

    setModalSubmitting(true);

    const payload = {
      code: formCode.trim().toUpperCase(),
      description: formDescription.trim(),
      discount_type: formDiscountType,
      discount_value: Number(formDiscountValue),
      min_order_amount: formMinOrder ? Number(formMinOrder) : 0,
      max_discount_amount: formDiscountType === 'percentage' && formMaxDiscount ? Number(formMaxDiscount) : null,
      usage_limit: formUsageLimit ? Number(formUsageLimit) : null,
      end_date: formEndDate ? new Date(formEndDate).toISOString() : null,
      is_active: formIsActive
    };

    try {
      if (editingCoupon) {
        // Update
        const res = await fetch(`/api/admin/coupons/${editingCoupon.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.error || 'Failed to update coupon');
        }

        setCoupons((prev) =>
          prev.map((c) => (c.id === editingCoupon.id ? data.coupon : c))
        );
        toast.success(`Coupon '${payload.code}' updated successfully!`);
      } else {
        // Create
        const res = await fetch('/api/admin/coupons', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.error || 'Failed to create coupon');
        }

        setCoupons((prev) => [data.coupon, ...prev]);
        toast.success(`Coupon '${payload.code}' created successfully!`);
      }

      setIsModalOpen(false);
    } catch (err: any) {
      toast.error(err.message || 'Error saving coupon');
    } finally {
      setModalSubmitting(false);
    }
  };

  // Copy code to clipboard
  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success(`Copied '${code}' to clipboard!`);
  };

  // Stats calculation
  const stats = useMemo(() => {
    const total = coupons.length;
    const active = coupons.filter((c) => c.is_active).length;
    const totalUses = coupons.reduce((sum, c) => sum + (c.usage_count || 0), 0);
    return { total, active, totalUses };
  }, [coupons]);

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-20">
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#6A43FB]/10 text-[#6A43FB] flex items-center justify-center font-bold">
              <Ticket size={20} />
            </div>
            <div>
              <h1 className="text-2xl font-black text-gray-900 tracking-tight">Coupon Management</h1>
              <p className="text-xs text-gray-400 mt-0.5">
                Create, configure, and manage store discount promo codes.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={fetchCoupons}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 hover:border-gray-300 text-gray-700 text-xs font-bold hover:bg-gray-50 transition-all cursor-pointer disabled:opacity-50"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>

          <button
            type="button"
            onClick={openCreateModal}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#6A43FB] hover:bg-[#5926EC] text-white text-xs font-extrabold shadow-sm shadow-[#6A43FB]/30 transition-all cursor-pointer"
          >
            <Plus size={16} />
            <span>Create Coupon</span>
          </button>
        </div>
      </div>

      {/* Stats Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">Total Coupons</span>
            <span className="text-2xl font-black text-gray-900">{stats.total}</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-[#6A43FB]/10 text-[#6A43FB] flex items-center justify-center">
            <Ticket size={22} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">Active Promo Codes</span>
            <span className="text-2xl font-black text-emerald-600">{stats.active}</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 size={22} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">Total Times Used</span>
            <span className="text-2xl font-black text-[#6A43FB]">{stats.totalUses}</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-purple-50 text-[#6A43FB] flex items-center justify-center">
            <Layers size={22} />
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] space-y-4">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {[
            { id: 'all', label: 'All Coupons' },
            { id: 'active', label: 'Active Only' },
            { id: 'inactive', label: 'Deactivated' },
            { id: 'percentage', label: 'Percentage (%)' },
            { id: 'fixed', label: 'Fixed Price (₹)' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setTypeFilter(tab.id as any)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                typeFilter === tab.id
                  ? 'bg-[#6A43FB] text-white shadow-sm shadow-[#6A43FB]/30'
                  : 'bg-gray-50 text-gray-600 hover:bg-gray-100 hover:text-gray-900 border border-gray-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search coupons by code or description..."
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#6A43FB] focus:bg-white transition-all font-medium"
          />
        </div>
      </div>

      {/* Coupons List Cards */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-3xl p-6 border border-gray-100 animate-pulse space-y-4 shadow-sm">
              <div className="h-6 bg-gray-200 rounded-full w-28" />
              <div className="h-4 bg-gray-100 rounded w-40" />
              <div className="h-16 bg-gray-50 rounded-2xl" />
            </div>
          ))}
        </div>
      ) : filteredCoupons.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
          <div className="w-16 h-16 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center mx-auto mb-4">
            <Ticket size={28} />
          </div>
          <h3 className="text-base font-bold text-gray-900 mb-1">No Coupons Found</h3>
          <p className="text-xs text-gray-400 max-w-sm mx-auto mb-4">
            {searchTerm
              ? 'No coupons match your search query.'
              : 'You have not added any coupons yet. Click "Create Coupon" to add your first offer code.'}
          </p>
          <button
            type="button"
            onClick={openCreateModal}
            className="px-5 py-2.5 bg-[#6A43FB] text-white text-xs font-bold rounded-xl shadow-sm hover:bg-[#5926EC] transition-colors"
          >
            Create Your First Coupon
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCoupons.map((coupon) => {
            const isPercentage = coupon.discount_type === 'percentage';

            return (
              <div
                key={coupon.id}
                className={`bg-white rounded-3xl p-6 border transition-all flex flex-col justify-between shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_12px_36px_rgb(106,67,251,0.08)] ${
                  coupon.is_active ? 'border-gray-100 hover:border-[#6A43FB]/30' : 'border-gray-200/60 opacity-75 bg-gray-50/50'
                }`}
              >
                <div>
                  {/* Top: Code & Active Status */}
                  <div className="flex items-start justify-between gap-3 pb-3 border-b border-gray-100">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-black text-gray-950 px-3 py-1 rounded-xl bg-gray-100 border border-gray-200 tracking-wider">
                        {coupon.code}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopyCode(coupon.code)}
                        className="p-1.5 text-gray-400 hover:text-gray-700 transition-colors rounded-lg hover:bg-gray-100"
                        title="Copy Coupon Code"
                      >
                        <Copy size={13} />
                      </button>
                    </div>

                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      coupon.is_active 
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                        : 'bg-rose-50 text-rose-700 border border-rose-200'
                    }`}>
                      {coupon.is_active ? 'ACTIVE' : 'DEACTIVATED'}
                    </span>
                  </div>

                  {/* Discount Big Display */}
                  <div className="py-4">
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-3xl font-black text-[#6A43FB]">
                        {isPercentage ? `${coupon.discount_value}%` : `₹${coupon.discount_value}`}
                      </span>
                      <span className="text-xs font-bold text-gray-500 uppercase tracking-tight">
                        {isPercentage ? 'OFF' : 'FLAT DISCOUNT'}
                      </span>
                    </div>

                    <p className="text-xs text-gray-600 font-medium mt-1">
                      {coupon.description || 'Promotional coupon code for customers'}
                    </p>
                  </div>

                  {/* Conditions Details Box */}
                  <div className="bg-gray-50 rounded-2xl p-3.5 space-y-2 text-xs border border-gray-100">
                    <div className="flex justify-between items-center text-gray-600">
                      <span>Minimum Purchase:</span>
                      <span className="font-bold text-gray-900">
                        {coupon.min_order_amount > 0 ? formatCurrency(coupon.min_order_amount) : 'None (₹0)'}
                      </span>
                    </div>

                    {isPercentage && coupon.max_discount_amount && (
                      <div className="flex justify-between items-center text-gray-600">
                        <span>Max Discount Cap:</span>
                        <span className="font-bold text-gray-900">
                          {formatCurrency(coupon.max_discount_amount)}
                        </span>
                      </div>
                    )}

                    <div className="flex justify-between items-center text-gray-600">
                      <span>Redeemed:</span>
                      <span className="font-bold text-[#6A43FB]">
                        {coupon.usage_count || 0} times
                        {coupon.usage_limit ? ` (Limit: ${coupon.usage_limit})` : ''}
                      </span>
                    </div>

                    {coupon.end_date && (
                      <div className="flex justify-between items-center text-gray-600">
                        <span>Valid Until:</span>
                        <span className="font-medium text-gray-800">
                          {new Date(coupon.end_date).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions Footer */}
                <div className="pt-4 mt-4 border-t border-gray-100 flex items-center justify-between gap-2">
                  {/* Deactivate / Activate Button */}
                  <button
                    type="button"
                    onClick={() => handleToggleActive(coupon)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      coupon.is_active
                        ? 'bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200'
                        : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200'
                    }`}
                  >
                    <Power size={13} />
                    <span>{coupon.is_active ? 'Deactivate' : 'Activate'}</span>
                  </button>

                  <div className="flex items-center gap-1.5">
                    {/* Edit */}
                    <button
                      type="button"
                      onClick={() => openEditModal(coupon)}
                      className="p-2 rounded-xl text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors cursor-pointer"
                      title="Edit Coupon"
                    >
                      <Edit3 size={15} />
                    </button>

                    {/* Delete */}
                    <button
                      type="button"
                      onClick={() => handleDeleteCoupon(coupon)}
                      className="p-2 rounded-xl text-rose-500 hover:text-rose-700 hover:bg-rose-50 transition-colors cursor-pointer"
                      title="Delete Coupon"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* CREATE / EDIT COUPON MODAL */}
      {mounted && isModalOpen && createPortal(
        <div 
          className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setIsModalOpen(false);
            }
          }}
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95"
          >
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#6A43FB]/10 text-[#6A43FB] flex items-center justify-center font-bold">
                  <Ticket size={16} />
                </div>
                <h3 className="text-base font-black text-gray-900 tracking-tight">
                  {editingCoupon ? 'Edit Coupon Code' : 'Create New Coupon'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body Form */}
            <form onSubmit={handleFormSubmit} className="p-6 space-y-4 overflow-y-auto flex-1 text-xs">
              {/* Code & Active Toggle */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-gray-800 block mb-1.5 uppercase tracking-wider text-[11px]">
                    Coupon Code *
                  </label>
                  <input
                    type="text"
                    required
                    value={formCode}
                    onChange={(e) => setFormCode(e.target.value.toUpperCase())}
                    placeholder="e.g. WELCOME20"
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl font-mono font-black text-gray-900 focus:outline-none focus:border-[#6A43FB] focus:bg-white uppercase tracking-wider"
                  />
                </div>

                <div>
                  <label className="font-bold text-gray-800 block mb-1.5 uppercase tracking-wider text-[11px]">
                    Status
                  </label>
                  <div className="flex items-center gap-3 pt-2">
                    <label className="inline-flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formIsActive}
                        onChange={(e) => setFormIsActive(e.target.checked)}
                        className="w-4 h-4 text-[#6A43FB] rounded accent-[#6A43FB]"
                      />
                      <span className="font-bold text-gray-800 text-xs">
                        {formIsActive ? 'Active & Ready' : 'Deactivated (Hidden)'}
                      </span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="font-bold text-gray-800 block mb-1.5 uppercase tracking-wider text-[11px]">
                  Description / Offer Tagline
                </label>
                <input
                  type="text"
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="e.g. Get 20% off on your first order"
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:border-[#6A43FB] focus:bg-white"
                />
              </div>

              {/* Discount Type Toggle: Price vs Percentage */}
              <div>
                <label className="font-bold text-gray-800 block mb-1.5 uppercase tracking-wider text-[11px]">
                  Discount Calculation *
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setFormDiscountType('fixed')}
                    className={`py-2.5 px-4 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      formDiscountType === 'fixed'
                        ? 'bg-[#6A43FB] text-white border-[#6A43FB] shadow-sm'
                        : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    <span>Discount by Price (₹)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormDiscountType('percentage')}
                    className={`py-2.5 px-4 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      formDiscountType === 'percentage'
                        ? 'bg-[#6A43FB] text-white border-[#6A43FB] shadow-sm'
                        : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    <span>Discount by Percentage (%)</span>
                  </button>
                </div>
              </div>

              {/* Discount Value & Max Cap */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-gray-800 block mb-1.5 uppercase tracking-wider text-[11px]">
                    {formDiscountType === 'percentage' ? 'Percentage Off (%) *' : 'Discount Amount (₹) *'}
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      required
                      min={1}
                      max={formDiscountType === 'percentage' ? 100 : undefined}
                      value={formDiscountValue}
                      onChange={(e) => setFormDiscountValue(e.target.value)}
                      placeholder={formDiscountType === 'percentage' ? '20' : '100'}
                      className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 font-bold focus:outline-none focus:border-[#6A43FB] focus:bg-white"
                    />
                    <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 font-bold">
                      {formDiscountType === 'percentage' ? '%' : '₹'}
                    </span>
                  </div>
                </div>

                {formDiscountType === 'percentage' ? (
                  <div>
                    <label className="font-bold text-gray-800 block mb-1.5 uppercase tracking-wider text-[11px]">
                      Max Discount Cap (₹)
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        min={1}
                        value={formMaxDiscount}
                        onChange={(e) => setFormMaxDiscount(e.target.value)}
                        placeholder="e.g. 200 (optional)"
                        className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 font-bold focus:outline-none focus:border-[#6A43FB] focus:bg-white"
                      />
                      <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 font-bold">₹</span>
                    </div>
                  </div>
                ) : (
                  <div>
                    <label className="font-bold text-gray-800 block mb-1.5 uppercase tracking-wider text-[11px]">
                      Usage Limit
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={formUsageLimit}
                      onChange={(e) => setFormUsageLimit(e.target.value)}
                      placeholder="e.g. 500 (optional)"
                      className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 font-bold focus:outline-none focus:border-[#6A43FB] focus:bg-white"
                    />
                  </div>
                )}
              </div>

              {/* Minimum Purchase Order Amount */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-gray-800 block mb-1.5 uppercase tracking-wider text-[11px]">
                    Minimum Purchase Order (₹)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min={0}
                      value={formMinOrder}
                      onChange={(e) => setFormMinOrder(e.target.value)}
                      placeholder="0 (no minimum)"
                      className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 font-bold focus:outline-none focus:border-[#6A43FB] focus:bg-white"
                    />
                    <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 font-bold">₹</span>
                  </div>
                  <p className="text-[10px] text-gray-400 mt-1">Customer cart subtotal must reach this amount</p>
                </div>

                <div>
                  <label className="font-bold text-gray-800 block mb-1.5 uppercase tracking-wider text-[11px]">
                    Expiration Date
                  </label>
                  <input
                    type="date"
                    value={formEndDate}
                    onChange={(e) => setFormEndDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 font-bold focus:outline-none focus:border-[#6A43FB] focus:bg-white"
                  />
                  <p className="text-[10px] text-gray-400 mt-1">Leave empty for no expiration</p>
                </div>
              </div>

              {/* Footer Actions */}
              <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-xs font-bold hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={modalSubmitting}
                  className="px-6 py-2.5 rounded-xl bg-[#6A43FB] hover:bg-[#5926EC] text-white text-xs font-extrabold shadow-sm shadow-[#6A43FB]/30 transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  {modalSubmitting ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>{editingCoupon ? 'Update Coupon' : 'Create Coupon'}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
