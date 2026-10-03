'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Mail, Loader2 } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/store/useAuthStore';

export default function LoginPage() {
  const router = useRouter();
  const { initialize } = useAuthStore();

  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const supabase = createClient();

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim();
    if (!cleanEmail) return;

    setLoading(true);
    setError('');

    try {
      // 1. Attempt to send OTP for existing user
      const { error: signInError } = await supabase.auth.signInWithOtp({
        email: cleanEmail,
        options: {
          shouldCreateUser: false,
        }
      });

      if (signInError && (signInError.message.includes('Signups not allowed') || signInError.message.includes('Signups not permitted'))) {
        // User does not exist yet. Create user and send OTP
        const { error: signUpError } = await supabase.auth.signInWithOtp({
          email: cleanEmail,
          options: {
            shouldCreateUser: true,
            data: { role: 'customer' },
          }
        });

        if (signUpError) {
          setError(signUpError.message);
          setLoading(false);
          return;
        }

        toast.success('Verification code sent to your email!');
        setStep('otp');
      } else if (signInError) {
        setError(signInError.message);
      } else {
        // User exists: OTP sent successfully!
        toast.success('Verification code sent to your email!');
        setStep('otp');
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to send verification code. Please try again.');
      toast.error(err?.message || 'Error sending code');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanOtp = otp.trim();
    if (!cleanOtp) return;

    setLoading(true);
    setError('');

    try {
      const { data, error: verifyError } = await supabase.auth.verifyOtp({
        email: email.trim(),
        token: cleanOtp,
        type: 'email'
      });

      if (verifyError) {
        setError(verifyError.message);
        setLoading(false);
        return;
      }

      if (data.session) {
        await initialize();
        toast.success('Successfully logged in.');
        router.push('/account');
      } else {
        setError('Failed to create a session.');
        setLoading(false);
      }
    } catch (err: any) {
      setError(err?.message || 'Invalid or expired code. Please try again.');
      toast.error('Invalid verification code');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/account`
        }
      });
    } catch (err: any) {
      toast.error(err?.message || 'Google login error');
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-[#fcfdfa] flex flex-col justify-center items-center px-4 py-8 overflow-hidden select-none">
      {/* Botanical Leaf Artworks */}
      
      {/* Top Left Leaf Cluster */}
      <div className="absolute -top-6 -left-6 w-56 h-56 sm:w-72 sm:h-72 pointer-events-none z-0 opacity-85">
        <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
          <defs>
            <linearGradient id="leafGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#a3d9a5" />
              <stop offset="50%" stopColor="#66bb6a" />
              <stop offset="100%" stopColor="#388e3c" />
            </linearGradient>
            <linearGradient id="leafGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#c8e6c9" />
              <stop offset="70%" stopColor="#81c784" />
              <stop offset="100%" stopColor="#43a047" />
            </linearGradient>
          </defs>
          <path
            d="M-20 -20 C 30 40, 80 80, 140 60 C 110 110, 60 140, -10 100 Z"
            fill="url(#leafGrad1)"
            opacity="0.75"
          />
          <path
            d="M-20 -20 Q 55 50 140 60"
            stroke="#2e7d32"
            strokeWidth="1.5"
            opacity="0.3"
          />
          <path
            d="M0 40 C 20 90, 40 140, 10 180 C -15 150, -30 100, -20 60 Z"
            fill="url(#leafGrad2)"
            opacity="0.8"
          />
          <path
            d="M0 40 Q 15 110 10 180"
            stroke="#2e7d32"
            strokeWidth="1.2"
            opacity="0.3"
          />
          <path
            d="M40 0 C 80 15, 120 20, 150 -5 C 130 35, 90 45, 50 25 Z"
            fill="url(#leafGrad1)"
            opacity="0.65"
          />
        </svg>
      </div>

      {/* Top Right Leaf Cluster */}
      <div className="absolute -top-6 -right-6 w-56 h-56 sm:w-72 sm:h-72 pointer-events-none z-0 opacity-85">
        <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
          <defs>
            <linearGradient id="leafGradR1" x1="100%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#a5d6a7" />
              <stop offset="60%" stopColor="#66bb6a" />
              <stop offset="100%" stopColor="#2e7d32" />
            </linearGradient>
            <linearGradient id="leafGradR2" x1="100%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#c8e6c9" />
              <stop offset="70%" stopColor="#81c784" />
              <stop offset="100%" stopColor="#388e3c" />
            </linearGradient>
          </defs>
          <path
            d="M220 -20 C 160 30, 110 70, 60 70 C 90 120, 140 130, 200 80 Z"
            fill="url(#leafGradR1)"
            opacity="0.8"
          />
          <path
            d="M220 -20 Q 140 50 60 70"
            stroke="#1b5e20"
            strokeWidth="1.5"
            opacity="0.3"
          />
          <path
            d="M190 40 C 180 90, 160 140, 190 170 C 220 130, 225 80, 210 50 Z"
            fill="url(#leafGradR2)"
            opacity="0.75"
          />
        </svg>
      </div>

      {/* Back Button */}
      <div className="absolute top-6 left-6 z-20">
        <button
          onClick={() => {
            if (step === 'otp') {
              setStep('email');
              setError('');
            } else {
              router.push('/account');
            }
          }}
          aria-label="Go back"
          className="p-2.5 rounded-full text-gray-600 hover:text-emerald-700 hover:bg-white/80 transition-all shadow-xs border border-gray-100/50 cursor-pointer"
        >
          <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
        </button>
      </div>

      {/* Main Container */}
      <div className="relative z-10 w-full max-w-sm sm:max-w-md flex flex-col items-center text-center">
        {/* Botanical Sprout Logo Icon */}
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-2">
          <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-14 h-14">
            <path
              d="M32 54 V 26"
              stroke="#2e7d32"
              strokeWidth="3.5"
              strokeLinecap="round"
            />
            <path
              d="M32 26 C 26 18, 28 10, 32 6 C 36 10, 38 18, 32 26 Z"
              fill="#4caf50"
            />
            <path
              d="M32 36 C 20 34, 14 26, 16 18 C 24 18, 30 26, 32 36 Z"
              fill="#66bb6a"
            />
            <path
              d="M32 36 C 44 34, 50 26, 48 18 C 40 18, 34 26, 32 36 Z"
              fill="#43a047"
            />
            <path
              d="M32 44 C 24 42, 20 37, 21 32 C 26 32, 30 38, 32 44 Z"
              fill="#81c784"
            />
          </svg>
        </div>

        {/* Title & Subtitle */}
        <h1 className="text-3xl font-extrabold tracking-tight text-[#1b5e20] mb-1">
          {step === 'email' ? 'Welcome' : 'Enter Verification Code'}
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 font-medium mb-7">
          {step === 'email'
            ? 'Sign in to your account'
            : `We sent a 6-digit code to ${email}`}
        </p>

        {/* STEP 1: Email Box Only */}
        {step === 'email' && (
          <form onSubmit={handleEmailSubmit} className="w-full space-y-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-emerald-600">
                <Mail className="w-5 h-5 stroke-[2]" />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email Address"
                className="w-full pl-12 pr-4 py-4 bg-white border border-gray-200/90 rounded-2xl text-sm font-semibold text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent shadow-xs transition-all"
              />
            </div>

            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs font-semibold text-rose-600 text-left">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-[#4caf50] to-[#2e7d32] hover:from-[#43a047] hover:to-[#1b5e20] text-white text-base font-bold rounded-2xl shadow-lg shadow-emerald-600/25 active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Sending code...</span>
                </>
              ) : (
                'Login'
              )}
            </button>
          </form>
        )}

        {/* STEP 2: 6-Digit OTP Code Box */}
        {step === 'otp' && (
          <form onSubmit={handleVerifyOtp} className="w-full space-y-4">
            <div className="relative">
              <input
                type="text"
                required
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                placeholder="000000"
                className="appearance-none block w-full px-4 py-4 bg-white border border-gray-200/90 rounded-2xl text-center text-3xl tracking-[0.8em] font-black font-mono text-gray-900 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent shadow-xs transition-colors"
              />
            </div>

            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs font-semibold text-rose-600 text-left">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || otp.length !== 6}
              className="w-full py-4 bg-gradient-to-r from-[#4caf50] to-[#2e7d32] hover:from-[#43a047] hover:to-[#1b5e20] text-white text-base font-bold rounded-2xl shadow-lg shadow-emerald-600/25 active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Verifying...</span>
                </>
              ) : (
                'Verify & Login'
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                setStep('email');
                setError('');
              }}
              className="text-xs font-bold text-emerald-700 hover:underline block mx-auto pt-2 cursor-pointer"
            >
              ← Edit email address
            </button>
          </form>
        )}

        {/* Divider: "or continue with" (Only on Email step) */}
        {step === 'email' && (
          <div className="w-full my-6 flex items-center justify-center">
            <div className="h-px bg-gray-200 flex-1 max-w-[80px]" />
            <span className="px-3 text-xs text-gray-400 font-medium whitespace-nowrap">
              or continue with
            </span>
            <div className="h-px bg-gray-200 flex-1 max-w-[80px]" />
          </div>
        )}

        {/* Google Login Only */}
        {step === 'email' && (
          <div className="flex items-center justify-center">
            <button
              type="button"
              onClick={handleGoogleLogin}
              aria-label="Sign in with Google"
              className="w-16 h-16 sm:w-20 sm:h-20 bg-white border border-gray-100 rounded-2xl sm:rounded-3xl shadow-md hover:shadow-lg hover:border-gray-200 active:scale-95 transition-all flex items-center justify-center cursor-pointer group"
            >
              <svg className="w-7 h-7 sm:w-8 sm:h-8 group-hover:scale-105 transition-transform" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.65v3h3.86c2.26-2.09 3.685-5.17 3.685-9.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.29v3.09C3.26 21.3 7.34 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.27 14.29c-.25-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.98-3.09z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.7 1.29 6.62l3.98 3.09c.95-2.85 3.6-4.96 6.73-4.96z"
                />
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
