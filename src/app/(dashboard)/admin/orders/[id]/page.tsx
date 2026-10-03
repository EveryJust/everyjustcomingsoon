'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { getAdminOrderById, Order } from '@/utils/supabase/adminData';
import { formatCurrency } from '@/utils/currency';
import { 
  ArrowLeft, 
  ShoppingBag, 
  Printer, 
  CheckCircle2, 
  Clock, 
  Truck, 
  Package, 
  XCircle, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Tag, 
  ShieldCheck, 
  CreditCard,
  Building,
  Loader2
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params?.id as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (!orderId) return;

    const loadOrder = async () => {
      setLoading(true);
      const res = await getAdminOrderById(orderId);
      if (res.order) {
        setOrder(res.order);
      } else {
        toast.error(res.error || 'Order not found');
      }
      setLoading(false);
    };

    loadOrder();
  }, [orderId]);

  const handleStatusChange = async (newStatus: string) => {
    if (!order) return;
    setUpdating(true);
    try {
      const res = await fetch(`/api/admin/orders/${order.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to update status');
      }

      setOrder({ ...order, status: newStatus as any });
      toast.success(`Order status updated to ${newStatus}`);
    } catch (err: any) {
      toast.error(err.message || 'Error updating order status');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto py-16 flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-8 h-8 text-[#6A43FB] animate-spin" />
        <p className="text-xs font-bold text-gray-500">Loading Order Details...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-xl mx-auto py-16 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center mx-auto">
          <XCircle size={32} />
        </div>
        <h2 className="text-xl font-black text-gray-900">Order Not Found</h2>
        <p className="text-xs text-gray-500">We could not locate this order in the database.</p>
        <Link
          href="/admin/orders"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#6A43FB] text-white text-xs font-bold rounded-xl shadow-sm"
        >
          <ArrowLeft size={14} />
          <span>Back to All Orders</span>
        </Link>
      </div>
    );
  }

  const shipping = order.shipping_address || {};
  const dateFormatted = new Date(order.created_at).toLocaleDateString('en-IN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  // Timeline steps
  const steps = ['pending', 'processing', 'shipped', 'delivered'];
  const currentStepIdx = steps.indexOf(order.status.toLowerCase());

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20">
      {/* Top Navigation & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
        <div>
          <Link
            href="/admin/orders"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-[#6A43FB] transition-colors mb-2"
          >
            <ArrowLeft size={14} />
            <span>Back to Orders</span>
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-black text-gray-900 tracking-tight font-mono">
              Order #{order.order_number}
            </h1>
          </div>
          <p className="text-xs text-gray-400 mt-1 flex items-center gap-1.5">
            <Calendar size={13} />
            Placed on {dateFormatted}
          </p>
        </div>

        {/* Actions: Print & Status dropdown */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => window.print()}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 hover:border-gray-300 text-gray-700 text-xs font-bold hover:bg-gray-50 transition-all cursor-pointer"
          >
            <Printer size={14} />
            <span>Print Invoice</span>
          </button>

          <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-xl">
            <span className="text-xs font-bold text-gray-500">Status:</span>
            <select
              value={order.status}
              disabled={updating}
              onChange={(e) => handleStatusChange(e.target.value)}
              className="bg-transparent text-xs font-black text-gray-900 focus:outline-none cursor-pointer"
            >
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      {/* Order Fulfillment Timeline */}
      {order.status !== 'cancelled' && (
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-6">
            Fulfillment Progress
          </h3>
          <div className="relative flex items-center justify-between">
            {/* Background line */}
            <div className="absolute left-6 right-6 top-1/2 -translate-y-1/2 h-1 bg-gray-100 -z-0" />
            {/* Active progress line */}
            <div 
              className="absolute left-6 top-1/2 -translate-y-1/2 h-1 bg-[#6A43FB] transition-all duration-500 -z-0"
              style={{
                width: currentStepIdx >= 0 ? `${(currentStepIdx / (steps.length - 1)) * 92}%` : '0%'
              }}
            />

            {[
              { id: 'pending', label: 'Order Placed', icon: Clock },
              { id: 'processing', label: 'Processing', icon: Package },
              { id: 'shipped', label: 'Shipped', icon: Truck },
              { id: 'delivered', label: 'Delivered', icon: CheckCircle2 }
            ].map((step, idx) => {
              const isCompleted = currentStepIdx >= idx;
              const isCurrent = currentStepIdx === idx;
              const Icon = step.icon;

              return (
                <div key={step.id} className="flex flex-col items-center text-center relative z-10">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                    isCompleted 
                      ? 'bg-[#6A43FB] text-white shadow-md shadow-[#6A43FB]/30' 
                      : 'bg-white border-2 border-gray-200 text-gray-400'
                  }`}>
                    <Icon size={18} />
                  </div>
                  <span className={`text-xs mt-2 font-bold ${
                    isCurrent ? 'text-[#6A43FB]' : isCompleted ? 'text-gray-900' : 'text-gray-400'
                  }`}>
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Main 2-Column Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COLUMN: Items in Order (col-span-7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <h3 className="text-sm font-black text-gray-900 uppercase tracking-tight flex items-center gap-2">
                <ShoppingBag size={16} className="text-[#6A43FB]" />
                <span>Items in Order ({order.order_items?.length || 0})</span>
              </h3>
              <span className="text-xs font-bold text-gray-400">
                Merchant: EveryJust Official
              </span>
            </div>

            <div className="divide-y divide-gray-100">
              {order.order_items && order.order_items.length > 0 ? (
                order.order_items.map((item) => (
                  <div key={item.id || item.product_name} className="py-4 flex gap-4 items-center">
                    <div className="w-16 h-16 bg-gray-50 rounded-2xl border border-gray-100 p-1 flex-shrink-0 flex items-center justify-center overflow-hidden">
                      <img
                        src={item.product_image || '/dash_camera.png'}
                        alt={item.product_name}
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs sm:text-sm font-bold text-gray-900 leading-snug truncate">
                        {item.product_name}
                      </h4>
                      <p className="text-xs text-gray-400 mt-1">
                        Price: {formatCurrency(item.unit_price)} × {item.quantity} Qty
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-black text-gray-900">
                        {formatCurrency(item.total_price || item.unit_price * item.quantity)}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-8 text-center text-xs text-gray-400 italic">
                  No line items found for this order
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
              <span>Standard Express Packaging</span>
              <span className="text-emerald-600 font-bold flex items-center gap-1">
                <CheckCircle2 size={13} /> Free Shipping Guarantee
              </span>
            </div>
          </div>

          {/* Customer & Delivery Address Card */}
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] space-y-4">
            <h3 className="text-sm font-black text-gray-900 uppercase tracking-tight flex items-center gap-2 pb-3 border-b border-gray-100">
              <MapPin size={16} className="text-[#6A43FB]" />
              <span>Customer &amp; Shipping Destination</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1.5 p-4 rounded-2xl bg-gray-50/70 border border-gray-100">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Customer Details</span>
                <p className="font-bold text-gray-950 text-sm">{order.customer_name}</p>
                <p className="text-gray-600 flex items-center gap-1.5">
                  <Mail size={12} className="text-gray-400" />
                  {order.customer_email}
                </p>
                <p className="text-gray-600 flex items-center gap-1.5">
                  <Phone size={12} className="text-gray-400" />
                  {order.customer_phone || 'No phone'}
                </p>
                {shipping.alternatePhone && (
                  <p className="text-gray-500 text-[11px]">Alt Contact: {shipping.alternatePhone}</p>
                )}
              </div>

              <div className="space-y-1.5 p-4 rounded-2xl bg-gray-50/70 border border-gray-100">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Shipping Address</span>
                <p className="text-gray-800 leading-relaxed font-medium">
                  {shipping.street || 'Address on file'}
                  {shipping.landmark ? `, ${shipping.landmark}` : ''}
                </p>
                <p className="font-bold text-gray-950">
                  {shipping.city || ''}{shipping.city && shipping.state ? ', ' : ''}{shipping.state || ''} - {shipping.pincode || ''}
                </p>
                <p className="text-gray-400 text-[11px]">{shipping.country || 'India'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Order Summary & Financials (col-span-5) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] space-y-4">
            <h3 className="text-sm font-black text-gray-900 uppercase tracking-tight pb-3 border-b border-gray-100">
              Payment &amp; Financial Summary
            </h3>

            {/* Payment Method Badge */}
            <div className="p-4 rounded-2xl bg-[#6A43FB]/5 border border-[#6A43FB]/20 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-[#6A43FB] uppercase tracking-wider block">Payment Method</span>
                <span className="font-black text-gray-950 text-sm">
                  {order.payment_method || 'Cash on Delivery (Free COD)'}
                </span>
              </div>
              <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                order.payment_status === 'paid' 
                  ? 'bg-emerald-100 text-emerald-800' 
                  : 'bg-amber-100 text-amber-800'
              }`}>
                {order.payment_status === 'paid' ? 'PAID' : 'PAY ON ARRIVAL'}
              </span>
            </div>

            {/* Price Calculations */}
            <div className="space-y-3 pt-2 text-xs">
              <div className="flex justify-between text-gray-600">
                <span>Items Subtotal</span>
                <span className="font-bold text-gray-900">{formatCurrency(order.subtotal || order.total_amount)}</span>
              </div>

              {order.discount_amount > 0 && (
                <div className="flex justify-between text-emerald-700 font-bold bg-emerald-50/70 p-2.5 rounded-xl border border-emerald-100">
                  <span className="flex items-center gap-1.5">
                    <Tag size={13} />
                    Coupon Discount {order.coupon_code ? `(${order.coupon_code})` : ''}
                  </span>
                  <span>- {formatCurrency(order.discount_amount)}</span>
                </div>
              )}

              <div className="flex justify-between text-gray-600">
                <span>Estimated Shipping</span>
                <span className="font-bold text-emerald-600 uppercase">FREE</span>
              </div>

              <div className="flex justify-between text-gray-600">
                <span>Taxes &amp; Surcharges</span>
                <span className="font-bold text-gray-900">₹0.00</span>
              </div>

              <div className="pt-3 border-t border-gray-100 flex justify-between items-baseline">
                <span className="text-sm font-black text-gray-900">Final Order Total</span>
                <span className="text-2xl font-black text-[#6A43FB]">
                  {formatCurrency(order.total_amount)}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Help & Audit Box */}
          <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] text-xs space-y-2 text-gray-500">
            <div className="flex items-center gap-2 font-bold text-gray-900">
              <ShieldCheck size={16} className="text-[#6A43FB]" />
              <span>Verified Storefront Order</span>
            </div>
            <p className="text-[11px] leading-relaxed">
              Order #{order.order_number} is stored in Supabase with end-to-end buyer protection and verified merchant dispatch.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
