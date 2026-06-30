"use client";

import React, { useState, useEffect } from "react";

export default function Home() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const [formMounted, setFormMounted] = useState(false);

  useEffect(() => {
    if (isFormOpen) {
      setTimeout(() => setFormMounted(true), 10);
    } else {
      setFormMounted(false);
    }
  }, [isFormOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !/^[a-zA-Z0-9._%+-]+@gmail\.com$/i.test(email)) {
      setStatus("error");
      setMessage("Please enter a valid @gmail.com address.");
      return;
    }
    
    setStatus("loading");
    setMessage("");
    try {
      const response = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        setStatus("success");
        setMessage("You're on the waitlist! We'll be in touch soon.");
        setEmail("");
      } else {
        throw new Error("Failed to join waitlist");
      }
    } catch (error) {
      setStatus("error");
      setMessage("Something went wrong. Please try again.");
    }
  };

  return (
    <div className="relative min-h-screen text-white font-sans overflow-hidden">
      {/* Mobile background */}
      <div
        className="fixed inset-0 -z-10 bg-cover bg-center bg-no-repeat block md:hidden"
        style={{ backgroundImage: "url('/mob-back.png')" }}
      />
      {/* Desktop background */}
      <div
        className="fixed inset-0 -z-10 bg-cover bg-center bg-no-repeat hidden md:block"
        style={{ backgroundImage: "url('/backgroun.png')" }}
      />
      {/* Dark overlay for readability */}
      <div className="fixed inset-0 -z-10 bg-black/30" />

      {/* Floating Glassy Navbar */}
      <nav className="fixed top-8 left-1/2 -translate-x-1/2 z-50 flex items-center justify-between w-[90%] max-w-4xl px-8 py-4 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.4)] transition-all duration-500 hover:bg-white/15 hover:border-white/30">
        <div className="text-xl font-bold tracking-tighter text-white drop-shadow-[0_1px_4px_rgba(0,0,0,0.8)]">
          everyjust
        </div>
        <div className="flex items-center gap-6">
          <span className="px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider bg-white/20 border border-white/30 text-white shadow-[0_0_15px_rgba(255,255,255,0.15)]">
            Coming Soon
          </span>
        </div>
      </nav>

      {/* Main Content */}
      <main className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6 text-center">
        <div className="space-y-10 max-w-4xl">
          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-purple-500/20 border border-purple-400/40 text-sm font-semibold text-purple-200 mb-4 backdrop-blur-md shadow-lg shadow-purple-500/20">
            <span className="w-2 h-2 rounded-full bg-purple-300 animate-pulse" />
            The Future of Unified Commerce
          </div>
          
          <h1 className="text-6xl md:text-8xl lg:text-9xl font-extrabold tracking-tighter">
            <span className="block text-white drop-shadow-[0_1px_8px_rgba(0,0,0,0.4)]">
              everyjust
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-white/90 font-light leading-relaxed max-w-2xl mx-auto drop-shadow-[0_1px_6px_rgba(0,0,0,0.8)]">
            Elevating the next generation of e-commerce. A seamless ecosystem designed for modern brands and creators to thrive together.
          </p>

          <div className="pt-10 h-32 flex flex-col items-center justify-start">
            {!isFormOpen ? (
              <button 
                onClick={() => setIsFormOpen(true)}
                className="group relative inline-flex items-center justify-center px-8 py-4 font-semibold text-white transition-all duration-300 ease-out bg-white/20 border border-white/40 rounded-full hover:bg-white/30 hover:scale-105 hover:shadow-[0_0_40px_rgba(255,255,255,0.25)] shadow-[0_4px_20px_rgba(0,0,0,0.5)] focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-black"
              >
                <span className="absolute inset-0 w-full h-full -mt-1 rounded-full opacity-30 bg-gradient-to-b from-transparent via-transparent to-black" />
                <span className="relative flex items-center gap-2">
                  Join the Waitlist
                  <svg className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </span>
              </button>
            ) : (
              <form 
                onSubmit={handleSubmit}
                className={`flex flex-col sm:flex-row items-center gap-3 w-full max-w-md mx-auto transition-all duration-500 ease-out transform ${formMounted ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-4 scale-95'}`}
              >
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  disabled={status === "loading" || status === "success"}
                  className="w-full px-6 py-4 bg-black/30 border border-white/30 rounded-full text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-400/70 focus:border-transparent backdrop-blur-md transition-all shadow-[0_2px_12px_rgba(0,0,0,0.4)]"
                  required
                />
                <button
                  type="submit"
                  disabled={status === "loading" || status === "success"}
                  className="w-full sm:w-auto px-8 py-4 font-semibold text-white transition-all duration-300 ease-out bg-white/25 border border-white/40 rounded-full hover:bg-white/35 shadow-[0_4px_20px_rgba(0,0,0,0.4)] focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-black disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                >
                  {status === "loading" ? "Sending..." : "Submit"}
                </button>
              </form>
            )}
            
            {/* Status Message */}
            {message && (
              <p className={`mt-4 text-sm font-medium transition-all duration-300 ${status === "success" ? "text-green-400" : "text-red-400"}`}>
                {message}
              </p>
            )}
          </div>
        </div>
      </main>

      {/* Social Footer */}
      <footer className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-center py-5 px-6">
        <div className="flex items-center gap-3 px-6 py-3 rounded-full bg-black/40 backdrop-blur-xl border border-white/20 shadow-[0_-4px_32px_rgba(0,0,0,0.4)]">
          <span className="text-xs font-medium text-white/60 tracking-widest uppercase mr-2 hidden sm:block">Follow Us</span>

          {/* LinkedIn */}
          <a
            href="https://www.linkedin.com/company/everyjust/?lipi=urn%3Ali%3Apage%3Ad_flagship3_detail_base%3BuNNpv0S3TgmR%2B3pKEmdGww%3D%3D"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="EveryJust on LinkedIn"
            className="group relative flex items-center justify-center w-9 h-9 rounded-full bg-white/10 border border-white/25 text-white/80 transition-all duration-300 hover:bg-[#0077b5]/30 hover:border-[#0077b5]/60 hover:text-white hover:scale-110 hover:shadow-[0_0_20px_rgba(10,133,194,0.45)]"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
            </svg>
          </a>

          {/* X / Twitter */}
          <a
            href="https://x.com/EJ_EveryJust"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="EveryJust on X (Twitter)"
            className="group relative flex items-center justify-center w-9 h-9 rounded-full bg-white/10 border border-white/25 text-white/80 transition-all duration-300 hover:bg-white/20 hover:border-white/40 hover:text-white hover:scale-110 hover:shadow-[0_0_20px_rgba(255,255,255,0.25)]"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.737-8.835L1.254 2.25H8.08l4.261 5.633 5.903-5.633zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
          </a>

          {/* Instagram */}
          <a
            href="https://www.instagram.com/everyjustofficial/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="EveryJust on Instagram"
            className="group relative flex items-center justify-center w-9 h-9 rounded-full bg-white/10 border border-white/25 text-white/80 transition-all duration-300 hover:bg-gradient-to-br hover:from-[#833ab4]/30 hover:via-[#fd1d1d]/30 hover:to-[#fcb045]/30 hover:border-[#fd1d1d]/50 hover:text-white hover:scale-110 hover:shadow-[0_0_20px_rgba(253,29,29,0.4)]"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
            </svg>
          </a>
        </div>
      </footer>
    </div>
  );
}
