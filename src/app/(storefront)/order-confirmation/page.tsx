'use client';

import React, { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { formatCurrency } from '@/utils/currency';
import { 
  CheckCircle2, 
  Copy, 
  Check, 
  Package, 
  Truck, 
  Clock, 
  MapPin, 
  ArrowRight, 
  Printer, 
  Mail, 
  ShoppingBag,
  ShieldCheck 
} from 'lucide-react';
import toast from 'react-hot-toast';

function OrderConfirmationContent() {
  const searchParams = useSearchParams();
  const orderNumberParam = searchParams.get('orderNumber') || searchParams.get('order_number') || '';
  const [copied, setCopied] = useState(false);
  const [orderData, setOrderData] = useState<any>(null);

  useEffect(() => {
    // Try to load cached order data from session storage for instant high-fidelity details
    try {
      const stored = sessionStorage.getItem('lastOrder');
      if (stored) {
        setOrderData(JSON.parse(stored));
      }
    } catch {
      // Ignored
    }
  }, []);

  const orderNumber = orderNumberParam || orderData?.orderNumber || 'EJ-ORDER-CONFIRMED';
  const customerEmail = orderData?.customerEmail || 'your email';

  const handleCopyOrderNumber = () => {
    navigator.clipboard.writeText(orderNumber);
    setCopied(true);
    toast.success('Order number copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-6">
        
        {/* Success Card */}
        <div className="bg-white rounded-3xl p-8 sm:p-10 text-center shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100">
          <div className="w-20 h-20 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-5 shadow-sm animate-in zoom-in duration-300">
            <CheckCircle2 size={44} />
          </div>

          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 mb-3 border border-emerald-200">
            Free Cash on Delivery Confirmed
          </span>

          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
            Order Placed Successfully!
          </h1>
          <p className="text-sm text-gray-500 mt-2 max-w-md mx-auto">
            Thank you for shopping with us. We have received your order and our team is preparing it for shipment.
          </p>

          {/* Generated Order ID Box */}
          <div className="mt-6 p-4 rounded-2xl bg-gray-50 border border-gray-200 inline-flex flex-col sm:flex-row items-center gap-3">
            <div className="text-left">
              <span className="text-[10px] uppercase font-bold text-gray-400 block tracking-wider">Generated Order ID</span>
              <span className="text-base font-black text-gray-900 font-mono tracking-tight">{orderNumber}</span>
            </div>
            <button
              type="button"
              onClick={handleCopyOrderNumber}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-gray-200 text-xs font-bold text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer shadow-xs"
            >
              {copied ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
              <span>{copied ? 'Copied' : 'Copy ID'}</span>
            </button>
          </div>

          {/* Email Notice */}
          <div className="mt-5 flex items-center justify-center gap-2 text-xs text-gray-500">
            <Mail size={14} className="text-primary" />
            <span>Order confirmation and receipt sent to <strong className="text-gray-800">{customerEmail}</strong></span>
          </div>
        </div>

        {/* Cash on Delivery Payment Alert */}
        <div className="bg-amber-500/10 border border-amber-300/80 rounded-3xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center font-bold flex-shrink-0">
              ₹
            </div>
            <div>
              <h3 className="font-bold text-amber-950 text-sm">Pay on Delivery (Zero Advance Payment)</h3>
              <p className="text-xs text-amber-900/80 mt-0.5">
                Please keep cash or UPI QR scanner ready when the courier arrives.
              </p>
            </div>
          </div>
          {orderData?.totalAmount && (
            <div className="text-right flex-shrink-0">
              <span className="text-xs text-amber-800 font-medium block">Total Payable</span>
              <span className="text-xl font-black text-amber-950">{formatCurrency(orderData.totalAmount)}</span>
            </div>
          )}
        </div>

        {/* Order Fulfillment Timeline */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100">
          <h3 className="font-bold text-gray-900 text-base mb-6">Delivery Progress</h3>

          <div className="grid grid-cols-4 relative">
            <div className="absolute top-4 left-6 right-6 h-0.5 bg-gray-200 -z-0" />
            
            {/* Step 1 */}
            <div className="text-center relative z-10 flex flex-col items-center">
              <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs font-bold mb-2 shadow-sm">
                <Check size={16} />
              </div>
              <span className="text-xs font-bold text-gray-900 block">Placed</span>
              <span className="text-[10px] text-gray-400">Today</span>
            </div>

            {/* Step 2 */}
            <div className="text-center relative z-10 flex flex-col items-center">
              <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold mb-2 shadow-sm animate-pulse">
                <Clock size={16} />
              </div>
              <span className="text-xs font-bold text-gray-900 block">Processing</span>
              <span className="text-[10px] text-gray-400">Being Packed</span>
            </div>

            {/* Step 3 */}
            <div className="text-center relative z-10 flex flex-col items-center">
              <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center text-xs font-bold mb-2">
                <Truck size={16} />
              </div>
              <span className="text-xs font-medium text-gray-400 block">Shipped</span>
              <span className="text-[10px] text-gray-400">In Transit</span>
            </div>

            {/* Step 4 */}
            <div className="text-center relative z-10 flex flex-col items-center">
              <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center text-xs font-bold mb-2">
                <Package size={16} />
              </div>
              <span className="text-xs font-medium text-gray-400 block">Delivered</span>
              <span className="text-[10px] text-gray-400">Est. 3-5 Days</span>
            </div>
          </div>
        </div>

        {/* Address & Items Summary */}
        {orderData && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 space-y-6">
            <div className="flex items-start justify-between border-b border-gray-100 pb-4">
              <div>
                <h4 className="font-bold text-xs uppercase text-gray-400 tracking-wider">Shipping Address</h4>
                <p className="text-sm text-gray-800 font-medium mt-1 leading-relaxed">
                  <strong>{orderData.customerName}</strong><br/>
                  {orderData.shippingAddress?.street}<br/>
                  {orderData.shippingAddress?.city}, {orderData.shippingAddress?.state} - {orderData.shippingAddress?.pincode}<br/>
                  <span className="text-gray-500 text-xs">Phone: {orderData.customerPhone}</span>
                  {orderData.shippingAddress?.alternatePhone && (
                    <span className="text-gray-500 text-xs block">Alt Phone: {orderData.shippingAddress.alternatePhone}</span>
                  )}
                </p>
              </div>
              <div className="text-right">
                <h4 className="font-bold text-xs uppercase text-gray-400 tracking-wider">Payment Method</h4>
                <span className="inline-block mt-1 text-sm font-bold text-primary">Cash on Delivery (Free)</span>
              </div>
            </div>

            {/* Items */}
            <div>
              <h4 className="font-bold text-xs uppercase text-gray-400 tracking-wider mb-3">Order Items</h4>
              <div className="divide-y divide-gray-100">
                {(orderData.items || []).map((item: any, idx: number) => (
                  <div key={idx} className="py-3 flex items-center justify-between gap-4 text-xs">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg bg-gray-50 p-1 flex-shrink-0 border border-gray-100 flex items-center justify-center">
                        <img src={item.image} alt={item.name} className="w-full h-full object-contain" />
                      </div>
                      <div>
                        <div className="font-bold text-gray-900">{item.name}</div>
                        <div className="text-gray-400">Qty: {item.qty}</div>
                      </div>
                    </div>
                    <div className="font-black text-gray-900 text-sm">
                      {formatCurrency(item.price * item.qty)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
          <button
            type="button"
            onClick={handlePrint}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 py-3 px-5 rounded-2xl border border-gray-300 hover:border-gray-400 text-gray-700 font-bold text-xs sm:text-sm bg-white hover:bg-gray-50 transition-colors shadow-xs cursor-pointer"
          >
            <Printer size={15} />
            <span>Print Receipt</span>
          </button>

          <div className="w-full sm:w-auto flex flex-col sm:flex-row items-center gap-3">
            <Link
              href={`/orders/${encodeURIComponent(orderNumber)}`}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 py-3 px-5 rounded-2xl border border-primary/30 hover:border-primary text-primary font-bold text-xs sm:text-sm bg-primary/5 hover:bg-primary/10 transition-colors cursor-pointer"
            >
              <Package size={15} />
              <span>Track & View Details</span>
            </Link>

            <Link
              href="/"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 py-3 px-6 rounded-2xl bg-primary hover:bg-primary/90 text-white font-extrabold text-xs sm:text-sm tracking-wide shadow-md shadow-primary/20 transition-all cursor-pointer"
            >
              <span>Continue Shopping</span>
              <ArrowRight size={15} />
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}

export default function OrderConfirmationPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-20">
        <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    }>
      <OrderConfirmationContent />
    </Suspense>
  );
}

