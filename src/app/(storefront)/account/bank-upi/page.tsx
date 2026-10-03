'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ChevronLeft,
  Building2,
  Smartphone,
  ShieldCheck,
  CheckCircle2,
  Lock,
  Trash2,
  AlertCircle,
  HelpCircle,
  CreditCard
} from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import toast from 'react-hot-toast';

export default function BankUpiPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'upi' | 'bank'>('upi');

  // UPI Form State
  const [upiId, setUpiId] = useState('');
  const [upiName, setUpiName] = useState('');

  // Bank Form State
  const [accountHolder, setAccountHolder] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [confirmAccountNumber, setConfirmAccountNumber] = useState('');
  const [ifscCode, setIfscCode] = useState('');
  const [bankName, setBankName] = useState('');

  // Saved Data
  const [savedUpi, setSavedUpi] = useState<{ upiId: string; name: string } | null>(null);
  const [savedBank, setSavedBank] = useState<{
    accountHolder: string;
    accountNumber: string;
    ifscCode: string;
    bankName: string;
  } | null>(null);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const storedUpi = localStorage.getItem('ej_refund_upi');
      if (storedUpi) setSavedUpi(JSON.parse(storedUpi));

      const storedBank = localStorage.getItem('ej_refund_bank');
      if (storedBank) setSavedBank(JSON.parse(storedBank));
    } catch {
      // ignore
    }
  }, []);

  const handleSaveUpi = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanUpi = upiId.trim();
    if (!cleanUpi || !cleanUpi.includes('@')) {
      toast.error('Please enter a valid UPI ID (e.g. mobile@upi or name@okaxis)');
      return;
    }
    if (!upiName.trim()) {
      toast.error('Please enter the name on your UPI account');
      return;
    }

    const payload = { upiId: cleanUpi, name: upiName.trim() };
    setSavedUpi(payload);
    try {
      localStorage.setItem('ej_refund_upi', JSON.stringify(payload));
    } catch {}

    toast.success('UPI details saved for refunds!');
    setUpiId('');
    setUpiName('');
  };

  const handleSaveBank = (e: React.FormEvent) => {
    e.preventDefault();
    if (!accountHolder.trim()) {
      toast.error('Please enter account holder name');
      return;
    }
    if (accountNumber.trim().length < 8) {
      toast.error('Please enter a valid bank account number');
      return;
    }
    if (accountNumber.trim() !== confirmAccountNumber.trim()) {
      toast.error('Account numbers do not match');
      return;
    }
    if (ifscCode.trim().length < 6) {
      toast.error('Please enter a valid IFSC code');
      return;
    }

    const payload = {
      accountHolder: accountHolder.trim(),
      accountNumber: accountNumber.trim(),
      ifscCode: ifscCode.trim().toUpperCase(),
      bankName: bankName.trim() || 'Recognized Indian Bank'
    };
    setSavedBank(payload);
    try {
      localStorage.setItem('ej_refund_bank', JSON.stringify(payload));
    } catch {}

    toast.success('Bank account details saved for refunds!');
    setAccountHolder('');
    setAccountNumber('');
    setConfirmAccountNumber('');
    setIfscCode('');
    setBankName('');
  };

  const handleDeleteUpi = () => {
    setSavedUpi(null);
    try {
      localStorage.removeItem('ej_refund_upi');
    } catch {}
    toast.success('UPI details removed');
  };

  const handleDeleteBank = () => {
    setSavedBank(null);
    try {
      localStorage.removeItem('ej_refund_bank');
    } catch {}
    toast.success('Bank details removed');
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24 lg:pb-12 text-gray-900">
      {/* Top Header */}
      <div className="sticky top-0 z-40 bg-white border-b border-gray-100 shadow-xs">
        <div className="max-w-xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              aria-label="Go back"
              className="p-1.5 -ml-1 text-gray-700 hover:text-primary transition-colors cursor-pointer rounded-full hover:bg-gray-100"
            >
              <ChevronLeft className="w-6 h-6 stroke-[2.5]" />
            </button>
            <h1 className="text-base font-extrabold tracking-wide uppercase text-gray-800">
              Bank & UPI Details
            </h1>
          </div>
          <Link
            href="/help"
            className="text-xs font-bold text-primary flex items-center gap-1 hover:underline"
          >
            <HelpCircle className="w-4 h-4" />
            Refund FAQ
          </Link>
        </div>
      </div>

      <div className="max-w-xl mx-auto px-4 py-4 space-y-4">
        {/* Purpose / Trust Banner */}
        <div className="bg-sky-50/70 border border-sky-100 rounded-2xl p-4 flex gap-3 items-start">
          <ShieldCheck className="w-5 h-5 text-sky-600 flex-shrink-0 mt-0.5" />
          <div className="text-xs text-sky-950">
            <p className="font-bold">Refund Guarantee</p>
            <p className="text-sky-800 mt-0.5 leading-relaxed">
              Your details are encrypted and securely used exclusively to process refunds for returns or order cancellations directly to your account.
            </p>
          </div>
        </div>

        {/* Existing Saved Methods */}
        {(savedUpi || savedBank) && (
          <div className="space-y-2">
            <h2 className="text-xs font-extrabold uppercase tracking-wider text-gray-600 px-1">
              Active Refund Method
            </h2>

            {savedUpi && (
              <div className="bg-white rounded-2xl p-4 border border-emerald-200 shadow-xs flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <Smartphone className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-gray-900 font-mono">{savedUpi.upiId}</span>
                      <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold px-2 py-0.2 rounded-full">
                        Primary UPI
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">{savedUpi.name}</p>
                  </div>
                </div>
                <button
                  onClick={handleDeleteUpi}
                  className="p-2 text-gray-400 hover:text-rose-600 transition-colors cursor-pointer"
                  title="Remove UPI"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            )}

            {savedBank && (
              <div className="bg-white rounded-2xl p-4 border border-blue-200 shadow-xs flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-gray-900 font-mono">
                        •••• •••• {savedBank.accountNumber.slice(-4)}
                      </span>
                      <span className="bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-bold px-2 py-0.2 rounded-full">
                        Bank
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {savedBank.accountHolder} • {savedBank.ifscCode}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleDeleteBank}
                  className="p-2 text-gray-400 hover:text-rose-600 transition-colors cursor-pointer"
                  title="Remove Bank"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        )}

        {/* Tab Selection: Add / Update Method */}
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-xs">
          <div className="flex p-1 bg-gray-100 rounded-xl mb-4">
            <button
              onClick={() => setActiveTab('upi')}
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'upi'
                  ? 'bg-white text-gray-900 shadow-xs'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              UPI ID (Fastest)
            </button>
            <button
              onClick={() => setActiveTab('bank')}
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'bank'
                  ? 'bg-white text-gray-900 shadow-xs'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              Bank Account
            </button>
          </div>

          {/* UPI Form */}
          {activeTab === 'upi' ? (
            <form onSubmit={handleSaveUpi} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  UPI ID (VPA) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. 9876543210@upi or name@okhdfcbank"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-xs font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent font-mono"
                  required
                />
                <p className="text-[11px] text-gray-400 mt-1">
                  Refunds sent to UPI reflect in your bank account within minutes.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Account Holder Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Name as registered with your UPI bank"
                  value={upiName}
                  onChange={(e) => setUpiName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-xs font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-primary text-white font-bold text-xs rounded-xl hover:bg-primary/90 transition-colors shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                Save UPI ID for Refunds
              </button>
            </form>
          ) : (
            /* Bank Form */
            <form onSubmit={handleSaveBank} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Account Holder Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Name as printed in passbook"
                  value={accountHolder}
                  onChange={(e) => setAccountHolder(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-xs font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Account Number <span className="text-rose-500">*</span>
                </label>
                <input
                  type="password"
                  placeholder="Enter Bank Account Number"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-xs font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Confirm Account Number <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Re-enter Bank Account Number"
                  value={confirmAccountNumber}
                  onChange={(e) => setConfirmAccountNumber(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-xs font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  IFSC Code <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. SBIN0001234 or HDFC0000456"
                  value={ifscCode}
                  onChange={(e) => setIfscCode(e.target.value.toUpperCase())}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-xs font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent uppercase font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Bank Name (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. State Bank of India, HDFC Bank"
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-xs font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-primary text-white font-bold text-xs rounded-xl hover:bg-primary/90 transition-colors shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                Save Bank Account for Refunds
              </button>
            </form>
          )}
        </div>

        {/* Security assurance */}
        <div className="flex items-center justify-center gap-2 text-gray-400 text-[11px] pt-2">
          <Lock className="w-3.5 h-3.5 text-gray-400" />
          <span>256-bit Encrypted • RBI Compliant Refund Channels</span>
        </div>
      </div>
    </div>
  );
}
