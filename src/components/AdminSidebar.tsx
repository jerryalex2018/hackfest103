"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { 
    href: "/admin", 
    label: "Overview", 
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7"></rect>
        <rect x="14" y="3" width="7" height="7"></rect>
        <rect x="14" y="14" width="7" height="7"></rect>
        <rect x="3" y="14" width="7" height="7"></rect>
      </svg>
    )
  },
  { 
    href: "/admin/locations", 
    label: "Locations", 
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
        <circle cx="12" cy="10" r="3"></circle>
      </svg>
    )
  },
  { 
    href: "/admin/authorities", 
    label: "Authorities", 
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect>
        <path d="M9 22v-4h6v4"></path>
        <path d="M8 6h.01"></path>
        <path d="M16 6h.01"></path>
        <path d="M12 6h.01"></path>
        <path d="M12 10h.01"></path>
        <path d="M12 14h.01"></path>
        <path d="M16 10h.01"></path>
        <path d="M16 14h.01"></path>
        <path d="M8 10h.01"></path>
        <path d="M8 14h.01"></path>
      </svg>
    )
  },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-full flex-col space-y-6">
      
      {/* Header Card */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-brand-green to-brand-blue p-5 text-brand-white shadow-sm">
        {/* Decorative background circle */}
        <div className="absolute -right-4 -top-4 h-20 w-20 rounded-full bg-white/10 blur-xl"></div>
        
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-300 opacity-75"></span>
            <span className="relative inline-flex h-2 w-2 rounded-full bg-green-300"></span>
          </span>
          <p className="text-xs font-semibold uppercase tracking-widest text-white/90">System Live</p>
        </div>
        
        <p className="mt-2 text-xl font-bold tracking-tight">Control Room</p>
        <p className="mt-1 text-xs text-white/70">Admin Operations Dashboard</p>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1">
        {/* Mobile view: Horizontal scroll | Desktop view: Vertical list */}
        <ul className="flex gap-2 overflow-x-auto pb-2 [scrollbar-width:none] lg:flex-col lg:overflow-visible lg:pb-0">
          {items.map((item) => {
            const active =
              item.href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(item.href);
                
            return (
              <li key={item.href} className="shrink-0 lg:w-full">
                <Link
                  href={item.href}
                  className={`group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 ${
                    active
                      ? "bg-brand-green text-brand-white shadow-md shadow-brand-green/20"
                      : "text-slate-600 hover:bg-white hover:text-brand-blue hover:shadow-sm ring-1 ring-transparent hover:ring-slate-200"
                  }`}
                >
                  <span className={`transition-transform duration-200 group-hover:scale-110 ${active ? "text-white" : "text-slate-400 group-hover:text-brand-blue"}`}>
                    {item.icon}
                  </span>
                  {item.label}
                  
                  {/* Active indicator dot for desktop */}
                  {active && (
                    <span className="ml-auto hidden h-1.5 w-1.5 rounded-full bg-white lg:block"></span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Bottom Section */}
      <div className="mt-auto space-y-4 pt-4 border-t border-slate-200">
        <Link 
          href="/" 
          className="group flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-brand-blue"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="transition-transform group-hover:-translate-x-1">
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
          Back to site
        </Link>
      </div>
      
    </aside>
  );
}