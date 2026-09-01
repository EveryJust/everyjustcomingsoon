import React from 'react';
import WishlistClient from './WishlistClient';

export default function WishlistPage() {
  return (
    <main className="min-h-screen bg-gray-50 pt-20 pb-24">
      <div className="max-w-7xl mx-auto px-4 lg:px-4">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">My Wishlist</h1>
        <WishlistClient />
      </div>
    </main>
  );
}
