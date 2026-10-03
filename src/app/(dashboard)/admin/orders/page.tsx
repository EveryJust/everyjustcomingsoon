'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { getAdminOrders, Order } from '@/utils/supabase/adminData';
import { formatCurrency } from '@/utils/currency';
import { 
  ShoppingBag, 
  Search, 
  Filter, 
  RefreshCw, 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle2, 
  Clock, 
  Truck, 
  Package, 
  XCircle, 
  Eye, 
  User, 
  Phone, 
  MapPin, 
  Tag, 
  ArrowRight,
  SlidersHorizontal,
  DollarSign
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLive, setIsLive] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(6);
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);

  const fetchOrders = async () => {
    setLoading(true);
    const res = await getAdminOrders();
    setOrders(res.orders || []);
    setIsLive(res.isLive);
    setLoading(false);
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // Filter orders by search & status
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const q = searchTerm.toLowerCase().trim();
      const matchesSearch = 
        !q ||
        order.order_number?.toLowerCase().includes(q) ||
        order.customer_name?.toLowerCase().includes(q) ||
        order.customer_email?.toLowerCase().includes(q) ||
        order.customer_phone?.toLowerCase().includes(q) ||
        (order.shipping_address?.city && order.shipping_address.city.toLowerCase().includes(q));

      const matchesStatus = 
        statusFilter === 'all' || 
        order.status.toLowerCase() === statusFilter.toLowerCase();

      return matchesSearch && matchesStatus;
    });
  }, [orders, searchTerm, statusFilter]);

  // Reset to page 1 when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, pageSize]);

  // Pagination slice
  const totalPages = Math.ceil(filteredOrders.length / pageSize) || 1;
  const paginatedOrders = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredOrders.slice(start, start + pageSize);
  }, [filteredOrders, currentPage, pageSize]);

  // Quick update order status
  const handleStatusChange = async (orderId: string, newStatus: string) => {
    setUpdatingOrderId(orderId);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to update order status');
      }

      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: newStatus as any } : o))
      );
      toast.success(`Order status updated to ${newStatus}`);
    } catch (err: any) {
      toast.error(err.message || 'Error updating status');
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'delivered':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 size={13} />
            Delivered
          </span>
        );
      case 'processing':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
            <Clock size={13} />
            Processing
          </span>
        );
      case 'shipped':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200">
            <Truck size={13} />
            Shipped
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
            <Package size={13} />
            Pending
          </span>
        );
      case 'cancelled':
      case 'refunded':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
            <XCircle size={13} />
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-700">
            {status}
          </span>
        );
    }
  };

  // Status counts
  const counts = useMemo(() => {
    return {
      all: orders.length,
      pending: orders.filter((o) => o.status === 'pending').length,
      processing: orders.filter((o) => o.status === 'processing').length,
      shipped: orders.filter((o) => o.status === 'shipped').length,
      delivered: orders.filter((o) => o.status === 'delivered').length,
      cancelled: orders.filter((o) => o.status === 'cancelled').length
    };
  }, [orders]);

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-16">
      {/* Header Card */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#6A43FB]/10 text-[#6A43FB] flex items-center justify-center font-bold">
              <ShoppingBag size={20} />
            </div>
            <div>
              <h1 className="text-2xl font-black text-gray-900 tracking-tight">Order Management</h1>
              <p className="text-xs text-gray-400 mt-0.5">
                View, track, and manage all customer purchases and fulfillment status.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
            isLive ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
          }`}>
            <span className={`w-2 h-2 rounded-full ${isLive ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
            {isLive ? `${orders.length} Orders Live` : 'Connecting to DB'}
          </span>

          <button
            type="button"
            onClick={fetchOrders}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 hover:border-gray-300 text-gray-700 text-xs font-bold hover:bg-gray-50 transition-all cursor-pointer disabled:opacity-50"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] space-y-4">
        {/* Status tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {[
            { id: 'all', label: 'All Orders', count: counts.all },
            { id: 'processing', label: 'Processing', count: counts.processing },
            { id: 'shipped', label: 'Shipped', count: counts.shipped },
            { id: 'delivered', label: 'Delivered', count: counts.delivered },
            { id: 'pending', label: 'Pending', count: counts.pending },
            { id: 'cancelled', label: 'Cancelled', count: counts.cancelled },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setStatusFilter(tab.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer ${
                statusFilter === tab.id
                  ? 'bg-[#6A43FB] text-white shadow-sm shadow-[#6A43FB]/30'
                  : 'bg-gray-50 text-gray-600 hover:bg-gray-100 hover:text-gray-900 border border-gray-100'
              }`}
            >
              <span>{tab.label}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                statusFilter === tab.id ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-700'
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Search & Page Size Row */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by order #, name, phone, city..."
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#6A43FB] focus:bg-white transition-all font-medium"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-gray-600"
              >
                Clear
              </button>
            )}
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end text-xs text-gray-500 font-medium">
            <span>Showing {filteredOrders.length} {filteredOrders.length === 1 ? 'order' : 'orders'}</span>
            <div className="flex items-center gap-2">
              <span>Cards per page:</span>
              <select
                value={pageSize}
                onChange={(e) => setPageSize(Number(e.target.value))}
                className="bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1 text-xs font-bold text-gray-800 focus:outline-none focus:border-[#6A43FB]"
              >
                <option value={6}>6</option>
                <option value={9}>9</option>
                <option value={12}>12</option>
                <option value={24}>24</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Orders Grid (Card Layout with Pagination) */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-white rounded-3xl p-6 border border-gray-100 animate-pulse space-y-4 shadow-sm">
              <div className="flex justify-between items-center">
                <div className="h-4 bg-gray-200 rounded w-28" />
                <div className="h-6 bg-gray-200 rounded-full w-20" />
              </div>
              <div className="h-3 bg-gray-100 rounded w-36" />
              <div className="h-20 bg-gray-50 rounded-2xl" />
              <div className="h-8 bg-gray-100 rounded-xl" />
            </div>
          ))}
        </div>
      ) : paginatedOrders.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
          <div className="w-16 h-16 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center mx-auto mb-4">
            <Package size={28} />
          </div>
          <h3 className="text-base font-bold text-gray-900 mb-1">No Orders Found</h3>
          <p className="text-xs text-gray-400 max-w-sm mx-auto mb-4">
            {searchTerm || statusFilter !== 'all'
              ? 'No orders match your search or filter criteria. Try resetting filters.'
              : 'There are no customer orders in the system yet.'}
          </p>
          {(searchTerm || statusFilter !== 'all') && (
            <button
              type="button"
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('all');
              }}
              className="px-4 py-2 bg-gray-900 text-white text-xs font-bold rounded-xl hover:bg-gray-800 transition-colors"
            >
              Reset Filters
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {paginatedOrders.map((order) => {
            const dateStr = new Date(order.created_at).toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            });

            const shipping = order.shipping_address || {};
            const itemCount = order.order_items?.length || 0;

            return (
              <div 
                key={order.id} 
                className="bg-white rounded-3xl p-6 border border-gray-100 hover:border-[#6A43FB]/30 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_12px_36px_rgb(106,67,251,0.08)] transition-all flex flex-col justify-between group"
              >
                <div>
                  {/* Top Bar: Order Number & Status Badge */}
                  <div className="flex items-start justify-between gap-3 pb-3 border-b border-gray-100">
                    <div>
                      <span className="font-mono text-xs font-black text-gray-900 tracking-wider">
                        #{order.order_number}
                      </span>
                      <p className="text-[11px] text-gray-400 mt-0.5">{dateStr}</p>
                    </div>
                    {getStatusBadge(order.status)}
                  </div>

                  {/* Customer Info */}
                  <div className="py-3.5 space-y-1.5 border-b border-gray-100 text-xs text-gray-700">
                    <div className="flex items-center gap-2 font-bold text-gray-950">
                      <User size={13} className="text-[#6A43FB] flex-shrink-0" />
                      <span className="truncate">{order.customer_name}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-500 text-[11px]">
                      <Phone size={13} className="text-gray-400 flex-shrink-0" />
                      <span>{order.customer_phone || 'No phone'}</span>
                    </div>
                    {shipping.city && (
                      <div className="flex items-center gap-2 text-gray-500 text-[11px]">
                        <MapPin size={13} className="text-gray-400 flex-shrink-0" />
                        <span className="truncate">{shipping.city}, {shipping.state || 'India'}</span>
                      </div>
                    )}
                  </div>

                  {/* Order Items Preview */}
                  <div className="py-3.5 space-y-2 border-b border-gray-100">
                    <div className="flex items-center justify-between text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                      <span>Items ({itemCount})</span>
                      <span className="text-[#6A43FB] font-normal lowercase">
                        {order.payment_method || 'Cash on Delivery'}
                      </span>
                    </div>

                    {order.order_items && order.order_items.length > 0 ? (
                      <div className="space-y-2">
                        {order.order_items.slice(0, 2).map((item, idx) => (
                          <div key={idx} className="flex items-center gap-2.5 text-xs">
                            <div className="w-8 h-8 rounded-lg bg-gray-50 border border-gray-100 p-0.5 flex-shrink-0 flex items-center justify-center overflow-hidden">
                              <img
                                src={item.product_image || '/dash_camera.png'}
                                alt={item.product_name}
                                className="w-full h-full object-contain"
                              />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="font-medium text-gray-800 truncate text-[11px] leading-tight">
                                {item.product_name}
                              </p>
                              <p className="text-[10px] text-gray-400">
                                {item.quantity} × {formatCurrency(item.unit_price)}
                              </p>
                            </div>
                          </div>
                        ))}
                        {order.order_items.length > 2 && (
                          <p className="text-[10px] text-gray-400 font-medium pl-10">
                            +{order.order_items.length - 2} more item(s)
                          </p>
                        )}
                      </div>
                    ) : (
                      <p className="text-xs text-gray-400 italic">No item details available</p>
                    )}
                  </div>

                  {/* Financials & Coupon Tag */}
                  <div className="py-3 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-gray-400 block">Total Amount</span>
                      <span className="text-base font-black text-gray-950">
                        {formatCurrency(order.total_amount)}
                      </span>
                    </div>

                    <div className="text-right">
                      {order.coupon_code ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold font-mono">
                          <Tag size={10} />
                          {order.coupon_code}
                        </span>
                      ) : (
                        <span className="text-[11px] text-gray-400 font-medium">Standard</span>
                      )}
                      <span className="block text-[10px] text-gray-400 mt-0.5">
                        {order.payment_status === 'paid' ? 'Paid' : 'Pay on Delivery'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card Actions Footer */}
                <div className="pt-3 border-t border-gray-100 flex items-center gap-2">
                  {/* Status quick select */}
                  <select
                    value={order.status}
                    disabled={updatingOrderId === order.id}
                    onChange={(e) => handleStatusChange(order.id, e.target.value)}
                    className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-2.5 py-2 text-xs font-bold text-gray-800 focus:outline-none focus:border-[#6A43FB] transition-colors cursor-pointer"
                  >
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>

                  {/* View Details Link */}
                  <Link
                    href={`/admin/orders/${order.id}`}
                    className="flex items-center justify-center gap-1.5 px-3.5 py-2 bg-[#6A43FB] hover:bg-[#5926EC] text-white rounded-xl text-xs font-bold shadow-sm shadow-[#6A43FB]/20 transition-all flex-shrink-0 cursor-pointer"
                    title="View Full Details"
                  >
                    <Eye size={14} />
                    <span>Details</span>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination Footer */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
          <div className="text-xs text-gray-500 font-medium">
            Page <span className="font-bold text-gray-900">{currentPage}</span> of <span className="font-bold text-gray-900">{totalPages}</span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-gray-900 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              aria-label="Previous Page"
            >
              <ChevronLeft size={16} />
            </button>

            {Array.from({ length: totalPages }).map((_, idx) => {
              const pageNum = idx + 1;
              // Show first, last, and window around current page
              if (
                pageNum === 1 ||
                pageNum === totalPages ||
                (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
              ) {
                return (
                  <button
                    key={pageNum}
                    type="button"
                    onClick={() => setCurrentPage(pageNum)}
                    className={`w-8 h-8 rounded-xl text-xs font-bold transition-all ${
                      currentPage === pageNum
                        ? 'bg-[#6A43FB] text-white shadow-sm'
                        : 'border border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              }
              if (pageNum === currentPage - 2 || pageNum === currentPage + 2) {
                return (
                  <span key={pageNum} className="text-gray-400 px-1 text-xs">
                    ...
                  </span>
                );
              }
              return null;
            })}

            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-2 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-gray-900 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              aria-label="Next Page"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
