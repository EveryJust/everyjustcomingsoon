import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import AuthProvider from "@/components/AuthProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

import type { Viewport } from "next";

export const viewport: Viewport = {
  themeColor: "#000000",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL("https://everyjust.com"),
  title: {
    default: "everyjust | The Future of Unified Commerce",
    template: "%s | everyjust",
  },
  description: "Elevating the next generation of e-commerce. A seamless ecosystem designed for modern brands and creators to thrive together. Join the waitlist today.",
  keywords: [
    "everyjust",
    "every just",
    "just every",
    "justevery",
    "everyjust shop",
    "ecommerce",
    "unified commerce",
    "creators",
    "brands",
    "marketplace",
    "online store",
    "digital commerce",
    "B2B",
    "B2C",
    "omnichannel",
    "shopping",
    "retail",
    "direct to consumer",
    "D2C",
    "e-commerce platform",
    "online marketplace",
    "next generation ecommerce",
    "brand ecosystem",
    "creator economy",
    "buy online",
    "sell online",
    "social commerce",
    "multi-vendor marketplace",
    "unified retail",
    "ecommerce waitlist",
  ],
  authors: [{ name: "everyjust Team" }],
  creator: "everyjust",
  publisher: "everyjust",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: "everyjust | The Future of Unified Commerce",
    description: "Elevating the next generation of e-commerce. A seamless ecosystem designed for modern brands and creators to thrive together.",
    url: "https://everyjust.com",
    siteName: "everyjust",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "everyjust | The Future of Unified Commerce",
    description: "Elevating the next generation of e-commerce. Join the waitlist today.",
    creator: "@everyjust",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <AuthProvider>
          {children}
        </AuthProvider>
        <Toaster 
          position="top-center"
          toastOptions={{
            duration: 3500,
            style: {
              borderRadius: '14px',
              padding: '12px 18px',
              fontSize: '13px',
              fontWeight: 600,
              boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)'
            },
            error: {
              style: {
                background: '#FEF2F2',
                color: '#991B1B',
                border: '1px solid #FCA5A5',
              },
              iconTheme: {
                primary: '#DC2626',
                secondary: '#FEF2F2',
              },
            },
            success: {
              style: {
                background: '#F0FDF4',
                color: '#166534',
                border: '1px solid #86EFAC',
              },
              iconTheme: {
                primary: '#16A34A',
                secondary: '#F0FDF4',
              },
            },
          }}
        />
        <Script src="https://www.googletagmanager.com/gtag/js?id=G-HBS2RGHPGF" strategy="afterInteractive" />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());

            gtag('config', 'G-HBS2RGHPGF');
          `}
        </Script>
      </body>
    </html>
  );
}
