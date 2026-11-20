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
  { href: "/tracking", label: "GPS Patrol", badge: "Live" },
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
    <header className="sticky top-0 z-50 border-b border-brand-green/20 bg-brand-white/95 backdrop-blur">
      <nav className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-2.5">
        {/* Logo Section */}
        <Link href="/" className="flex items-center gap-2">
          <Image
            src={logo}
            alt="Degradation Watch Logo"
            width={180}
            height={60}
            className="h-9 w-auto object-contain md:h-11"
            priority
          />
        </Link>

        <ul className="order-3 flex w-full gap-1 overflow-x-auto text-sm font-medium [scrollbar-width:none] md:order-none md:w-auto md:overflow-visible">
          {links.map((link) => (
            <li key={link.href} className="shrink-0">
              <Link
                href={link.href}
                className={`relative inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1.5 transition-colors ${
                  isActive(link.href)
                    ? "bg-brand-green text-brand-white"
                    : "text-slate-700 hover:bg-brand-blue/10 hover:text-brand-blue"
                }`}
              >
                <span>{link.label}</span>
                {link.badge && (
                  <span
                    className={`rounded-full px-1.5 py-0.2 text-[10px] font-bold ${
                      isActive(link.href)
                        ? "bg-white text-brand-green"
                        : "bg-brand-blue/15 text-brand-blue"
                    }`}
                  >
                    {link.badge}
                  </span>
                )}
              </Link>
            </li>
          ))}
        </ul>

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
