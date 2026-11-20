"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { getUser } from "@/lib/auth";
import { useAuth } from "@/hooks/useAuth";
import type { User } from "@/lib/types";
import logo from "../app/logo.jpeg";

const links = [
  { href: "/", label: "Home" },
  { href: "/report", label: "Report" },
  { href: "/map", label: "Map" },
  { href: "/tracking", label: "GPS Patrol", badge: "Live", pulse: true },
  { href: "/recent", label: "Recent" },
  { href: "/flagged", label: "Flagged" },
  { href: "/admin", label: "Admin Ops", badge: "New" },
  { href: "/about", label: "About" },
];

export default function Navbar() {
  const pathname = usePathname();
  const { logout } = useAuth();
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    setCurrentUser(getUser());
  }, [pathname]);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <header className="sticky top-0 z-50 border-b border-brand-green/20 bg-brand-white/90 shadow-sm backdrop-blur-md transition-all duration-300">
      <nav className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-2.5">
        
        {/* Logo Section with Hover Scale & Brand Name */}
        <Link 
          href="/" 
          className="group flex items-center gap-2.5 outline-none transition-transform duration-300 hover:scale-105 active:scale-95"
        >
          <Image
            src={logo}
            alt="Silent Signals Logo"
            width={180}
            height={60}
            className="h-9 w-auto rounded object-contain md:h-11"
            priority
          />
          {/* Website Name */}
          <span className="hidden text-xl font-extrabold tracking-tight text-brand-green sm:block md:text-2xl">
            Silent<span className="text-brand-blue">Signals</span>
          </span>
        </Link>

        {/* Navigation Links Container */}
        <div className="relative order-3 w-full md:order-none md:w-auto">
          {/* Gradient fade on mobile edges to indicate scrolling */}
          <div className="pointer-events-none absolute inset-y-0 left-0 w-4 bg-gradient-to-r from-brand-white to-transparent md:hidden" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-4 bg-gradient-to-l from-brand-white to-transparent md:hidden" />

          <ul className="flex w-full gap-1 overflow-x-auto px-2 text-sm font-medium [scrollbar-width:none] md:w-auto md:overflow-visible md:px-0">
            {links.map((link) => {
              const active = isActive(link.href);
              return (
                <li key={link.href} className="shrink-0">
                  <Link
                    href={link.href}
                    className={`group relative inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1.5 transition-all duration-300 ${
                      active
                        ? "bg-brand-green text-brand-white shadow-sm"
                        : "text-slate-700 hover:-translate-y-0.5 hover:bg-brand-blue/10 hover:text-brand-blue"
                    }`}
                  >
                    <span>{link.label}</span>
                    
                    {/* Animated Badge */}
                    {link.badge && (
                      <span
                        className={`relative flex items-center gap-1 rounded-full px-1.5 py-0.2 text-[10px] font-bold uppercase tracking-wide transition-colors ${
                          active
                            ? "bg-white text-brand-green"
                            : "bg-brand-blue/15 text-brand-blue group-hover:bg-brand-blue group-hover:text-white"
                        }`}
                      >
                        {/* Pulsing dot for "Live" badges */}
                        {link.pulse && (
                          <span className="relative flex h-1.5 w-1.5">
                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-blue opacity-75 group-hover:bg-white"></span>
                            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-brand-blue group-hover:bg-white"></span>
                          </span>
                        )}
                        {link.badge}
                      </span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>



        {/* Auth Section */}
        <div className="flex items-center gap-2 text-sm font-medium">
          {currentUser ? (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-800">
                <span>👤</span>
                <span className="truncate max-w-[120px]">{currentUser.name}</span>
                {currentUser.role === "admin" && (
                  <span className="rounded-full bg-brand-green/20 text-brand-green px-1.5 py-0.2 text-[9px] font-extrabold uppercase">
                    Admin
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={logout}
                className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-600 hover:bg-red-50 hover:text-red-600 transition"
              >
                Log out
              </button>
            </div>
          ) : (
            <>
              <Link
                href="/login"
                className="px-3 py-2 text-brand-blue hover:underline"
              >
                Log in
              </Link>
              <Link
                href="/register"
                className="rounded-full bg-brand-blue px-4 py-2 text-brand-white transition-opacity hover:opacity-90 shadow-2xs"
              >
                Sign up
              </Link>
            </>
          )}

        </div>
      </nav>
    </header>
  );
}