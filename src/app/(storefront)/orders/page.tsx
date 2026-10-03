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
  ChevronRight,
  X
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
      fetchOrders({ email: userEmail, phone: userPhone, userId });
    } else {
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

  const handleClearSearch = () => {
    setSearchQuery('');
    const userPhone = user?.user_metadata?.phone || user?.phone || '';
    const userEmail = user?.email || '';
    const userId = user?.id || '';
    if (userEmail || userPhone) {
      fetchOrders({ email: userEmail, phone: userPhone, userId });
    } else {
      setOrders([]);
      setHasSearched(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'delivered':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
            <CheckCircle2 className="w-3 h-3 stroke-[2.5]" /> Delivered
          </span>
        );
      case 'shipped':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200/60">
            <Truck className="w-3 h-3 stroke-[2.5]" /> In Transit
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200/60">
            <AlertCircle className="w-3 h-3 stroke-[2.5]" /> Cancelled
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200/60">
            <Clock className="w-3 h-3 stroke-[2.5]" /> Processing
          </span>
        );
    }
  };

  return (
    <div className="bg-gray-50/50 min-h-screen text-gray-900 pb-20">
      <div className="max-w-2xl mx-auto px-4 py-4 sm:py-6">
        
        {/* Minimal Header */}
        <div className="flex items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <h1 className="text-base sm:text-lg font-bold text-gray-950 tracking-tight">
              My Orders
            </h1>
            {orders.length > 0 && (
              <span className="text-[11px] font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                {orders.length}
              </span>
            )}
          </div>
          {user && (
            <span className="text-[11px] text-gray-400 font-medium truncate max-w-[160px] sm:max-w-none">
              {user.email || user.phone}
            </span>
          )}
        </div>

        {/* Minimal Search / Track Order Bar */}
        <form onSubmit={handleSearchSubmit} className="mb-4">
          <div className="relative flex items-center bg-white rounded-xl border border-gray-200 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/10 shadow-2xs transition-all">
            <Search className="w-4 h-4 text-gray-400 ml-3 flex-shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Track by Order ID, Phone, or Email..."
              className="w-full pl-2.5 pr-2 py-2 text-xs sm:text-sm text-gray-900 placeholder:text-gray-400 bg-transparent focus:outline-none font-medium"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="p-1 text-gray-400 hover:text-gray-600 mr-1"
                title="Clear"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              type="submit"
              disabled={loading}
              className="m-1 px-3.5 py-1.5 bg-primary hover:bg-primary/95 text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 flex-shrink-0 disabled:opacity-60 cursor-pointer"
            >
              {loading ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <span>Track</span>
              )}
            </button>
          </div>
        </form>

        {/* Orders List */}
        {orders.length > 0 ? (
          <div className="space-y-3">
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
                  className="bg-white rounded-xl border border-gray-200 hover:border-primary/40 transition-all cursor-pointer overflow-hidden p-3.5 shadow-2xs space-y-2.5"
                >
                  {/* Top: Order ID, Date & Status */}
                  <div className="flex items-center justify-between gap-2 flex-wrap pb-2 border-b border-gray-100">
                    <div className="flex items-center gap-1.5 text-xs">
                      <span className="font-mono font-bold text-gray-900">
                        {order.order_number}
                      </span>
                      <span className="text-gray-300">•</span>
                      <span className="text-[11px] text-gray-400">
                        {formattedDate}
                      </span>
                    </div>
                    {getStatusBadge(order.status)}
                  </div>

                  {/* Items preview */}
                  <div className="space-y-2">
                    {(order.order_items || []).slice(0, 2).map((item, idx) => (
                      <div key={idx} className="flex items-center gap-2.5">
                        <div className="w-10 h-10 rounded-lg bg-gray-50 border border-gray-100 p-1 flex-shrink-0 flex items-center justify-center">
                          <img
                            src={item.product_image || '/dash_camera.png'}
                            alt={item.product_name}
                            className="w-full h-full object-contain"
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-medium text-gray-800 truncate">
                            {item.product_name}
                          </p>
                          <p className="text-[10px] text-gray-400">
                            Qty: {item.quantity} • {formatCurrency(item.unit_price)}
                          </p>
                        </div>
                        <span className="text-xs font-bold text-gray-900 flex-shrink-0">
                          {formatCurrency(item.total_price || item.unit_price * item.quantity)}
                        </span>
                      </div>
                    ))}

                    {(order.order_items?.length || 0) > 2 && (
                      <p className="text-[10px] text-gray-400 font-medium">
                        + {(order.order_items?.length || 0) - 2} more item(s)
                      </p>
                    )}
                  </div>

                  {/* Bottom: Total & View Details */}
                  <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1">
                      <span className="text-[11px] text-gray-500">Total:</span>
                      <span className="font-bold text-xs sm:text-sm text-gray-950">
                        {formatCurrency(order.total_amount)}
                      </span>
                      <span className="text-[10px] text-gray-400">
                        ({order.payment_method})
                      </span>
                    </div>

                    <span className="text-xs font-bold text-primary flex items-center gap-0.5 hover:underline">
                      <span>View Details</span>
                      <ChevronRight size={13} />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : hasSearched && !loading ? (
          <div className="bg-white rounded-xl border border-gray-200 p-8 text-center space-y-2">
            <Package className="w-8 h-8 text-gray-300 mx-auto" />
            <p className="text-xs font-bold text-gray-800">No orders found</p>
            <p className="text-[11px] text-gray-400 max-w-xs mx-auto">
              No orders matched &ldquo;{searchQuery}&rdquo;. Check your Order ID or phone number.
            </p>
            <button
              type="button"
              onClick={handleClearSearch}
              className="text-xs font-bold text-primary hover:underline pt-1 inline-block"
            >
              Clear Search
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 p-8 text-center space-y-2">
            <Package className="w-8 h-8 text-gray-300 mx-auto" />
            <p className="text-xs font-bold text-gray-800">No orders placed yet</p>
            <p className="text-[11px] text-gray-400 max-w-xs mx-auto">
              Track your package above or start exploring products.
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-1 px-4 py-2 bg-primary text-white text-xs font-bold rounded-lg hover:bg-primary/95 transition-colors mt-2"
            >
              <span>Start Shopping</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}

      </div>
    </div>
  );
}
