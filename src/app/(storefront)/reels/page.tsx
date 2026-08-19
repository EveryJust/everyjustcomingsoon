import React from 'react';

export default function ReelsPage() {
  return (
    <div className="bg-gray-50 min-h-[calc(100vh-130px)] flex flex-col items-center justify-center p-6 text-center">
      <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-6">
        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" /></svg>
      </div>
      <h1 className="text-3xl font-extrabold text-gray-900 mb-4">Reels</h1>
      <p className="text-gray-500 text-lg max-w-md mx-auto mb-8">
        Discover new products and trends through bite-sized videos. Coming soon!
      </p>
      <a href="/" className="bg-primary text-white font-bold px-8 py-3 rounded-full hover:bg-primary/90 transition-colors shadow-sm inline-flex items-center gap-2">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
        Back to Home
      </a>
    </div>
  );
}
