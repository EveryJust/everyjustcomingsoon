'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { 
  Package, 
  Search, 
  Clock, 
  CheckCircle2, 
  Truck, 
  AlertCircle, 
  ArrowRight, 
  RefreshCw,
  Phone,
  Mail,
  ChevronRight,
  MapPin,
  Calendar,
  ExternalLink
} from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { formatCurrency } from '@/utils/currency';

interface OrderItem {
  id: string;
  product_name: string;
  product_image: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

interface OrderRecord {
  id: string;
  order_number: string;
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  total_amount: number;
  status: string;
  payment_method: string;
  payment_status: string;
  created_at: string;
  shipping_address: any;
  order_items: OrderItem[];
}

export default function OrdersPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch orders automatically when user is logged in or from previous session/local storage
  useEffect(() => {
    if (!mounted) return;

    const userPhone = user?.user_metadata?.phone || user?.phone || '';
    const userEmail = user?.email || '';
    const userId = user?.id || '';

    if (userEmail || userPhone) {
      // Logged in user: auto fetch all orders by email, phone, and userId
      fetchOrders({ email: userEmail, phone: userPhone, userId });
    } else {
      // Guest: check recent order in storage
      try {
        const lastOrderNum = localStorage.getItem('last_placed_order_number');
        const lastOrderEmail = localStorage.getItem('last_customer_email');
        if (lastOrderNum) {
          setSearchQuery(lastOrderNum);
          fetchOrders({ orderNumber: lastOrderNum });
        } else if (lastOrderEmail) {
          setSearchQuery(lastOrderEmail);
          fetchOrders({ email: lastOrderEmail });
        }
      } catch {}
    }
  }, [mounted, user]);

