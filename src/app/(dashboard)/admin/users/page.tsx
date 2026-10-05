'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Users, 
  Search, 
  Filter, 
  MapPin, 
  ShoppingBag, 
  Star, 
  Phone, 
  Mail, 
  Calendar, 
  ChevronRight, 
  X, 
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  Clock,
  ArrowUpRight
} from 'lucide-react';
import { formatCurrency } from '@/utils/currency';
import toast from 'react-hot-toast';

interface CustomerRecord {
  id: string;
  user_id?: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string | null;
  role: string;
  joined_at: string;
  orders: any[];
  addresses: any[];
  reviews: any[];
  total_spent: number;
}

export default function UsersPage() {
  const [customers, setCustomers] = useState<CustomerRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'buyers' | 'registered' | 'high_value'>('all');
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerRecord | null>(null);
  const [activeCustomerTab, setActiveCustomerTab] = useState<'addresses' | 'orders' | 'reviews'>('addresses');

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/customers');
      const data = await res.json();
      if (data.success) {
        setCustomers(data.customers || []);
      } else {
        toast.error(data.error || 'Failed to load customers');
      }
    } catch (err: any) {
      toast.error('Network error loading customers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  // Filtered customer list
  const filteredCustomers = customers.filter((c) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      c.name.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q) ||
      c.phone.toLowerCase().includes(q);

    if (!matchesSearch) return false;

    if (filterType === 'buyers') return c.orders.length > 0;
    if (filterType === 'registered') return !!c.user_id;
    if (filterType === 'high_value') return c.total_spent >= 1000;
    return true;
  });

  // KPI Metrics
  const totalCustomers = customers.length;
  const activeBuyers = customers.filter((c) => c.orders.length > 0).length;
  const totalRevenue = customers.reduce((acc, c) => acc + (c.total_spent || 0), 0);
  const totalReviews = customers.reduce((acc, c) => acc + (c.reviews?.length || 0), 0);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">
            Customer Management
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            View unified customer profiles, connected delivery addresses, order history, and feedback.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchCustomers}
          disabled={loading}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-gray-50 border border-gray-200 text-xs font-bold text-gray-700 rounded-xl transition-all shadow-2xs self-start sm:self-auto cursor-pointer"
        >
          <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
          <span>Refresh</span>
        </button>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Total Customers</span>
            <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <Users size={16} />
            </div>
          </div>
          <div className="text-2xl font-black text-gray-900 mt-2">{totalCustomers}</div>
          <p className="text-[11px] text-gray-400 mt-0.5">Registered & verified shoppers</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Active Buyers</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <ShoppingBag size={16} />
            </div>
          </div>
          <div className="text-2xl font-black text-gray-900 mt-2">{activeBuyers}</div>
          <p className="text-[11px] text-emerald-600 font-medium mt-0.5">
            {totalCustomers > 0 ? Math.round((activeBuyers / totalCustomers) * 100) : 0}% purchase conversion
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Customer Revenue</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <ShieldCheck size={16} />
            </div>
          </div>
          <div className="text-2xl font-black text-gray-900 mt-2">{formatCurrency(totalRevenue)}</div>
          <p className="text-[11px] text-gray-400 mt-0.5">Total customer lifetime spend</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Reviews Posted</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-500 flex items-center justify-center">
              <Star size={16} className="fill-amber-400" />
            </div>
          </div>
          <div className="text-2xl font-black text-gray-900 mt-2">{totalReviews}</div>
          <p className="text-[11px] text-gray-400 mt-0.5">Product ratings & feedback</p>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-white p-3.5 rounded-2xl border border-gray-100 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {[
            { id: 'all', label: 'All Customers' },
            { id: 'buyers', label: `Buyers (${activeBuyers})` },
            { id: 'registered', label: 'Registered' },
            { id: 'high_value', label: 'High Value (₹1k+)' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setFilterType(tab.id as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                filterType === tab.id
                  ? 'bg-primary text-white shadow-2xs'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative flex-1 max-w-xs min-w-[220px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, email, phone..."
            className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-primary focus:bg-white transition-colors"
          />
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-2xs overflow-hidden">
        {loading ? (
          <div className="p-16 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-3 border-primary border-t-transparent mx-auto"></div>
            <p className="text-xs font-bold text-gray-600 mt-3">Loading customer profiles...</p>
          </div>
        ) : filteredCustomers.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/80 border-b border-gray-100 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Contact Info</th>
                  <th className="py-3 px-4 text-center">Orders</th>
                  <th className="py-3 px-4 text-right">Total Spent</th>
                  <th className="py-3 px-4 text-center">Addresses</th>
                  <th className="py-3 px-4 text-center">Reviews</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-xs">
                {filteredCustomers.map((cust) => {
                  const dateStr = new Date(cust.joined_at).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric'
                  });

                  return (
                    <tr 
                      key={cust.id} 
                      className="hover:bg-gray-50/60 transition-colors group cursor-pointer"
                      onClick={() => {
                        setSelectedCustomer(cust);
                        setActiveCustomerTab('addresses');
                      }}
                    >
                      {/* Customer Info */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-primary to-purple-600 text-white font-bold flex items-center justify-center text-xs flex-shrink-0 shadow-2xs">
                            {cust.avatar ? (
                              <img
                                src={cust.avatar}
                                alt={cust.name}
                                className="w-full h-full rounded-full object-cover"
                              />
                            ) : (
                              cust.name.charAt(0).toUpperCase()
                            )}
                          </div>
                          <div>
                            <div className="font-bold text-gray-900 group-hover:text-primary transition-colors flex items-center gap-1.5">
                              <span>{cust.name}</span>
                              {cust.user_id && (
                                <span className="text-[9px] font-bold text-primary bg-primary/10 px-1.5 py-0.2 rounded-md">
                                  Member
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
                          <p className="text-gray-800 font-medium truncate max-w-[180px]">
                            {cust.email || '—'}
                          </p>
                          <p className="text-gray-400 font-mono text-[11px]">
                            {cust.phone || '—'}
                          </p>
                        </div>
                      </td>

                      {/* Orders */}
                      <td className="py-3.5 px-4 text-center">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold ${
                          cust.orders.length > 0
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-gray-100 text-gray-500'
                        }`}>
                          {cust.orders.length}
                        </span>
                      </td>

                      {/* Total Spent */}
                      <td className="py-3.5 px-4 text-right font-bold text-gray-900">
                        {formatCurrency(cust.total_spent)}
                      </td>

                      {/* Addresses */}
                      <td className="py-3.5 px-4 text-center">
                        <span className="inline-flex items-center gap-1 text-gray-600 font-medium">
                          <MapPin size={12} className="text-gray-400" />
                          <span>{cust.addresses.length}</span>
                        </span>
                      </td>

                      {/* Reviews */}
                      <td className="py-3.5 px-4 text-center">
                        <span className="inline-flex items-center gap-1 text-gray-600 font-medium">
                          <Star size={12} className={cust.reviews.length > 0 ? 'text-amber-400 fill-amber-400' : 'text-gray-300'} />
                          <span>{cust.reviews.length}</span>
                        </span>
                      </td>

                      {/* Action */}
                      <td className="py-3.5 px-4 text-right">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedCustomer(cust);
                            setActiveCustomerTab('addresses');
                          }}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-gray-200 text-gray-700 hover:text-primary hover:border-primary/40 text-xs font-bold transition-all shadow-2xs cursor-pointer"
                        >
                          <span>Details</span>
                          <ChevronRight size={13} />
                        </button>
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
            <p className="text-sm font-bold text-gray-800">No customers found</p>
            <p className="text-xs text-gray-400">Try clearing or adjusting your search criteria.</p>
          </div>
        )}
      </div>

      {/* Customer Details Modal / Drawer */}
      {selectedCustomer && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto"
          onClick={() => setSelectedCustomer(null)}
        >
          <div 
            className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-gray-100 overflow-hidden my-auto max-h-[92vh] flex flex-col animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-5 sm:p-6 border-b border-gray-100 bg-gray-50/70 flex items-center justify-between">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-primary to-purple-600 text-white font-black flex items-center justify-center text-base shadow-md flex-shrink-0">
                  {selectedCustomer.avatar ? (
                    <img
                      src={selectedCustomer.avatar}
                      alt={selectedCustomer.name}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    selectedCustomer.name.charAt(0).toUpperCase()
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-black text-gray-900 leading-tight">
                      {selectedCustomer.name}
                    </h3>
                    {selectedCustomer.user_id ? (
                      <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                        Registered Account
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold text-gray-500 bg-gray-200 px-2 py-0.5 rounded-full">
                        Guest Shopper
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                    {selectedCustomer.email && (
                      <span className="flex items-center gap-1">
                        <Mail size={12} className="text-gray-400" />
                        {selectedCustomer.email}
                      </span>
                    )}
                    {selectedCustomer.phone && (
                      <span className="flex items-center gap-1 font-mono">
                        <Phone size={12} className="text-gray-400" />
                        {selectedCustomer.phone}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedCustomer(null)}
                className="p-1.5 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Quick Stat Bar */}
            <div className="grid grid-cols-4 border-b border-gray-100 bg-white text-center py-3 text-xs">
              <div>
                <p className="text-[10px] uppercase font-bold text-gray-400">Total Spent</p>
                <p className="font-black text-primary text-sm mt-0.5">{formatCurrency(selectedCustomer.total_spent)}</p>
              </div>
              <div className="border-l border-gray-100">
                <p className="text-[10px] uppercase font-bold text-gray-400">Orders</p>
                <p className="font-black text-gray-900 text-sm mt-0.5">{selectedCustomer.orders.length}</p>
              </div>
              <div className="border-l border-gray-100">
                <p className="text-[10px] uppercase font-bold text-gray-400">Addresses</p>
                <p className="font-black text-gray-900 text-sm mt-0.5">{selectedCustomer.addresses.length}</p>
              </div>
              <div className="border-l border-gray-100">
                <p className="text-[10px] uppercase font-bold text-gray-400">Reviews</p>
                <p className="font-black text-gray-900 text-sm mt-0.5">{selectedCustomer.reviews.length}</p>
              </div>
            </div>

            {/* Modal Tabs */}
            <div className="flex border-b border-gray-100 px-6 gap-6 bg-gray-50/50">
              <button
                type="button"
                onClick={() => setActiveCustomerTab('addresses')}
                className={`py-3 text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeCustomerTab === 'addresses'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-900'
                }`}
              >
                <MapPin size={13} />
                <span>Connected Addresses ({selectedCustomer.addresses.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveCustomerTab('orders')}
                className={`py-3 text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeCustomerTab === 'orders'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-900'
                }`}
              >
                <ShoppingBag size={13} />
                <span>Order History ({selectedCustomer.orders.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveCustomerTab('reviews')}
                className={`py-3 text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeCustomerTab === 'reviews'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-900'
                }`}
              >
                <Star size={13} />
                <span>Reviews ({selectedCustomer.reviews.length})</span>
              </button>
            </div>

            {/* Modal Tab Content */}
            <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-4 text-xs">
              
              {/* TAB 1: CONNECTED ADDRESSES */}
              {activeCustomerTab === 'addresses' && (
                <div className="space-y-3">
                  {selectedCustomer.addresses.length > 0 ? (
                    selectedCustomer.addresses.map((addr, idx) => (
                      <div
                        key={idx}
                        className="bg-gray-50/80 p-4 rounded-2xl border border-gray-200/80 space-y-1.5 text-xs"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-extrabold text-gray-900 text-sm">
                            {addr.fullName || selectedCustomer.name}
                          </span>
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider bg-white px-2 py-0.5 rounded-md border border-gray-200">
                            Address #{idx + 1}
                          </span>
                        </div>

                        <p className="text-gray-700 leading-relaxed font-medium">
                          {addr.street}
                          {addr.landmark ? `, Near ${addr.landmark}` : ''}
                          <br />
                          {addr.city}, {addr.state} - <strong className="text-gray-900 font-bold">{addr.pincode}</strong>
                          <br />
                          {addr.country || 'India'}
                        </p>

                        <div className="pt-2 border-t border-gray-200/60 flex items-center gap-4 text-gray-500 text-[11px]">
                          <span className="flex items-center gap-1">
                            <Phone size={11} className="text-gray-400" />
                            {addr.phone || selectedCustomer.phone || 'No phone'}
                          </span>
                          {addr.alternatePhone && (
                            <span className="flex items-center gap-1">
                              Alt: {addr.alternatePhone}
                            </span>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-8 text-center space-y-1.5 text-gray-400">
                      <MapPin size={24} className="mx-auto text-gray-300" />
                      <p className="font-bold text-gray-700">No delivery addresses on file</p>
                      <p className="text-[11px]">Addresses will appear here once the customer enters one at checkout.</p>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: ORDER HISTORY */}
              {activeCustomerTab === 'orders' && (
                <div className="space-y-3">
                  {selectedCustomer.orders.length > 0 ? (
                    selectedCustomer.orders.map((ord) => {
                      const oDate = new Date(ord.created_at).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      });

                      return (
                        <div
                          key={ord.id}
                          className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-2xs space-y-2 hover:border-primary/40 transition-colors"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-bold text-gray-900">{ord.order_number}</span>
                              <span className="text-gray-300">•</span>
                              <span className="text-[11px] text-gray-400">{oDate}</span>
                            </div>

                            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                              ord.status === 'delivered'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : ord.status === 'shipped'
                                ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                : 'bg-amber-50 text-amber-700 border border-amber-200'
                            }`}>
                              {ord.status}
                            </span>
                          </div>

                          <div className="flex items-center justify-between pt-1 border-t border-gray-100 text-xs">
                            <span className="text-gray-500">
                              {ord.order_items?.length || 1} item(s) • {ord.payment_method}
                            </span>
                            <span className="font-black text-gray-900 text-sm">
                              {formatCurrency(ord.total_amount)}
                            </span>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="p-8 text-center space-y-1.5 text-gray-400">
                      <ShoppingBag size={24} className="mx-auto text-gray-300" />
                      <p className="font-bold text-gray-700">No orders placed yet</p>
                      <p className="text-[11px]">This customer has not placed any orders yet.</p>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: CUSTOMER REVIEWS */}
              {activeCustomerTab === 'reviews' && (
                <div className="space-y-3">
                  {selectedCustomer.reviews.length > 0 ? (
                    selectedCustomer.reviews.map((r) => (
                      <div
                        key={r.id}
                        className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-2xs space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-gray-900 text-xs">{r.product_name}</span>
                          <div className="flex items-center gap-0.5 text-amber-400">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                size={12}
                                className={i < r.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-200'}
                              />
                            ))}
                          </div>
                        </div>
                        <p className="text-gray-700">{r.comment}</p>
                      </div>
                    ))
                  ) : (
                    <div className="p-8 text-center space-y-1.5 text-gray-400">
                      <Star size={24} className="mx-auto text-gray-300" />
                      <p className="font-bold text-gray-700">No reviews submitted</p>
                      <p className="text-[11px]">This customer has not posted any reviews yet.</p>
                    </div>
                  )}
                </div>
              )}

            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-gray-50 border-t border-gray-100 flex items-center justify-end">
              <button
                type="button"
                onClick={() => setSelectedCustomer(null)}
                className="px-5 py-2 bg-primary text-white text-xs font-bold rounded-xl hover:bg-primary/95 transition-all shadow-xs cursor-pointer"
              >
                Close Profile
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
