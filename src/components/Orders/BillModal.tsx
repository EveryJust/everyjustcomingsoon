'use client';

import React from 'react';
import { X, Printer, CheckCircle2, ShieldCheck, Download, MapPin, Phone, Mail, FileText } from 'lucide-react';
import { formatCurrency } from '@/utils/currency';

interface BillModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: any;
}

export default function BillModal({ isOpen, onClose, order }: BillModalProps) {
  if (!isOpen || !order) return null;

  const sa = order.shipping_address || {};
  const orderDate = new Date(order.created_at);
  const formattedOrderDate = orderDate.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
      <div 
        className="bg-white w-full max-w-2xl rounded-2xl sm:rounded-3xl shadow-2xl border border-gray-100 overflow-hidden my-auto max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Bar */}
        <div className="p-4 sm:p-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <FileText size={18} />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-gray-900 leading-tight">
                Bill & Invoice Details
              </h3>
              <p className="text-[11px] text-gray-500 font-mono">
                Order #{order.order_number}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={handlePrint}
              type="button"
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-bold text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
              title="Print Bill"
            >
              <Printer size={13} />
              <span className="hidden sm:inline">Print</span>
            </button>
            <button
              onClick={onClose}
              type="button"
              className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Modal Body / Printable Invoice */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 text-gray-900 text-xs">
          
          {/* Header Brand & Delivered Badge */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-gray-100">
            <div>
              <span className="text-lg font-black tracking-tight text-[#4611C8]">
                Every<span className="text-[#F9BC16]">Just</span>
              </span>
              <p className="text-[10px] text-gray-400 mt-0.5">
                Official Purchase Receipt & Tax Invoice
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <CheckCircle2 size={13} className="stroke-[2.5]" />
                Delivered & Verified
              </span>
            </div>
          </div>

          {/* Info Grid: Invoice Details & Billed To */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-gray-50/70 p-4 rounded-xl border border-gray-100">
            <div className="space-y-1">
              <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Order Information</p>
              <p><strong className="text-gray-800">Invoice No:</strong> INV-{order.order_number}</p>
              <p><strong className="text-gray-800">Order Date:</strong> {formattedOrderDate}</p>
              <p><strong className="text-gray-800">Payment:</strong> {order.payment_method} ({order.payment_status === 'paid' ? 'Paid' : 'Settled on Delivery'})</p>
            </div>

            <div className="space-y-1">
              <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Billed & Delivered To</p>
              <p className="font-bold text-gray-900">{sa.fullName || order.customer_name}</p>
              <p className="text-gray-600 leading-snug">
                {sa.street}{sa.landmark ? `, ${sa.landmark}` : ''}, {sa.city}, {sa.state} - {sa.pincode}
              </p>
              <p className="text-gray-600">
                {order.customer_phone || sa.phone} {order.customer_email ? `• ${order.customer_email}` : ''}
              </p>
            </div>
          </div>

          {/* Items Table */}
          <div className="border border-gray-100 rounded-xl overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                  <th className="py-2.5 px-3">Item Description</th>
                  <th className="py-2.5 px-3 text-center">Qty</th>
                  <th className="py-2.5 px-3 text-right">Unit Price</th>
                  <th className="py-2.5 px-3 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {(order.order_items || []).map((item: any, idx: number) => (
                  <tr key={idx} className="hover:bg-gray-50/50">
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={item.product_image || '/dash_camera.png'}
                          alt={item.product_name}
                          className="w-8 h-8 rounded-md object-contain border border-gray-100 p-0.5 bg-white flex-shrink-0"
                        />
                        <span className="font-semibold text-gray-800 text-xs line-clamp-1">
                          {item.product_name}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-center font-medium text-gray-700">
                      {item.quantity}
                    </td>
                    <td className="py-3 px-3 text-right font-medium text-gray-700">
                      {formatCurrency(item.unit_price)}
                    </td>
                    <td className="py-3 px-3 text-right font-bold text-gray-900">
                      {formatCurrency(item.total_price || item.unit_price * item.quantity)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Price Breakdown */}
          <div className="flex justify-end pt-2">
            <div className="w-full sm:w-64 space-y-1.5 text-xs">
              <div className="flex justify-between text-gray-600">
                <span>Items Subtotal:</span>
                <span className="font-semibold">{formatCurrency(order.subtotal || order.total_amount)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Shipping & Handling:</span>
                <span className="text-emerald-600 font-bold">FREE</span>
              </div>
              {order.discount_amount > 0 && (
                <div className="flex justify-between text-emerald-600 font-semibold">
                  <span>Coupon Discount:</span>
                  <span>-{formatCurrency(order.discount_amount)}</span>
                </div>
              )}
              {order.tax_amount > 0 && (
                <div className="flex justify-between text-gray-600">
                  <span>Estimated Taxes (GST):</span>
                  <span>{formatCurrency(order.tax_amount)}</span>
                </div>
              )}
              <div className="pt-2 border-t border-gray-200 flex justify-between items-center text-sm font-black text-gray-900">
                <span>Total Paid:</span>
                <span className="text-base text-primary font-black">
                  {formatCurrency(order.total_amount)}
                </span>
              </div>
            </div>
          </div>

          {/* Guarantee / Footer Note */}
          <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-500">
            <div className="flex items-center gap-1.5">
              <ShieldCheck size={14} className="text-emerald-600" />
              <span>Authentic EveryJust Verified Product Guarantee</span>
            </div>
            <span className="text-[10px] text-gray-400">Thank you for shopping!</span>
          </div>

        </div>

        {/* Modal Bottom Actions */}
        <div className="p-3 sm:p-4 bg-gray-50 border-t border-gray-100 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer"
          >
            Close
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="px-4 py-2 text-xs font-bold text-white bg-primary rounded-xl hover:bg-primary/95 transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <Printer size={13} />
            <span>Print Invoice</span>
          </button>
        </div>
      </div>
    </div>
  );
}