  const fetchOrders = async (params: { orderNumber?: string; email?: string; phone?: string; userId?: string }) => {
    setLoading(true);
    setHasSearched(true);

    try {
      const urlParams = new URLSearchParams();
      if (params.orderNumber) urlParams.set('orderNumber', params.orderNumber.trim());
      if (params.email) urlParams.set('email', params.email.trim());
      if (params.phone) urlParams.set('phone', params.phone.trim());
      if (params.userId) urlParams.set('userId', params.userId.trim());

      const res = await fetch(`/api/orders/lookup?${urlParams.toString()}`);
      const data = await res.json();

      if (!res.ok || !data.success) {
        toast.error(data.error || 'Failed to find orders');
        setOrders([]);
      } else {
        setOrders(data.orders || []);
      }
    } catch (err: any) {
      toast.error(err.message || 'Error connecting to server');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchQuery.trim();
    if (!query) return;

    if (query.includes('@')) {
      fetchOrders({ email: query });
    } else if (/^\d{10}$/.test(query.replace(/\D/g, ''))) {
      fetchOrders({ phone: query });
    } else {
      fetchOrders({ orderNumber: query });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'delivered':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5" /> Delivered
          </span>
        );
      case 'shipped':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
            <Truck className="w-3.5 h-3.5" /> In Transit
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
            <AlertCircle className="w-3.5 h-3.5" /> Cancelled
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-3.5 h-3.5" /> Processing
          </span>
        );
    }
  };

  return (
    <div className="bg-gray-50/60 min-h-screen pb-20 text-gray-900">
      {/* Top Banner */}
      <div className="bg-white border-b border-gray-100 py-6 sm:py-8 shadow-xs">
        <div className="max-w-5xl mx-auto px-4">
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
            Order Tracking & History
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Track real-time shipment updates, view invoices, and manage your delivery addresses.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        {/* Search / Lookup Box */}
        <div className="bg-white rounded-3xl shadow-xs border border-gray-100 p-5 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
            <div>
              <h2 className="text-sm font-bold text-gray-900">Lookup Any Order</h2>
              <p className="text-xs text-gray-400">
                Search with your Order ID, Email address, or 10-digit mobile number.
              </p>
            </div>
            {user && (
              <span className="text-[11px] font-semibold text-primary bg-primary/10 px-2.5 py-1 rounded-full w-fit">
                Showing orders for {user.email}
              </span>
            )}
          </div>

          <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-grow">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Enter Order ID (e.g. EJ-260930-1234), Email, or Mobile Number..."
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent font-medium"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 bg-primary text-white rounded-xl text-xs sm:text-sm font-bold hover:bg-primary/95 transition-all flex items-center justify-center gap-2 shadow-xs disabled:opacity-60 cursor-pointer"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Searching...</span>
                </>
              ) : (
                <span>Find Order</span>
              )}
            </button>
          </form>
        </div>

        {/* Orders list */}
        {orders.length > 0 ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-gray-500">
                Your Orders ({orders.length})
              </h3>
              <span className="text-xs text-gray-400 font-medium">Click order to view full timeline</span>
            </div>

            {orders.map((order) => {
              const formattedDate = new Date(order.created_at).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'short',
                year: 'numeric'
              });

              return (
                <div
                  key={order.id}
                  onClick={() => router.push(`/orders/${encodeURIComponent(order.order_number)}`)}
                  className="bg-white rounded-3xl shadow-xs border border-gray-100 hover:border-primary/40 hover:shadow-md transition-all cursor-pointer overflow-hidden group"
                >
                  {/* Order header */}
                  <div className="bg-gray-50/80 px-5 sm:px-6 py-3.5 border-b border-gray-100 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-xs">
                      <div>
                        <p className="text-[10px] uppercase tracking-wider font-semibold text-gray-400">Placed On</p>
                        <p className="font-bold text-gray-800">{formattedDate}</p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase tracking-wider font-semibold text-gray-400">Order ID</p>
                        <p className="font-bold text-primary font-mono">{order.order_number}</p>
                      </div>
                      <div className="hidden sm:block">
                        <p className="text-[10px] uppercase tracking-wider font-semibold text-gray-400">Payment</p>
                        <p className="font-bold text-gray-700">{order.payment_method}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {getStatusBadge(order.status)}
                      <div className="text-right">
                        <p className="text-[10px] uppercase tracking-wider font-semibold text-gray-400">Total</p>
                        <p className="text-sm sm:text-base font-black text-gray-900">{formatCurrency(order.total_amount)}</p>
                      </div>
                    </div>
                  </div>

                  {/* Order Items Preview */}
                  <div className="p-5 sm:p-6 space-y-3">
                    <div className="space-y-2.5">
                      {(order.order_items || []).slice(0, 3).map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between gap-3 text-xs">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-12 h-12 rounded-xl bg-gray-50 border border-gray-100 p-1 flex-shrink-0 flex items-center justify-center">
                              <img
                                src={item.product_image || '/dash_camera.png'}
                                alt={item.product_name}
                                className="w-full h-full object-contain"
                              />
                            </div>
                            <div className="min-w-0">
                              <h4 className="font-bold text-gray-900 truncate">{item.product_name}</h4>
                              <p className="text-[11px] text-gray-400">Qty: {item.quantity}</p>
                            </div>
                          </div>
                          <div className="text-right flex-shrink-0 font-bold text-gray-800">
                            {formatCurrency(item.total_price || item.unit_price * item.quantity)}
                          </div>
                        </div>
                      ))}

                      {(order.order_items?.length || 0) > 3 && (
                        <p className="text-xs text-gray-400 font-semibold pt-1">
                          + {(order.order_items?.length || 0) - 3} more item(s)
                        </p>
                      )}
                    </div>

                    {/* Bottom Action Footer */}
                    <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
                      <div className="text-gray-500 truncate max-w-xs sm:max-w-md">
                        {order.shipping_address ? (
                          <span className="flex items-center gap-1.5 truncate">
                            <MapPin size={13} className="text-gray-400 flex-shrink-0" />
                            <span className="truncate">
                              {order.shipping_address.city}, {order.shipping_address.state} ({order.shipping_address.pincode})
                            </span>
                          </span>
                        ) : null}
                      </div>

                      <div className="inline-flex items-center gap-1 font-bold text-primary group-hover:translate-x-1 transition-transform flex-shrink-0">
                        <span>View Details</span>
                        <ChevronRight size={14} />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : hasSearched && !loading ? (
          <div className="bg-white rounded-3xl shadow-xs border border-gray-100 p-12 text-center">
            <Package className="w-14 h-14 text-gray-300 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-gray-800 mb-1">No Orders Found</h3>
            <p className="text-xs text-gray-500 mb-6 max-w-sm mx-auto">
              We couldn&apos;t find any orders matching &ldquo;{searchQuery}&rdquo;. Please verify your Order ID, email address, or mobile number.
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary text-white font-bold rounded-xl hover:bg-primary/95 transition-all text-xs shadow-xs"
            >
              <span>Browse Catalog</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-3xl shadow-xs border border-gray-100 p-12 text-center">
            <Package className="w-14 h-14 text-gray-300 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-gray-800 mb-1">Track & Manage Your Orders</h3>
            <p className="text-xs text-gray-500 mb-6 max-w-md mx-auto">
              Search above with your order confirmation number, email address, or mobile number to track real-time delivery status and view receipts.
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary text-white font-bold rounded-xl hover:bg-primary/95 transition-all text-xs shadow-xs"
            >
              <span>Continue Shopping</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
