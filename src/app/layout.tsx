import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";

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
        {children}
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
