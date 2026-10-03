'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import TopBar from "@/components/TopBar";
import MainHeader from "@/components/MainHeader";
import Navbar from "@/components/Navbar";
import Newsletter from "@/components/Newsletter";
import Footer from "@/components/Footer";
import MobileBottomNav from "@/components/MobileBottomNav";

export default function StorefrontShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isCheckout = pathname === '/checkout' || pathname.startsWith('/checkout/');
  const isOrderConfirmation = pathname === '/order-confirmation' || pathname.startsWith('/order-confirmation/');
  const isAccount = pathname === '/account' || pathname.startsWith('/account/');
  const isOrders = pathname === '/orders' || pathname.startsWith('/orders/');

  // For checkout and order-confirmation pages, hide footer, newsletter, and mobile bottom bar
  const hideFooterAndDecor = isCheckout || isOrderConfirmation;
  // Also hide footer and newsletter on account and orders pages
  const hideFooterAndNewsletter = hideFooterAndDecor || isAccount || isOrders;

  return (
    <div className={`flex-1 flex flex-col ${hideFooterAndDecor ? 'pb-0' : 'pb-[72px] lg:pb-0'}`}>
      <TopBar />
      <MainHeader />
      {!isCheckout && <Navbar />}
      <main className="flex-1">
        {children}
      </main>
      {!hideFooterAndDecor && (
        <>
          {!hideFooterAndNewsletter && (
            <>
              <Newsletter />
              <Footer />
            </>
          )}
          <MobileBottomNav />
        </>
      )}
    </div>
  );
}
