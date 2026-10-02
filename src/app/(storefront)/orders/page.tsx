'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { Package, Search, Clock, CheckCircle2, Truck, AlertCircle, ArrowRight, RefreshCw } from 'lucide-react';

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
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [hasSearched, setHasSearched] = useState(false);

  // Check on mount if an order was placed recently in session/local storage
  useEffect(() => {
    try {
      const lastOrderNum = localStorage.getItem('last_placed_order_number');
      const lastOrderEmail = localStorage.getItem('last_customer_email');
      if (lastOrderNum) {
        fetchOrders(lastOrderNum, 'orderNumber');
      } else if (lastOrderEmail) {
        setSearchQuery(lastOrderEmail);
        fetchOrders(lastOrderEmail, 'email');
      }
    } catch {
      // ignore
    }
  }, []);

  const fetchOrders = async (queryValue: string, type: 'orderNumber' | 'email') => {
    if (!queryValue.trim()) return;
    setLoading(true);
    setHasSearched(true);

    try {
      const param = type === 'orderNumber' ? `orderNumber=${encodeURIComponent(queryValue.trim())}` : `email=${encodeURIComponent(queryValue.trim())}`;
      const res = await fetch(`/api/orders/lookup?${param}`);
      const data = await res.json();

      if (!res.ok || !data.success) {
        toast.error(data.error || 'Failed to find orders');
        setOrders([]);
      } else {
        setOrders(data.orders || []);
        if ((data.orders || []).length > 0) {
          toast.success(`Found ${data.orders.length} order(s)`);
        } else {
          toast.error('No orders found for this search');
        }
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
    if (!searchQuery.trim()) return;

    if (searchQuery.includes('@')) {
      fetchOrders(searchQuery, 'email');
    } else {
      fetchOrders(searchQuery, 'orderNumber');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'delivered':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-green-50 text-green-700 border border-green-200">
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
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-50 text-red-700 border border-red-200">
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
    <div className="bg-gray-50 min-h-screen pb-16">
      <div className="bg-white border-b border-gray-200 py-8">
        <div className="max-w-6xl mx-auto px-4 lg:px-6">
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Order Tracking & History</h1>
          <p className="text-gray-500 mt-1">Track your Cash on Delivery orders, view items, and check delivery status.</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 lg:px-6 py-8">
        {/* Search / Lookup Box */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-base font-bold text-gray-900 mb-2">Find Your Order</h2>
          <p className="text-xs text-gray-500 mb-4">Enter your Order ID (e.g. EJ-260930-1234) or your email address used at checkout.</p>
          <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-grow">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Enter Order ID or Email..."
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent font-medium"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 bg-primary text-white rounded-xl text-sm font-bold hover:bg-primary/95 transition-all flex items-center justify-center gap-2 shadow-sm disabled:opacity-60"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Searching...
                </>
              ) : (
                'Find Order'
              )}
            </button>
          </form>
        </div>


        {/* Orders list */}
        {orders.length > 0 ? (
          <div className="space-y-6">
            {orders.map((order) => {
              const formattedDate = new Date(order.created_at).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'short',
                year: 'numeric'
              });

              return (
                <div key={order.id} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                  {/* Order header */}
                  <div className="bg-gray-50/80 px-6 py-4 border-b border-gray-200 flex flex-wrap items-center justify-between gap-4">
                    <div className="flex flex-wrap items-center gap-6">
                      <div>
                        <p className="text-[11px] uppercase tracking-wider font-semibold text-gray-400 mb-0.5">Order Placed</p>
                        <p className="text-sm font-bold text-gray-800">{formattedDate}</p>
                      </div>
                      <div>
                        <p className="text-[11px] uppercase tracking-wider font-semibold text-gray-400 mb-0.5">Order Number</p>
                        <p className="text-sm font-bold text-primary font-mono">{order.order_number}</p>
                      </div>
                      <div>
                        <p className="text-[11px] uppercase tracking-wider font-semibold text-gray-400 mb-0.5">Payment</p>
                        <p className="text-sm font-bold text-gray-700">{order.payment_method}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      {getStatusBadge(order.status)}
                      <div className="text-right">
                        <p className="text-[11px] uppercase tracking-wider font-semibold text-gray-400 mb-0.5">Total Amount</p>
                        <p className="text-base font-extrabold text-gray-900">₹{order.total_amount?.toLocaleString('en-IN')}</p>
                      </div>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="p-6">
                    <div className="space-y-4">
                      {order.order_items && order.order_items.length > 0 ? (
                        order.order_items.map((item, idx) => (
                          <div key={idx} className="flex items-center justify-between gap-4 py-3 border-b border-gray-100 last:border-0">
                            <div className="flex items-center gap-4">
                              <div className="w-16 h-16 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0 flex items-center justify-center p-1.5 border border-gray-200">
                                <img
                                  src={item.product_image || '/dash_camera.png'}
                                  alt={item.product_name}
                                  className="w-full h-full object-contain"
                                />
                              </div>
                              <div>
                                <h4 className="text-sm font-bold text-gray-900">{item.product_name}</h4>
                                <p className="text-xs text-gray-500 mt-0.5">Quantity: {item.quantity}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-bold text-gray-900">₹{item.total_price?.toLocaleString('en-IN')}</p>
                              <p className="text-[11px] text-gray-400">₹{item.unit_price} each</p>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-gray-500">Order details available upon shipment.</p>
                      )}
                    </div>

                    {/* Shipping Address note */}
                    {order.shipping_address && (
                      <div className="mt-4 pt-4 border-t border-gray-100 flex flex-col sm:flex-row justify-between text-xs text-gray-600 gap-2">
                        <div>
                          <span className="font-semibold text-gray-800">Delivering to: </span>
                          {order.shipping_address.street}, {order.shipping_address.city}, {order.shipping_address.state} - {order.shipping_address.pincode}
                        </div>
                        <div className="text-gray-500 font-medium">
                          Contact: {order.customer_phone || order.shipping_address.phone}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : hasSearched && !loading ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
            <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-gray-800 mb-1">No Orders Found</h3>
            <p className="text-sm text-gray-500 mb-6">We couldn&apos;t find any orders matching &ldquo;{searchQuery}&rdquo;. Please verify your Order ID or email.</p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary text-white font-bold rounded-xl hover:bg-primary/95 transition-all text-sm shadow-sm"
            >
              Browse Products
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
            <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-gray-800 mb-1">Track & Manage Your Orders</h3>
            <p className="text-sm text-gray-500 mb-6 max-w-md mx-auto">
              Search above with your order confirmation number or email address to view real-time delivery status and receipts.
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary text-white font-bold rounded-xl hover:bg-primary/95 transition-all text-sm shadow-sm"
            >
              Continue Shopping
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
