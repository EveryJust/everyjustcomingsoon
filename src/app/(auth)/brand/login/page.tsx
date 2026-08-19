'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';

function BrandLoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isPendingFromSignup = searchParams.get('pending') === 'true';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [pendingReview, setPendingReview] = useState(isPendingFromSignup);
  
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setPendingReview(false);

    const supabase = createClient();
    const { data: authData, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (signInError) {
      setError(signInError.message);
      setLoading(false);
      return;
    }

    if (authData.user) {
      // Check brand status
      const { data: brand, error: dbError } = await supabase
        .from('brands')
        .select('status')
        .eq('id', authData.user.id)
        .single();

      if (brand?.status === 'pending') {
        setPendingReview(true);
        setLoading(false);
        // Optionally sign them out so they don't have access while pending
        await supabase.auth.signOut();
      } else if (brand?.status === 'approved') {
        router.push('/brand/dashboard'); // Or wherever the brand dashboard is
      } else {
        // If not found in brands table, maybe they didn't complete onboarding
        router.push('/brand/onboarding');
      }
    }
  };

  if (pendingReview) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
        <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
          <div className="mx-auto flex items-center justify-center h-24 w-24 rounded-full bg-amber-100 mb-6">
            <svg className="h-12 w-12 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="mt-6 text-center text-3xl font-black text-gray-900 uppercase tracking-tight">
            Under Review
          </h2>
          <p className="mt-4 text-center text-base text-gray-600 font-medium max-w-sm mx-auto">
            Your brand application has been successfully submitted. Our team is currently reviewing your details. We will notify you once you are approved!
          </p>
          <div className="mt-8">
            <button
              onClick={() => setPendingReview(false)}
              className="font-bold text-primary hover:text-primary/80 uppercase tracking-wider text-sm transition-colors"
            >
              Back to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-black text-gray-900 uppercase tracking-tight">
          Brand Portal
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600 font-medium">
          Sign in to manage your store and products.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-[0_8px_30px_rgb(0,0,0,0.04)] sm:rounded-xl sm:px-10 border border-gray-100">
          <form className="space-y-6" onSubmit={handleLogin}>
            <div>
              <label className="block text-sm font-bold text-gray-700 uppercase tracking-wider mb-2">
                Email Address
              </label>
              <div className="mt-1">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-sm shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm font-medium transition-colors"
                  placeholder="brand@example.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 uppercase tracking-wider mb-2">
                Password
              </label>
              <div className="mt-1">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-sm shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm font-medium transition-colors"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900 font-medium">
                  Remember me
                </label>
              </div>

              <div className="text-sm">
                <a href="#" className="font-bold text-primary hover:text-primary/80 transition-colors">
                  Forgot your password?
                </a>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 text-red-500 text-sm font-semibold p-3 rounded-sm border border-red-100">
                {error}
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-sm shadow-sm text-sm font-black text-white bg-gray-900 hover:bg-black focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 uppercase tracking-wider disabled:opacity-50 transition-all"
              >
                {loading ? 'Signing in...' : 'Sign in'}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500 font-medium">
                  New to EveryJust?
                </span>
              </div>
            </div>

            <div className="mt-6">
              <a
                href="/brand/register"
                className="w-full flex justify-center py-3 px-4 border-2 border-primary rounded-sm shadow-sm text-sm font-bold text-primary bg-white hover:bg-primary/5 uppercase tracking-wider transition-all"
              >
                Apply as a Brand
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function BrandLoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading...</div>}>
      <BrandLoginContent />
    </Suspense>
  );
}
