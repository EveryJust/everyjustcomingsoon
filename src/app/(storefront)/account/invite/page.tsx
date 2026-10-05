'use client';

import React, { useState, useEffect } from 'react';
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
  Clock,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  LogIn,
  Loader2,
  ArrowRight,
  Package,
  RotateCcw,
  Truck
} from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import toast from 'react-hot-toast';

interface ReferralItem {
  id: string;
  referred_user_email?: string | null;
  referred_user_name?: string | null;
  status: 'pending' | 'order_placed' | 'return_period' | 'completed' | 'cancelled' | 'expired';
  order_number?: string | null;
  order_amount?: number | null;
  reward_amount: number;
  min_order_amount: number;
  delivered_at?: string | null;
  return_period_ends_at?: string | null;
  expires_at: string;
  created_at: string;
}

interface ReferralStats {
  referralCode: string;
  totalReferred: number;
  completedCount: number;
  pendingCount: number;
  expiredCount: number;
  totalEarned: number;
  pendingEarned: number;
  returnPeriodDays: number;
  referrals: ReferralItem[];
}

export default function InviteAndEarnPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuthStore();

  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [statsLoading, setStatsLoading] = useState(false);
  const [stats, setStats] = useState<ReferralStats | null>(null);

  // Fetch live referral stats when user is authenticated
  useEffect(() => {
    if (!isAuthenticated || !user) return;

    let isMounted = true;
    const fetchStats = async () => {
      setStatsLoading(true);
      try {
        const res = await fetch(`/api/referrals/stats?userId=${user.id}`);
        const data = await res.json();
        if (data.success && isMounted) {
          setStats(data.stats);
        }
      } catch (err) {
        console.error('Error fetching referral stats:', err);
      } finally {
        if (isMounted) setStatsLoading(false);
      }
    };

    fetchStats();
    return () => {
      isMounted = false;
    };
  }, [isAuthenticated, user]);

  const referralCode =
    stats?.referralCode ||
    (user ? `EJ${user.id.replace(/[^a-zA-Z0-9]/g, '').slice(0, 6).toUpperCase()}` : '');

  const referralLink =
    typeof window !== 'undefined'
      ? `${window.location.origin}/login?ref=${referralCode}`
      : `https://everyjust.com/login?ref=${referralCode}`;

  const handleCopyCode = () => {
    if (!referralCode) return;
    navigator.clipboard.writeText(referralCode);
    setCopiedCode(true);
    toast.success('Referral code copied!');
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleCopyLink = () => {
    if (!referralLink) return;
    navigator.clipboard.writeText(referralLink);
    setCopiedLink(true);
    toast.success('Invite link copied!');
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(
      `Hey! Sign up on EveryJust using my invite code ${referralCode} and get great deals: ${referralLink}`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join EveryJust',
          text: `Use my invite code ${referralCode} when registering on EveryJust!`,
          url: referralLink,
        });
      } catch {
        // User cancelled
      }
    } else {
      handleCopyLink();
    }
  };

  // Helper to format remaining days out of 30 days
  const getRemainingDays = (expiresAt: string) => {
    const now = new Date().getTime();
    const expiry = new Date(expiresAt).getTime();
    const diffDays = Math.ceil((expiry - now) / (1000 * 60 * 60 * 24));
    if (diffDays <= 0) return 'Expired';
    return `${diffDays} days left`;
  };

  // Helper to format 3-day return period remaining
  const getReturnWindowRemaining = (returnPeriodEndsAt?: string | null) => {
    if (!returnPeriodEndsAt) return '3-day return window';
    const now = new Date().getTime();
    const end = new Date(returnPeriodEndsAt).getTime();
    const diffHours = Math.ceil((end - now) / (1000 * 60 * 60));
    if (diffHours <= 0) return 'Return period ended';
    if (diffHours > 24) {
      const days = Math.ceil(diffHours / 24);
      return `${days} ${days === 1 ? 'day' : 'days'} left in return period`;
    }
    return `${diffHours}h left in return period`;
  };

  // Helper to mask email for privacy
  const maskEmail = (email?: string | null, name?: string | null) => {
    if (name && name !== 'New Shopper') return name;
    if (!email) return 'Referred User';
    const [userPart, domain] = email.split('@');
    if (!domain) return email;
    const masked = userPart.length > 2 ? `${userPart.slice(0, 2)}***` : userPart;
    return `${masked}@${domain}`;
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24 lg:pb-12 text-gray-900">
      {/* Header */}
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
              Invite & Earn
            </h1>
          </div>
          <Link
            href="/help"
            className="text-xs font-bold text-primary flex items-center gap-1 hover:underline"
          >
            <HelpCircle className="w-4 h-4" />
            Offer Rules
          </Link>
        </div>
      </div>

      <div className="max-w-xl mx-auto px-4 py-4 space-y-4">
        {/* Offer Banner Card */}
        <div className="relative overflow-hidden bg-gradient-to-br from-emerald-600 via-teal-700 to-emerald-900 rounded-3xl p-6 text-white shadow-md">
          <div className="absolute -top-12 -right-12 w-44 h-44 bg-white/10 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -bottom-12 -left-12 w-44 h-44 bg-white/10 rounded-full blur-xl pointer-events-none" />

          <div className="relative z-10 flex flex-col items-center text-center">
            <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center mb-3 shadow-inner border border-white/25">
              <Gift className="w-7 h-7 text-white" />
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-xs text-xs font-extrabold mb-2 text-white border border-white/20">
              <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
              EARN ₹50 PER QUALIFIED FRIEND
            </div>

            <h2 className="text-2xl font-black tracking-tight text-white mb-1.5">
              Get ₹50 for Every Friend
            </h2>
            <p className="text-xs text-emerald-100 max-w-sm leading-relaxed">
              Invite friends to EveryJust. When they register with your code and make an order <strong className="text-white">above ₹100</strong> within <strong className="text-white">30 days</strong>, you earn <strong className="text-white">₹50 cash reward</strong> credited after delivery and 3-day return period!
            </p>
          </div>
        </div>

        {/* STATE A: NOT LOGGED IN */}
        {!isLoading && !isAuthenticated && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200/80 shadow-xs text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
              <LogIn className="w-7 h-7" />
            </div>

            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">
                Login to Get Your Referral Code & Link
              </h3>
              <p className="text-xs text-gray-500 max-w-xs mx-auto leading-relaxed">
                Sign in to your account to view your unique referral code, shareable invite link, and track your referral earnings.
              </p>
            </div>

            <Link
              href="/login?redirect=/account/invite"
              className="inline-flex items-center justify-center gap-2 w-full py-3.5 px-6 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm shadow-md shadow-emerald-700/20 transition-all cursor-pointer"
            >
              <span>Login / Sign Up</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}

        {/* STATE B: LOGGED IN */}
        {isAuthenticated && (
          <>
            {/* Referral Code & Link Card */}
            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-xs space-y-4">
              <div>
                <p className="text-xs font-extrabold uppercase tracking-wider text-gray-500 mb-2">
                  Your Personal Referral Code
                </p>
                <div className="flex items-center justify-between gap-3 p-3 bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl">
                  <span className="font-mono font-black text-xl tracking-wider text-gray-900">
                    {referralCode}
                  </span>
                  <button
                    onClick={handleCopyCode}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-lg transition-colors shadow-xs cursor-pointer"
                  >
                    {copiedCode ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    <span>{copiedCode ? 'Copied' : 'Copy Code'}</span>
                  </button>
                </div>
              </div>

              <div>
                <p className="text-xs font-extrabold uppercase tracking-wider text-gray-500 mb-2">
                  Your Invite Link
                </p>
                <div className="flex items-center justify-between gap-2 p-2.5 bg-gray-50 border border-gray-200 rounded-xl">
                  <span className="text-xs text-gray-600 truncate flex-1 font-medium pl-1">
                    {referralLink}
                  </span>
                  <button
                    onClick={handleCopyLink}
                    className="p-2 text-gray-600 hover:text-emerald-700 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                    title="Copy Link"
                  >
                    {copiedLink ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Share Actions */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <button
                  onClick={handleShareWhatsApp}
                  className="py-3 px-4 rounded-xl bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#128C7E] font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer border border-[#25D366]/20"
                >
                  <Share2 className="w-4 h-4" />
                  <span>WhatsApp Share</span>
                </button>
                <button
                  onClick={handleNativeShare}
                  className="py-3 px-4 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <Share2 className="w-4 h-4" />
                  <span>Share Options</span>
                </button>
              </div>
            </div>

            {/* Stats Dashboard Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-white rounded-2xl p-3.5 border border-gray-100 shadow-xs text-center">
                <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-1">
                  <Users className="w-4 h-4" />
                </div>
                <p className="text-[10px] uppercase font-bold text-gray-400">Total Referred</p>
                <p className="text-lg font-black text-gray-900 mt-0.5">
                  {statsLoading ? '...' : (stats?.totalReferred || 0)}
                </p>
              </div>

              <div className="bg-white rounded-2xl p-3.5 border border-gray-100 shadow-xs text-center">
                <div className="w-8 h-8 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-1">
                  <Clock className="w-4 h-4" />
                </div>
                <p className="text-[10px] uppercase font-bold text-gray-400">In Progress</p>
                <p className="text-lg font-black text-amber-600 mt-0.5">
                  {statsLoading ? '...' : (stats?.pendingCount || 0)}
                </p>
              </div>

              <div className="bg-white rounded-2xl p-3.5 border border-gray-100 shadow-xs text-center">
                <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-1">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <p className="text-[10px] uppercase font-bold text-gray-400">Completed</p>
                <p className="text-lg font-black text-emerald-600 mt-0.5">
                  {statsLoading ? '...' : (stats?.completedCount || 0)}
                </p>
              </div>

              <div className="bg-white rounded-2xl p-3.5 border border-gray-100 shadow-xs text-center">
                <div className="w-8 h-8 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center mx-auto mb-1">
                  <Wallet className="w-4 h-4" />
                </div>
                <p className="text-[10px] uppercase font-bold text-gray-400">Received Money</p>
                <p className="text-lg font-black text-purple-700 mt-0.5">
                  ₹{statsLoading ? '...' : (stats?.totalEarned || 0)}
                </p>
              </div>
            </div>

            {/* Referred Users List Section */}
            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-gray-700 flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-emerald-600" />
                  <span>Your Referred Friends ({stats?.referrals?.length || 0})</span>
                </h3>
                <span className="text-[10px] font-semibold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                  Valid for 30 days
                </span>
              </div>

              {statsLoading ? (
                <div className="py-8 text-center text-gray-400 flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
                  <span className="text-xs">Loading referrals...</span>
                </div>
              ) : !stats?.referrals || stats.referrals.length === 0 ? (
                <div className="py-8 text-center border-2 border-dashed border-gray-100 rounded-xl">
                  <Users className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-xs font-bold text-gray-700">No referrals yet</p>
                  <p className="text-[11px] text-gray-400 max-w-xs mx-auto mt-1">
                    Share your code <strong className="text-gray-700 font-mono">{referralCode}</strong> with friends. When they buy above ₹100, you'll earn ₹50!
                  </p>
                </div>
              ) : (
                <div className="space-y-2.5 pt-1">
                  {stats.referrals.map((item) => {
                    const remaining30Days = getRemainingDays(item.expires_at);
                    const returnWindowStr = getReturnWindowRemaining(item.return_period_ends_at);

                    return (
                      <div
                        key={item.id}
                        className="p-3 bg-gray-50 rounded-xl border border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs"
                      >
                        <div>
                          <div className="font-bold text-gray-900">
                            {maskEmail(item.referred_user_email, item.referred_user_name)}
                          </div>
                          <div className="text-[10px] text-gray-400 mt-0.5 flex flex-wrap gap-2">
                            <span>
                              Joined: {new Date(item.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </span>
                            {item.order_number && (
                              <span>• Order #{item.order_number}</span>
                            )}
                          </div>
                        </div>

                        <div className="sm:text-right">
                          {/* 1. Fully completed (Delivered + 3 days return period ended) */}
                          {item.status === 'completed' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              Received ₹50 (Return Period Ended)
                            </span>
                          )}

                          {/* 2. Delivered, in 3-day return period */}
                          {item.status === 'return_period' && (
                            <div className="flex flex-col sm:items-end gap-0.5">
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-teal-100 text-teal-800">
                                <RotateCcw className="w-3 h-3 text-teal-600" />
                                Delivered • In 3-Day Return Period
                              </span>
                              <span className="text-[9px] text-teal-700 font-medium">
                                {returnWindowStr}
                              </span>
                            </div>
                          )}

                          {/* 3. Order placed, awaiting delivery */}
                          {item.status === 'order_placed' && (
                            <div className="flex flex-col sm:items-end gap-0.5">
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">
                                <Truck className="w-3 h-3 text-blue-600" />
                                Order Placed (₹{item.order_amount || 0})
                              </span>
                              <span className="text-[9px] text-gray-500 font-medium">
                                Awaiting Delivery
                              </span>
                            </div>
                          )}

                          {/* 4. Signed up, pending order > 100 within 30 days */}
                          {item.status === 'pending' && (
                            <div className="flex flex-col sm:items-end gap-0.5">
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                                <Clock className="w-3 h-3 text-amber-600" />
                                Pending Order &gt; ₹100
                              </span>
                              <span className="text-[9px] text-gray-400 font-medium">
                                {remaining30Days}
                              </span>
                            </div>
                          )}

                          {/* 5. Cancelled */}
                          {item.status === 'cancelled' && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700">
                              <AlertCircle className="w-3 h-3" />
                              Order Cancelled / Returned
                            </span>
                          )}

                          {/* 6. Expired */}
                          {item.status === 'expired' && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-gray-200 text-gray-600">
                              <AlertCircle className="w-3 h-3" />
                              Expired (30d)
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        )}

        {/* How It Works */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-xs space-y-4">
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-gray-700">
            How The Offer Works
          </h3>

          <div className="space-y-3">
            <div className="flex gap-3 items-start">
              <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-700 text-xs font-black flex items-center justify-center flex-shrink-0 mt-0.5">
                1
              </div>
              <div className="text-xs">
                <p className="font-bold text-gray-800">Share Your Code or Link</p>
                <p className="text-gray-500 mt-0.5 leading-relaxed">
                  Send your personal referral code or invite link to friends via WhatsApp or SMS.
                </p>
              </div>
            </div>

            <div className="flex gap-3 items-start">
              <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-700 text-xs font-black flex items-center justify-center flex-shrink-0 mt-0.5">
                2
              </div>
              <div className="text-xs">
                <p className="font-bold text-gray-800">Friend Registers as a New User</p>
                <p className="text-gray-500 mt-0.5 leading-relaxed">
                  Your friend signs up using your link (code is auto-applied) or enters your code manually during registration.
                </p>
              </div>
            </div>

            <div className="flex gap-3 items-start">
              <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-700 text-xs font-black flex items-center justify-center flex-shrink-0 mt-0.5">
                3
              </div>
              <div className="text-xs">
                <p className="font-bold text-gray-800">Friend Orders Above ₹100 (Within 30 Days)</p>
                <p className="text-gray-500 mt-0.5 leading-relaxed">
                  When your friend makes any purchase above ₹100 within 30 days of registration, the referral moves forward.
                </p>
              </div>
            </div>

            <div className="flex gap-3 items-start">
              <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-700 text-xs font-black flex items-center justify-center flex-shrink-0 mt-0.5">
                4
              </div>
              <div className="text-xs">
                <p className="font-bold text-gray-800">Delivery & 3-Day Return Period</p>
                <p className="text-gray-500 mt-0.5 leading-relaxed">
                  Once the order is successfully delivered and the 3-day return period ends, the ₹50 reward is credited to you!
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Rules & Validity Notice */}
        <div className="bg-gray-100/70 rounded-2xl p-4 text-[11px] text-gray-500 space-y-1">
          <p className="font-bold text-gray-700">Program Rules & Validity:</p>
          <p>• Offer is valid only for new users registering with a valid referral code.</p>
          <p>• Qualifying purchase must be an order above ₹100.</p>
          <p>• Referral validity: Friend must make qualifying order within 30 days of registration.</p>
          <p>• Payout: Referral money is received after order delivery and completion of the 3-day return period.</p>
          <p>• Self-referrals or fraud orders will result in credit forfeiture.</p>
        </div>
      </div>
    </div>
  );
}
