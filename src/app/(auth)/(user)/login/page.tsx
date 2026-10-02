'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/store/useAuthStore';

export default function UnifiedAuthPage() {
  const router = useRouter();
  const { initialize } = useAuthStore();
  
  // 'email' -> 'password_or_otp' (existing user) -> 'verify_otp' (new user)
  const [step, setStep] = useState<'email' | 'password_or_otp' | 'verify_otp' | 'password_only'>('email');
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const supabase = createClient();

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    setError('');

    // Attempt to send OTP without creating a user
    const { error: signInError } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: false,
        emailRedirectTo: `${window.location.origin}/`,
      }
    });

    if (signInError && (signInError.message.includes('Signups not allowed') || signInError.message.includes('Signups not permitted'))) {
      // User DOES NOT exist. We create them by sending an OTP with shouldCreateUser: true
      const { error: signUpError } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: true,
          data: { role: 'customer' },
          emailRedirectTo: `${window.location.origin}/`,
        }
      });

      if (signUpError) {
        setError(signUpError.message);
        setLoading(false);
        return;
      }

      toast.success('Verification code sent!');
      setStep('verify_otp');
    } else if (signInError) {
      setError(signInError.message);
    } else {
      // User DOES exist, and an OTP was successfully sent!
      // We give them the choice to use the OTP or a password.
      toast.success('Welcome back! We sent a code to your email.');
      setStep('password_or_otp');
    }
    setLoading(false);
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { data, error: verifyError } = await supabase.auth.verifyOtp({
      email,
      token: otp,
      type: 'email'
    });

    if (verifyError) {
      setError(verifyError.message);
      setLoading(false);
      return;
    }

    if (data.session) {
      await initialize();
      toast.success('Congratulations! Successfully logged in.');
      router.push('/');
    } else {
      setError('Failed to create a session.');
      setLoading(false);
    }
  };

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { data, error: loginError } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (loginError) {
      setError('Invalid password. If you forgot it, use the OTP option instead.');
      setLoading(false);
      return;
    }

    if (data.session) {
      await initialize();
      toast.success('Successfully logged in.');
      router.push('/');
    }
  };

  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/`
      }
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-black text-gray-900 uppercase tracking-tight">
          {step === 'email' ? 'Welcome to everyjust' : 'Verify Your Identity'}
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600 font-medium">
          {step === 'email' && 'Sign in or create an account.'}
          {step === 'verify_otp' && `We sent a code to ${email}`}
          {step === 'password_or_otp' && `Log in to ${email}`}
          {step === 'password_only' && `Enter your password for ${email}`}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-sm sm:rounded-xl sm:px-10 border border-gray-100">
          
          {step === 'email' && (
            <form className="space-y-6" onSubmit={handleEmailSubmit}>
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
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              {error && (
                <div className="bg-red-50 text-red-500 text-sm font-semibold p-3 rounded-sm border border-red-200 text-center">
                  {error}
                </div>
              )}

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-sm shadow-sm text-sm font-black text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary uppercase tracking-wider disabled:opacity-50 transition-all"
                >
                  {loading ? 'Continuing...' : 'Continue'}
                </button>
              </div>

              <div className="mt-6">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500 font-medium">
                      Or continue with
                    </span>
                  </div>
                </div>

                <div className="mt-6">
                  <button
                    type="button"
                    onClick={handleGoogleLogin}
                    className="w-full flex items-center justify-center gap-2 py-3 px-4 border-2 border-gray-200 rounded-sm shadow-sm text-sm font-bold text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-300 transition-colors uppercase tracking-wider"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                    Google
                  </button>
                </div>
              </div>
            </form>
          )}

          {step === 'verify_otp' && (
            <form className="space-y-6" onSubmit={handleVerifyOtp}>
              <div>
                <div className="mt-1">
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    className="appearance-none block w-full px-4 py-4 border border-gray-300 rounded-sm shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary text-center text-3xl tracking-[1em] font-black transition-colors"
                    placeholder="000000"
                  />
                </div>
              </div>

              {error && (
                <div className="bg-red-50 text-red-500 text-sm font-semibold p-3 rounded-sm border border-red-200 text-center">
                  {error}
                </div>
              )}

              <div>
                <button
                  type="submit"
                  disabled={loading || otp.length !== 6}
                  className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-sm shadow-sm text-sm font-black text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary uppercase tracking-wider disabled:opacity-50 transition-all"
                >
                  {loading ? 'Verifying...' : 'Verify & Create Account'}
                </button>
              </div>
              
              <div className="mt-4 text-center">
                <button type="button" onClick={() => setStep('email')} className="text-xs font-bold text-gray-500 uppercase hover:text-gray-900">
                  Change Email
                </button>
              </div>
            </form>
          )}

          {step === 'password_or_otp' && (
            <div className="space-y-6">
              <form onSubmit={handleVerifyOtp}>
                <div className="mb-4">
                  <label className="block text-sm font-bold text-gray-700 uppercase tracking-wider mb-2">
                    Enter Verification Code
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    className="appearance-none block w-full px-4 py-4 border border-gray-300 rounded-sm shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary text-center text-3xl tracking-[1em] font-black transition-colors"
                    placeholder="000000"
                  />
                </div>
                
                {error && !password && (
                  <div className="bg-red-50 text-red-500 text-sm font-semibold p-3 rounded-sm border border-red-200 text-center mb-4">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading || otp.length !== 6}
                  className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-sm shadow-sm text-sm font-black text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary uppercase tracking-wider disabled:opacity-50 transition-all"
                >
                  {loading ? 'Verifying...' : 'Login with Code'}
                </button>
              </form>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200" /></div>
                <div className="relative flex justify-center text-sm"><span className="px-2 bg-white text-gray-500 font-medium">Or</span></div>
              </div>

              <button
                type="button"
                onClick={() => setStep('password_only')}
                className="w-full flex justify-center py-3 px-4 border-2 border-gray-200 rounded-sm shadow-sm text-sm font-bold text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-300 transition-colors uppercase tracking-wider"
              >
                Login with Password
              </button>

              <div className="mt-4 text-center">
                <button type="button" onClick={() => setStep('email')} className="text-xs font-bold text-gray-500 uppercase hover:text-gray-900">
                  Change Email
                </button>
              </div>
            </div>
          )}

          {step === 'password_only' && (
            <form className="space-y-6" onSubmit={handlePasswordLogin}>
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

              {error && password && (
                <div className="bg-red-50 text-red-500 text-sm font-semibold p-3 rounded-sm border border-red-200 text-center">
                  {error}
                </div>
              )}

              <div>
                <button
                  type="submit"
                  disabled={loading || !password}
                  className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-sm shadow-sm text-sm font-black text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary uppercase tracking-wider disabled:opacity-50 transition-all"
                >
                  {loading ? 'Logging in...' : 'Login'}
                </button>
              </div>

              <div className="mt-4 text-center space-y-3 flex flex-col">
                <button type="button" onClick={() => setStep('password_or_otp')} className="text-xs font-bold text-primary uppercase hover:text-primary/80">
                  Use Verification Code Instead
                </button>
                <button type="button" onClick={() => setStep('email')} className="text-xs font-bold text-gray-500 uppercase hover:text-gray-900">
                  Change Email
                </button>
              </div>
            </form>
          )}
          
        </div>
      </div>
    </div>
  );
}
