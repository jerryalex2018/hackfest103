"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { CircleUser, Menu, X } from "lucide-react";
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
  { href: "/about", label: "About" },
];

export default function Navbar() {
  const pathname = usePathname();
  const { logout } = useAuth();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setCurrentUser(getUser());
  }, [pathname]);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  const close = () => setOpen(false);

  const handleLogout = () => {
    close();
    logout();
  };

  return (
    <header className="sticky top-0 z-50 border-b border-brand-green/20 bg-brand-white/90 shadow-sm backdrop-blur-md">
      <nav className="page-container flex items-center justify-between gap-3 py-2.5">
        <Link
          href="/"
          onClick={close}
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
          <span className="hidden text-xl font-extrabold tracking-tight text-brand-green sm:block md:text-2xl">
            Silent<span className="text-brand-blue">Signals</span>
          </span>
        </Link>

        <ul className="hidden items-center gap-1 text-sm font-medium md:flex">
          {links.map((link) => {
            const active = isActive(link.href);
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={`group inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-2 transition-all duration-300 ${
                    active
                      ? "bg-brand-green text-brand-white shadow-sm"
                      : "text-slate-700 hover:-translate-y-0.5 hover:bg-brand-blue/10 hover:text-brand-blue"
                  }`}
                >
                  <span>{link.label}</span>
                  {link.badge && (
                    <span
                      className={`flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide transition-colors ${
                        active
                          ? "bg-white text-brand-green"
                          : "bg-brand-blue/15 text-brand-blue group-hover:bg-brand-blue group-hover:text-white"
                      }`}
                    >
                      {link.pulse && (
                        <span className="relative flex h-1.5 w-1.5">
                          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-blue opacity-75 group-hover:bg-white" />
                          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-brand-blue group-hover:bg-white" />
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

        <div className="hidden items-center gap-2 text-sm font-medium md:flex">
          {currentUser ? (
            <>
              <div className="flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-800">
                <CircleUser className="h-4 w-4 text-brand-blue" aria-hidden />
                <span className="max-w-[120px] truncate">
                  {currentUser.name}
                </span>
                {currentUser.role === "admin" && (
                  <span className="rounded-full bg-brand-green/20 px-1.5 py-0.5 text-[9px] font-extrabold uppercase text-brand-green">
                    Admin
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={logout}
                className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-red-50 hover:text-red-600"
              >
                Log out
              </button>
            </>
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
                className="rounded-full bg-brand-blue px-4 py-2 text-brand-white shadow-sm transition-opacity hover:opacity-90"
              >
                Sign up
              </Link>
            </>
          )}
        </div>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label={open ? "Close menu" : "Open menu"}
          className="flex h-11 w-11 items-center justify-center rounded-xl text-slate-700 hover:bg-brand-blue/10 md:hidden"
        >
          {open ? (
            <X className="h-6 w-6" aria-hidden />
          ) : (
            <Menu className="h-6 w-6" aria-hidden />
          )}
        </button>
      </nav>

      {open && (
        <div
          id="mobile-menu"
          className="border-t border-brand-green/20 bg-brand-white md:hidden"
        >
          <ul className="page-container flex flex-col gap-1 py-4 text-base font-medium">
            {links.map((link) => {
              const active = isActive(link.href);
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    onClick={close}
                    className={`flex items-center justify-between rounded-xl px-4 py-3 transition-colors ${
                      active
                        ? "bg-brand-green text-brand-white"
                        : "text-slate-700 hover:bg-brand-blue/10 hover:text-brand-blue"
                    }`}
                  >
                    <span>{link.label}</span>
                    {link.badge && (
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
                          active
                            ? "bg-white text-brand-green"
                            : "bg-brand-blue/15 text-brand-blue"
                        }`}
                      >
                        {link.badge}
                      </span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>

          <div className="page-container border-t border-slate-200 py-4">
            {currentUser ? (
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                  <CircleUser className="h-5 w-5 text-brand-blue" aria-hidden />
                  <span className="truncate">{currentUser.name}</span>
                  {currentUser.role === "admin" && (
                    <span className="rounded-full bg-brand-green/20 px-1.5 py-0.5 text-[9px] font-extrabold uppercase text-brand-green">
                      Admin
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-red-50 hover:text-red-600"
                >
                  Log out
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <Link
                  href="/login"
                  onClick={close}
                  className="rounded-full border border-brand-blue px-4 py-3 text-center font-semibold text-brand-blue"
                >
                  Log in
                </Link>
                <Link
                  href="/register"
                  onClick={close}
                  className="rounded-full bg-brand-blue px-4 py-3 text-center font-semibold text-brand-white"
                >
                  Sign up
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
