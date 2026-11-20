import type { Metadata, Viewport } from "next";
import { Suspense } from "react";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

// 1. Font Optimization (Automatically injects font and prevents layout shift)
const inter = Inter({ 
  subsets: ["latin"],
  variable: "--font-inter",
});

// 2. Enhanced SEO Metadata
export const metadata: Metadata = {
  title: {
    default: "Silent Signals",
    template: "%s | Silent Signals", // Allows child pages to have titles like "About | Silent Signals"
  },
  description:
    "Report degraded and dirty public spaces so local authorities can act.",
  keywords: ["community", "report", "public spaces", "clean up", "local authorities"],
  authors: [{ name: "Silent Signals Team" }],
  openGraph: {
    title: "Silent Signals",
    description: "Report degraded and dirty public spaces so local authorities can act.",
    type: "website",
    locale: "en_US",
  },
  icons: {
    icon: "/favicon.ico",
  },
};

// 3. Viewport configuration (replaces standard meta tags for mobile)
export const viewport: Viewport = {
  themeColor: "#ffffff", // Matches your brand-white
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${inter.variable} scroll-smooth`}>
      {/* 4. Enhanced Body classes for better typography and background */}
      <body className="flex min-h-screen flex-col bg-slate-50 font-sans text-slate-900 antialiased">
        
        {/* Navbar with Skeleton Fallback */}
        <Suspense
          fallback={
            <div className="sticky top-0 z-50 flex h-[73px] items-center border-b border-brand-green/20 bg-brand-white/95 px-4 backdrop-blur">
              <div className="mx-auto flex w-full max-w-6xl animate-pulse items-center justify-between">
                {/* Logo Skeleton */}
                <div className="h-10 w-32 rounded-md bg-slate-200"></div>
                {/* Links Skeleton */}
                <div className="hidden h-8 w-64 rounded-full bg-slate-200 md:block"></div>
                {/* Auth Skeleton */}
                <div className="h-8 w-24 rounded-full bg-slate-200"></div>
              </div>
            </div>
          }
        >
          <Navbar />
        </Suspense>
        
        {/* Main Content Area */}
        <main className="flex flex-1 flex-col">
          {children}
        </main>
        
        <Footer />
      </body>
    </html>
  );
}