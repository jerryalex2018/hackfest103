"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import logo from "../app/logo.jpeg"; // 👈 Importing the image from the app folder

const links = [
  { href: "/", label: "Home" },
  { href: "/report", label: "Report" },
  { href: "/map", label: "Map" },
  { href: "/recent", label: "Recent" },
  { href: "/flagged", label: "Flagged" },
  { href: "/about", label: "About" },
];

export default function Navbar() {
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <header className="sticky top-0 z-50 border-b border-brand-green/20 bg-brand-white/95 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3">
        
        {/* Logo Section */}
        <Link href="/" className="flex items-center">
          <Image
            src={logo}
            alt="Silent Signals Logo"
            width={200} 
            height={100} 
            className="h-10 w-auto object-contain md:h-12"
            priority
          />
        </Link>

        <ul className="order-3 flex w-full gap-1 overflow-x-auto text-sm font-medium [scrollbar-width:none] md:order-none md:w-auto md:overflow-visible">
          {links.map((link) => (
            <li key={link.href} className="shrink-0">
              <Link
                href={link.href}
                className={`block whitespace-nowrap rounded-full px-3 py-2 transition-colors ${
                  isActive(link.href)
                    ? "bg-brand-green text-brand-white"
                    : "text-slate-700 hover:bg-brand-blue/10 hover:text-brand-blue"
                }`}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-2 text-sm font-medium">
          <Link
            href="/login"
            className="px-3 py-2 text-brand-blue hover:underline"
          >
            Log in
          </Link>
          <Link
            href="/register"
            className="rounded-full bg-brand-blue px-4 py-2 text-brand-white transition-opacity hover:opacity-90"
          >
            Sign up
          </Link>
        </div>
      </nav>
    </header>
  );
}