'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { 
  ChevronLeft, 
  Package, 
  Truck, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  Phone, 
  Mail, 
  Printer, 
  Copy, 
  Check, 
  ArrowRight, 
  ShieldCheck, 
  AlertCircle, 
  ShoppingBag,
  RotateCcw,
  Headphones,
  Calendar,
  CreditCard,
  Building
} from 'lucide-react';
import { formatCurrency } from '@/utils/currency';
import { useCartStore } from '@/store/useCartStore';
import toast from 'react-hot-toast';

interface OrderItem {
  id: string;
  product_name: string;
  product_image: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

interface OrderDetails {
  id: string;
  order_number: string;
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  subtotal: number;
  tax_amount: number;
  shipping_amount: number;
  discount_amount: number;
  coupon_code?: string;
  total_amount: number;
  status: string;
  payment_method: string;
  payment_status: string;
  created_at: string;
  shipping_address: any;
  order_items: OrderItem[];
}

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orderNumber = params?.orderNumber as string;

  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const { addItem } = useCartStore();

  useEffect(() => {
    if (!orderNumber) return;

    async function fetchOrder() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/orders/lookup?orderNumber=${encodeURIComponent(orderNumber)}`);
        const data = await res.json();

        if (!res.ok || !data.success || !data.orders || data.orders.length === 0) {
          setError(data.error || 'Order not found');
          setOrder(null);
        } else {
          setOrder(data.orders[0]);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load order');
      } finally {
        setLoading(false);
      }
    }

    fetchOrder();
  }, [orderNumber]);

  const handleCopyOrderNumber = () => {
    if (!order) return;
    navigator.clipboard.writeText(order.order_number);
    setCopied(true);
    toast.success('Order number copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleReorder = (item: OrderItem) => {
    const slug = item.product_name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    addItem({
      id: item.id || `reorder_${Date.now()}`,
      slug: slug || 'product',
      name: item.product_name,
      price: Number(item.unit_price) || 0,
      image: item.product_image || '/dash_camera.png',
      qty: 1
    });
    toast.success(`Added ${item.product_name} to cart!`);
  };

  // Helper for tracking steps
  const getStepProgress = (status: string) => {
    const s = status?.toLowerCase() || 'processing';
    if (s === 'delivered') return 5;
    if (s === 'out_for_delivery') return 4;
    if (s === 'shipped') return 3;
    if (s === 'confirmed') return 2;
    return 1; // 'processing' or 'pending'
  };

  const currentStep = getStepProgress(order?.status || 'processing');

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent mx-auto"></div>
          <p className="text-sm font-bold text-gray-700">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gray-50 py-16 px-4">
        <div className="max-w-md mx-auto bg-white rounded-3xl p-8 border border-gray-100 shadow-sm text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center mx-auto">
            <AlertCircle size={32} />
          </div>
          <h2 className="text-xl font-black text-gray-900">Order Not Found</h2>
          <p className="text-xs text-gray-500">
            {error || `We could not locate any order with ID "${orderNumber}". Please double-check your order number.`}
          </p>
          <div className="pt-2 flex flex-col gap-2">
            <Link
              href="/orders"
              className="py-2.5 px-4 bg-primary text-white text-xs font-bold rounded-xl hover:bg-primary/90 transition-all shadow-xs"
            >
              Back to Order Tracking
            </Link>
            <Link
              href="/"
              className="py-2.5 px-4 bg-gray-100 text-gray-700 text-xs font-bold rounded-xl hover:bg-gray-200 transition-all"
            >
              Browse Catalog
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const orderDate = new Date(order.created_at);
  const formattedDate = orderDate.toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
  const formattedTime = orderDate.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit'
  });

  // Estimated delivery (placed date + 5 days)
  const deliveryDate = new Date(orderDate);
  deliveryDate.setDate(deliveryDate.getDate() + 5);
  const formattedDeliveryDate = deliveryDate.toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });

  const sa = order.shipping_address || {};

  return (
    <div className="min-h-screen bg-gray-50/60 pb-20 text-gray-900">
      {/* Top Header Bar */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-30 shadow-xs">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <button
            onClick={() => router.push('/orders')}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-700 hover:text-primary transition-colors cursor-pointer py-1 -ml-1"
          >
            <ChevronLeft size={18} className="stroke-[2.5]" />
            <span>All Orders</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-bold text-gray-700 hover:bg-gray-50 transition-colors shadow-xs cursor-pointer"
            >
              <Printer size={13} />
              <span>Print Invoice</span>
            </button>
            <Link
              href="/help"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-xs font-bold hover:bg-primary/20 transition-colors cursor-pointer"
            >
              <Headphones size={13} />
              <span>Help</span>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        {/* Order Header Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-100">
            <div>
              <div className="flex items-center gap-3">
                <span className="text-xs uppercase font-extrabold tracking-wider text-gray-400">Order ID</span>
                <span className="text-xl sm:text-2xl font-black text-gray-900 font-mono tracking-tight">
                  {order.order_number}
                </span>
                <button
                  type="button"
                  onClick={handleCopyOrderNumber}
                  title="Copy Order ID"
                  className="p-1 rounded-md text-gray-400 hover:text-primary hover:bg-gray-100 transition-colors cursor-pointer"
                >
                  {copied ? <Check size={16} className="text-emerald-600" /> : <Copy size={16} />}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1 flex items-center gap-1.5">
                <Calendar size={13} className="text-gray-400" />
                Placed on {formattedDate} at {formattedTime}
              </p>
            </div>

            <div className="flex sm:flex-col items-center sm:items-end justify-between gap-1">
              <span className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-extrabold uppercase tracking-wide border shadow-xs ${
                order.status === 'delivered' 
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                  : order.status === 'shipped' 
                  ? 'bg-blue-50 text-blue-700 border-blue-200'
                  : order.status === 'cancelled'
                  ? 'bg-rose-50 text-rose-700 border-rose-200'
                  : 'bg-amber-50 text-amber-700 border-amber-200'
              }`}>
                <span className="w-2 h-2 rounded-full bg-current animate-pulse"></span>
                {order.status}
              </span>
              <span className="text-xs text-gray-500 font-semibold mt-1">
                {order.payment_method} • {order.payment_status === 'paid' ? 'Paid' : 'Pending on Delivery'}
              </span>
            </div>
          </div>

          {/* Delivery Promise Banner */}
          {order.status !== 'cancelled' && (
            <div className="mt-6 p-4 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-primary/10 border border-emerald-200/80 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center flex-shrink-0 shadow-xs">
                  <Truck size={20} />
                </div>
                <div>
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-emerald-800">
                    {order.status === 'delivered' ? 'Delivered' : 'Estimated Delivery'}
                  </h4>
                  <p className="text-sm font-bold text-gray-900 mt-0.5">
                    {order.status === 'delivered' ? `Delivered on ${formattedDate}` : formattedDeliveryDate}
                  </p>
                </div>
              </div>
              <span className="text-xs font-bold text-emerald-700 bg-white/80 px-3 py-1 rounded-full border border-emerald-200/60 shadow-xs">
                Free Doorstep Delivery
              </span>
            </div>
          )}

          {/* Order Tracking Progress Stepper */}
          {order.status !== 'cancelled' && (
            <div className="mt-8 pt-6 border-t border-gray-100">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-gray-400 mb-6">
                Shipment Tracking
              </h4>

              {/* Stepper container */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 relative">
                {[
                  { step: 1, title: 'Order Placed', desc: 'Received & Verified' },
                  { step: 2, title: 'Confirmed', desc: 'Processing at Hub' },
                  { step: 3, title: 'In Transit', desc: 'Handed to Courier' },
                  { step: 5, title: 'Delivered', desc: 'Safe Doorstep Handover' }
                ].map((s, idx) => {
                  const isCompleted = currentStep >= s.step;
                  const isCurrent = currentStep === s.step;

                  return (
                    <div key={idx} className="flex flex-col items-center text-center relative z-10">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs transition-all shadow-xs ${
                        isCompleted
                          ? 'bg-primary text-white ring-4 ring-primary/20'
                          : isCurrent
                          ? 'bg-amber-500 text-white ring-4 ring-amber-500/20 animate-pulse'
                          : 'bg-gray-100 text-gray-400 border border-gray-200'
                      }`}>
                        {isCompleted ? <Check size={18} className="stroke-[3]" /> : idx + 1}
                      </div>

                      <h5 className={`text-xs font-bold mt-2.5 ${isCompleted ? 'text-gray-900' : 'text-gray-400'}`}>
                        {s.title}
                      </h5>
                      <p className="text-[10px] text-gray-400 mt-0.5 font-medium leading-tight">
                        {s.desc}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* 2-Column Details: Items (Left) & Summary + Address (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Items (2 spans) */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <h3 className="text-sm font-extrabold uppercase tracking-wider text-gray-900 flex items-center gap-2">
                  <Package size={16} className="text-primary" />
                  Items in this Order ({order.order_items?.length || 0})
                </h3>
              </div>

              <div className="divide-y divide-gray-100">
                {(order.order_items || []).map((item, idx) => (
                  <div key={idx} className="py-4 first:pt-1 last:pb-1 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gray-50 border border-gray-100 p-2 flex items-center justify-center flex-shrink-0">
                        <img
                          src={item.product_image || '/dash_camera.png'}
                          alt={item.product_name}
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-sm font-bold text-gray-900 leading-snug line-clamp-2">
                          {item.product_name}
                        </h4>
                        <div className="flex items-center gap-3 text-xs text-gray-500 mt-1 font-medium">
                          <span>Qty: <strong className="text-gray-800">{item.quantity}</strong></span>
                          <span>•</span>
                          <span>Price: <strong className="text-gray-800">{formatCurrency(item.unit_price)}</strong> each</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-50">
                      <div className="text-right">
                        <span className="text-[10px] uppercase text-gray-400 font-bold block sm:hidden">Item Total</span>
                        <span className="text-base font-black text-gray-900">
                          {formatCurrency(item.total_price || item.unit_price * item.quantity)}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleReorder(item)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-bold text-gray-700 hover:bg-primary hover:text-white hover:border-primary transition-all shadow-xs cursor-pointer"
                      >
                        <RotateCcw size={12} />
                        <span>Buy Again</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Need Help Box */}
            <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center flex-shrink-0">
                  <Headphones size={22} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-gray-900">Need assistance with your order?</h4>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Our 24x7 customer support team is available to assist you with delivery questions or changes.
                  </p>
                </div>
              </div>

              <Link
                href="/contact"
                className="px-5 py-2.5 bg-gray-900 text-white rounded-xl text-xs font-bold hover:bg-gray-800 transition-colors shadow-xs whitespace-nowrap"
              >
                Contact Support
              </Link>
            </div>
          </div>

          {/* Right Column: Shipping Address & Bill Breakdown */}
          <div className="space-y-6">
            {/* Delivery Address Card */}
            <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-xs space-y-3">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-gray-900 flex items-center gap-2 pb-2 border-b border-gray-100">
                <MapPin size={15} className="text-primary" />
                Delivery Address
              </h3>

              <div className="space-y-2 text-xs">
                <p className="font-extrabold text-sm text-gray-900">
                  {sa.fullName || order.customer_name}
                </p>

                <p className="text-gray-600 leading-relaxed font-medium">
                  {sa.street}
                  {sa.landmark ? `, Near ${sa.landmark}` : ''}
                  <br />
                  {sa.city}, {sa.state} - <strong className="text-gray-800 font-bold">{sa.pincode}</strong>
                  <br />
                  {sa.country || 'India'}
                </p>

                <div className="pt-2 border-t border-gray-100 space-y-1">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Phone size={13} className="text-gray-400" />
                    <span>{order.customer_phone || sa.phone || 'Phone not available'}</span>
                  </div>

                  {sa.alternatePhone && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Phone size={13} className="text-gray-400" />
                      <span>Alt: {sa.alternatePhone}</span>
                    </div>
                  )}

                  <div className="flex items-center gap-2 text-gray-600">
                    <Mail size={13} className="text-gray-400" />
                    <span className="truncate">{order.customer_email || sa.email}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bill & Payment Summary Card */}
            <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-xs space-y-4">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-gray-900 flex items-center gap-2 pb-2 border-b border-gray-100">
                <CreditCard size={15} className="text-primary" />
                Payment Summary
              </h3>

              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between text-gray-600 font-medium">
                  <span>Items Subtotal</span>
                  <span>{formatCurrency(order.subtotal || order.total_amount)}</span>
                </div>

                <div className="flex justify-between text-gray-600 font-medium">
                  <span>Delivery Charges</span>
                  <span className="text-emerald-600 font-bold">FREE</span>
                </div>

                {order.discount_amount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-bold">
                    <span>Coupon Discount {order.coupon_code ? `(${order.coupon_code})` : ''}</span>
                    <span>-{formatCurrency(order.discount_amount)}</span>
                  </div>
                )}

                <div className="pt-3 border-t border-gray-100 flex justify-between items-center text-sm font-black text-gray-900">
                  <span>Total Amount</span>
                  <span className="text-lg text-primary font-black">
                    {formatCurrency(order.total_amount)}
                  </span>
                </div>
              </div>

              <div className="pt-3 border-t border-gray-100 bg-gray-50/80 p-3 rounded-xl flex items-center justify-between text-xs">
                <span className="text-gray-500 font-semibold">Payment Mode:</span>
                <span className="font-extrabold text-gray-800">{order.payment_method}</span>
              </div>
            </div>

            {/* Security Guarantee */}
            <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200/80 flex items-center gap-3 text-xs text-gray-600">
              <ShieldCheck size={20} className="text-primary flex-shrink-0" />
              <span>100% Genuine EveryJust Guarantee. Inspect parcel at doorstep before paying.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
