'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ChevronLeft,
  Sparkles,
  Copy,
  Share2,
  Check,
  Gift,
  Users,
  Wallet,
  ArrowRight,
  ShieldCheck,
  HelpCircle
} from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import toast from 'react-hot-toast';

export default function InviteAndEarnPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [copied, setCopied] = useState(false);

  const referralCode = user
    ? `EJ${user.id.slice(0, 6).toUpperCase()}`
    : 'EVERYJUST100';

  const referralLink =
    typeof window !== 'undefined'
      ? `${window.location.origin}/signup?ref=${referralCode}`
      : `https://everyjust.com/signup?ref=${referralCode}`;

  const handleCopy = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(referralLink);
      setCopied(true);
      toast.success('Referral link copied to clipboard!');
      setTimeout(() => setCopied(false), 2500);
    } else {
      toast.success(`Referral Code: ${referralCode}`);
    }
  };

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(
      `Hey! Use my referral code ${referralCode} on EveryJust to get an exclusive discount on your first order: ${referralLink}`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'EveryJust - Unified Commerce',
          text: `Use my invite code ${referralCode} to get exclusive discount on EveryJust!`,
          url: referralLink
        });
      } catch {
        // User cancelled or unsupported
      }
    } else {
      handleCopy();
    }
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
              Invite Friends & Earn
            </h1>
          </div>
          <Link
            href="/help"
            className="text-xs font-bold text-primary flex items-center gap-1 hover:underline"
          >
            <HelpCircle className="w-4 h-4" />
            Rules
          </Link>
        </div>
      </div>

      <div className="max-w-xl mx-auto px-4 py-4 space-y-4">
        {/* Hero Card */}
        <div className="relative overflow-hidden bg-gradient-to-br from-emerald-600 via-teal-600 to-emerald-800 rounded-3xl p-6 text-white shadow-md">
          {/* Background decorative circles */}
          <div className="absolute -top-12 -right-12 w-44 h-44 bg-white/10 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -bottom-12 -left-12 w-44 h-44 bg-white/10 rounded-full blur-xl pointer-events-none" />

          <div className="relative z-10 flex flex-col items-center text-center">
            <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center mb-3 shadow-inner border border-white/25">
              <Gift className="w-7 h-7 text-white" />
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-xs text-xs font-extrabold mb-2 text-white border border-white/20">
              <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
              EARN ₹78 PER FRIEND
            </div>

            <h2 className="text-2xl font-black tracking-tight text-white mb-1">
              Invite Friends, Earn Cash
            </h2>
            <p className="text-xs text-emerald-100 max-w-xs leading-relaxed">
              Share your referral link with friends. When they place their first purchase, you get ₹78 added to your EveryJust Balance!
            </p>
          </div>
        </div>

        {/* Referral Code Card */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-xs space-y-4">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-wider text-gray-500 mb-2">
              Your Referral Code
            </p>
            <div className="flex items-center justify-between gap-3 p-3 bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl">
              <span className="font-mono font-black text-lg tracking-wider text-gray-800">
                {referralCode}
              </span>
              <button
                onClick={handleCopy}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary text-white text-xs font-bold rounded-lg hover:bg-primary/90 transition-all shadow-xs cursor-pointer"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Copied!' : 'Copy Code'}
              </button>
            </div>
          </div>

          {/* Quick Share Buttons */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <button
              onClick={handleShareWhatsApp}
              className="py-3 px-4 rounded-xl bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#128C7E] font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer border border-[#25D366]/20"
            >
              <Share2 className="w-4 h-4" />
              WhatsApp Share
            </button>
            <button
              onClick={handleNativeShare}
              className="py-3 px-4 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <Share2 className="w-4 h-4" />
              More Options
            </button>
          </div>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white rounded-2xl p-3.5 border border-gray-100 shadow-xs text-center">
            <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-1.5">
              <Users className="w-4 h-4" />
            </div>
            <p className="text-[10px] uppercase font-bold text-gray-400">Invited</p>
            <p className="text-base font-extrabold text-gray-800 mt-0.5">0</p>
          </div>

          <div className="bg-white rounded-2xl p-3.5 border border-gray-100 shadow-xs text-center">
            <div className="w-8 h-8 rounded-full bg-teal-50 text-teal-600 flex items-center justify-center mx-auto mb-1.5">
              <Wallet className="w-4 h-4" />
            </div>
            <p className="text-[10px] uppercase font-bold text-gray-400">Earned</p>
            <p className="text-base font-extrabold text-gray-800 mt-0.5">₹0</p>
          </div>

          <div className="bg-white rounded-2xl p-3.5 border border-gray-100 shadow-xs text-center">
            <div className="w-8 h-8 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center mx-auto mb-1.5">
              <Sparkles className="w-4 h-4" />
            </div>
            <p className="text-[10px] uppercase font-bold text-gray-400">Balance</p>
            <p className="text-base font-extrabold text-gray-800 mt-0.5">₹0</p>
          </div>
        </div>

        {/* How It Works */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-xs space-y-4">
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-gray-700">
            How It Works
          </h3>

          <div className="space-y-3">
            <div className="flex gap-3 items-start">
              <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-700 text-xs font-black flex items-center justify-center flex-shrink-0 mt-0.5">
                1
              </div>
              <div className="text-xs">
                <p className="font-bold text-gray-800">Send Your Invite Link</p>
                <p className="text-gray-500 mt-0.5 leading-relaxed">
                  Share your unique referral code or link with friends via WhatsApp, SMS, or social media.
                </p>
              </div>
            </div>

            <div className="flex gap-3 items-start">
              <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-700 text-xs font-black flex items-center justify-center flex-shrink-0 mt-0.5">
                2
              </div>
              <div className="text-xs">
                <p className="font-bold text-gray-800">Friend Places An Order</p>
                <p className="text-gray-500 mt-0.5 leading-relaxed">
                  Your friend creates an account and gets a welcome discount on their first verified order.
                </p>
              </div>
            </div>

            <div className="flex gap-3 items-start">
              <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-700 text-xs font-black flex items-center justify-center flex-shrink-0 mt-0.5">
                3
              </div>
              <div className="text-xs">
                <p className="font-bold text-gray-800">Instant ₹78 Cash Credit</p>
                <p className="text-gray-500 mt-0.5 leading-relaxed">
                  Once your friend’s order is delivered, ₹78 is instantly credited into your EveryJust Balance to use on any shopping.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Referral Terms */}
        <div className="bg-gray-100/70 rounded-2xl p-4 text-[11px] text-gray-500 space-y-1">
          <p className="font-bold text-gray-700">Terms & Conditions:</p>
          <p>• Unlimited referrals allowed per user.</p>
          <p>• Referral cash has 100% redemption eligibility on your next checkout.</p>
          <p>• Self-referrals or fraud orders will result in credit forfeiture.</p>
        </div>
      </div>
    </div>
  );
}
