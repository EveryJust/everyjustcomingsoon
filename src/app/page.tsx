import React from "react";

export default function Home() {
  return (
    <div className="relative min-h-screen bg-black text-white font-sans overflow-hidden">
      {/* Background glowing effects */}
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-purple-900/20 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-blue-900/20 blur-[120px] rounded-full pointer-events-none" />

      {/* Floating Glassy Navbar */}
      <nav className="fixed top-8 left-1/2 -translate-x-1/2 z-50 flex items-center justify-between w-[90%] max-w-4xl px-8 py-4 rounded-full bg-white/5 backdrop-blur-xl border border-white/10 shadow-[0_8px_32px_rgba(255,255,255,0.05)] transition-all duration-500 hover:bg-white/10 hover:border-white/20">
        <div className="text-xl font-bold tracking-tighter bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent">
          everyjust
        </div>
        <div className="flex items-center gap-6">
          <span className="px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider bg-white/10 border border-white/10 text-white/90 shadow-[0_0_15px_rgba(255,255,255,0.1)]">
            Coming Soon
          </span>
        </div>
      </nav>

      {/* Main Content */}
      <main className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6 text-center">
        <div className="space-y-10 max-w-4xl">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm font-medium text-purple-300 mb-4 backdrop-blur-md shadow-lg shadow-purple-500/10">
            <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
            The Future of Unified Commerce
          </div>
          
          <h1 className="text-6xl md:text-8xl lg:text-9xl font-extrabold tracking-tighter">
            <span className="block text-transparent bg-clip-text bg-gradient-to-b from-white via-white/90 to-white/30 drop-shadow-sm">
              everyjust
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-white/60 font-light leading-relaxed max-w-2xl mx-auto">
            Elevating the next generation of e-commerce. A seamless ecosystem designed for modern brands and creators to thrive together.
          </p>

          <div className="pt-10">
            <button className="group relative inline-flex items-center justify-center px-8 py-4 font-semibold text-white transition-all duration-300 ease-out bg-white/10 border border-white/20 rounded-full hover:bg-white/20 hover:scale-105 hover:shadow-[0_0_40px_rgba(255,255,255,0.15)] focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-black">
              <span className="absolute inset-0 w-full h-full -mt-1 rounded-full opacity-30 bg-gradient-to-b from-transparent via-transparent to-black" />
              <span className="relative flex items-center gap-2">
                Join the Waitlist
                <svg className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </span>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
