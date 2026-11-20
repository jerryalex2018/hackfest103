import CopyrightYear from "@/components/CopyrightYear";
import Link from "next/link";

const explore = [
  { href: "/", label: "Home" },
  { href: "/map", label: "Live map" },
  { href: "/recent", label: "Recent reports" },
  { href: "/flagged", label: "Flagged spots" },
];

const community = [
  { href: "/report", label: "Report a spot" },
  { href: "/about", label: "How it works" },
  { href: "/register", label: "Create account" },
  { href: "/login", label: "Log in" },
];

// Social Media Links & Icons
const socials = [
  {
    name: "Twitter",
    href: "#", // Replace with your actual Twitter URL
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
      </svg>
    ),
  },
  {
    name: "Facebook",
    href: "#", // Replace with your actual Facebook URL
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
      </svg>
    ),
  },
  {
    name: "Instagram",
    href: "#", // Replace with your actual Instagram URL
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
      </svg>
    ),
  },
  {
    name: "LinkedIn",
    href: "#", // Replace with your actual LinkedIn URL
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
        <rect x="2" y="9" width="4" height="12"></rect>
        <circle cx="4" cy="4" r="2"></circle>
      </svg>
    ),
  },
];

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-brand-green/20 bg-gradient-to-b from-brand-white to-brand-green/5">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:grid-cols-2 lg:grid-cols-4">
        
        {/* Brand & Socials Column */}
        <div className="space-y-4 lg:col-span-1">
          <Link href="/" className="text-lg font-bold text-brand-green">
            Silent<span className="text-brand-blue">Signals</span>
          </Link>
          <p className="text-sm leading-relaxed text-slate-600">
            Residents photograph and pin dirty or damaged public spaces. Spots
            reported by more than 10 people are sent to local authorities.
          </p>
          
          {/* Social Media Icons */}
          <div className="flex items-center gap-3 pt-2">
            {socials.map((social) => (
              <a
                key={social.name}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Follow us on ${social.name}`}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-white text-slate-500 shadow-sm ring-1 ring-slate-200 transition-all hover:-translate-y-0.5 hover:bg-brand-blue hover:text-brand-white hover:ring-brand-blue"
              >
                {social.icon}
              </a>
            ))}
          </div>
        </div>

        {/* Explore Links */}
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-brand-green">
            Explore
          </h3>
          <ul className="mt-4 space-y-2 text-sm">
            {explore.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-slate-600 transition-colors hover:text-brand-blue"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Community Links */}
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-brand-green">
            Community
          </h3>
          <ul className="mt-4 space-y-2 text-sm">
            {community.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-slate-600 transition-colors hover:text-brand-blue"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact Info */}
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-brand-green">
            Contact
          </h3>
          <ul className="mt-4 space-y-2 text-sm text-slate-600">
            <li>Nairobi, Kenya</li>
            <li>
              <a
                href="mailto:hello@silentsignals.com"
                className="transition-colors hover:text-brand-blue"
              >
                hello@silentsignals.com
              </a>
            </li>
            <li>0742132276</li>
          </ul>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-brand-green/20">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-4 py-5 text-xs text-slate-500 sm:flex-row">
          <p>© <CopyrightYear /> Silent Signals. All rights reserved.</p>
          <Link
            href="/admin"
            className="font-medium text-brand-blue hover:underline"
          >
            Admin dashboard
          </Link>
        </div>
      </div>
    </footer>
  );
}