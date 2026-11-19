"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { href: "/admin", label: "Overview", icon: "📊" },
  { href: "/admin/locations", label: "Locations", icon: "📍" },
  { href: "/admin/authorities", label: "Authorities", icon: "🏛️" },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="space-y-6">
      <div className="rounded-2xl bg-gradient-to-br from-brand-green to-brand-blue p-5 text-brand-white">
        <p className="text-xs uppercase tracking-widest opacity-80">Admin</p>
        <p className="mt-1 text-lg font-bold">Control room</p>
      </div>

      <nav>
        <ul className="flex gap-2 overflow-x-auto lg:flex-col">
          {items.map((item) => {
            const active =
              item.href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(item.href);
            return (
              <li key={item.href} className="shrink-0">
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors ${
                    active
                      ? "bg-brand-green text-brand-white"
                      : "text-slate-700 hover:bg-brand-blue/10 hover:text-brand-blue"
                  }`}
                >
                  <span>{item.icon}</span>
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <Link href="/" className="block text-sm text-brand-blue hover:underline">
        ← Back to the site
      </Link>
    </aside>
  );
}
