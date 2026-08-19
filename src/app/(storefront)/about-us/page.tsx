import React from 'react';

export default function AboutUsPage() {
  return (
    <div className="bg-white min-h-screen pb-16">
      {/* Hero Section */}
      <div className="bg-primary text-white py-20 px-4 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        <div className="relative z-10">
          <h1 className="text-4xl md:text-6xl font-extrabold mb-6 tracking-tight">Our Story</h1>
          <p className="text-lg md:text-xl opacity-90 max-w-2xl mx-auto font-medium">
            Redefining the online shopping experience in India with premium quality, unbeatable prices, and trust.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 lg:px-6 py-16 flex flex-col gap-16">
        
        {/* Mission */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Mission</h2>
          <p className="text-gray-600 text-lg leading-relaxed">
            At <span className="font-bold text-primary">everyjust</span>, our mission is simple: to bring you the best products at the most competitive prices, without compromising on quality or customer service. We believe that everyone deserves access to premium lifestyle, tech, and everyday essentials.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
            <div className="text-4xl font-extrabold text-primary mb-2">1M+</div>
            <div className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Happy Customers</div>
          </div>
          <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
            <div className="text-4xl font-extrabold text-primary mb-2">50K+</div>
            <div className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Products</div>
          </div>
          <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
            <div className="text-4xl font-extrabold text-primary mb-2">100%</div>
            <div className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Quality Guarantee</div>
          </div>
          <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
            <div className="text-4xl font-extrabold text-primary mb-2">24/7</div>
            <div className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Support</div>
          </div>
        </div>

        {/* Values */}
        <div>
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Our Core Values</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 text-primary">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Authenticity</h3>
              <p className="text-gray-600 text-sm">We strictly verify all sellers to ensure 100% genuine products.</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 text-primary">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Speed</h3>
              <p className="text-gray-600 text-sm">Lightning fast delivery to over 20,000+ pin codes across India.</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 text-primary">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" /></svg>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Customer First</h3>
              <p className="text-gray-600 text-sm">No questions asked return policy and dedicated support team.</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
