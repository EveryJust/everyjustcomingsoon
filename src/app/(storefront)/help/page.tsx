'use client';
import React, { useState } from 'react';

export default function HelpPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(1);

  const faqs = [
    {
      id: 1,
      question: "How can I track my order?",
      answer: "You can track your order by logging into your account and navigating to 'My Orders'. Click on the specific order to view its real-time tracking status. We also send SMS and email updates at every step of the delivery process."
    },
    {
      id: 2,
      question: "What is your return policy?",
      answer: "We offer a hassle-free 7-day return policy for most items. If you are not satisfied with your purchase, you can initiate a return from the 'My Orders' section. The item must be unused, in its original packaging, and with all tags attached."
    },
    {
      id: 3,
      question: "How do I get a refund?",
      answer: "Once your returned item is received and inspected by our warehouse team, we will process your refund within 24-48 hours. The amount will be credited back to your original payment method or as EveryJust Wallet balance, depending on your preference."
    },
    {
      id: 4,
      question: "Do you offer Cash on Delivery (COD)?",
      answer: "Yes, we offer Cash on Delivery (COD) for most pin codes across India. You can select this option during checkout. Please note that an additional handling fee of ₹40 may apply for COD orders."
    },
    {
      id: 5,
      question: "How can I contact customer support?",
      answer: "You can reach our customer support team 24/7 via the Contact Us page, or by calling our toll-free number 1800-123-4567. You can also email us at support@everyjust.in."
    }
  ];

  return (
    <div className="bg-gray-50 min-h-screen pb-16">
      {/* Hero Section */}
      <div className="bg-primary text-white py-16 px-4 text-center">
        <h1 className="text-3xl md:text-5xl font-extrabold mb-4">How can we help you?</h1>
        <div className="max-w-2xl mx-auto relative mt-8">
          <input 
            type="text" 
            placeholder="Search for articles, tracking, returns..." 
            className="w-full px-6 py-4 rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-yellow-400 shadow-lg text-lg"
          />
          <button className="absolute right-2 top-2 bg-gray-900 text-white p-2.5 rounded-lg hover:bg-black transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 lg:px-6 py-12">
        
        {/* Quick Links */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16 -mt-20 relative z-10">
          <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 flex flex-col items-center text-center cursor-pointer hover:-translate-y-1 transition-transform group">
            <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mb-3 group-hover:bg-blue-500 group-hover:text-white transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
            </div>
            <h3 className="font-bold text-gray-800">Track Order</h3>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 flex flex-col items-center text-center cursor-pointer hover:-translate-y-1 transition-transform group">
            <div className="w-12 h-12 bg-green-50 text-green-500 rounded-full flex items-center justify-center mb-3 group-hover:bg-green-500 group-hover:text-white transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 15v-1a4 4 0 00-4-4H8m0 0l3 3m-3-3l3-3m9 14V5a2 2 0 00-2-2H6a2 2 0 00-2 2v16l4-2 4 2 4-2 4 2z" /></svg>
            </div>
            <h3 className="font-bold text-gray-800">Returns</h3>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 flex flex-col items-center text-center cursor-pointer hover:-translate-y-1 transition-transform group">
            <div className="w-12 h-12 bg-yellow-50 text-yellow-600 rounded-full flex items-center justify-center mb-3 group-hover:bg-yellow-500 group-hover:text-white transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
            </div>
            <h3 className="font-bold text-gray-800">Payments</h3>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 flex flex-col items-center text-center cursor-pointer hover:-translate-y-1 transition-transform group">
            <div className="w-12 h-12 bg-purple-50 text-purple-500 rounded-full flex items-center justify-center mb-3 group-hover:bg-purple-500 group-hover:text-white transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
            </div>
            <h3 className="font-bold text-gray-800">Account</h3>
          </div>
        </div>

        {/* FAQs */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-10">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">Frequently Asked Questions</h2>
          
          <div className="flex flex-col gap-4">
            {faqs.map((faq) => (
              <div 
                key={faq.id} 
                className={`border rounded-xl overflow-hidden transition-all duration-300 ${openFaq === faq.id ? 'border-primary shadow-sm' : 'border-gray-200'}`}
              >
                <button 
                  onClick={() => setOpenFaq(openFaq === faq.id ? null : faq.id)}
                  className="w-full px-6 py-4 text-left flex justify-between items-center bg-white hover:bg-gray-50 transition-colors"
                >
                  <span className="font-bold text-gray-800">{faq.question}</span>
                  <svg 
                    className={`w-5 h-5 text-gray-500 transition-transform duration-300 ${openFaq === faq.id ? 'rotate-180 text-primary' : ''}`} 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {openFaq === faq.id && (
                  <div className="px-6 pb-5 pt-2 bg-white text-gray-600 leading-relaxed text-sm border-t border-gray-100">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
