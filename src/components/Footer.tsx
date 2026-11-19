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

export default function Footer() {

  return (
    <footer className="mt-16 border-t border-brand-green/20 bg-gradient-to-b from-brand-white to-brand-green/5">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-4 lg:col-span-1">
          <Link href="/" className="text-lg font-bold text-brand-green">
            Degradation<span className="text-brand-blue">Watch</span>
          </Link>
          <p className="text-sm leading-relaxed text-slate-600">
            Residents photograph and pin dirty or damaged public spaces. Spots
            reported by more than 10 people are sent to local authorities.
          </p>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-brand-green">
            Explore
          </h3>
          <ul className="mt-4 space-y-2 text-sm">
            {explore.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-slate-600 hover:text-brand-blue"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-brand-green">
            Community
          </h3>
          <ul className="mt-4 space-y-2 text-sm">
            {community.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-slate-600 hover:text-brand-blue"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-brand-green">
            Contact
          </h3>
          <ul className="mt-4 space-y-2 text-sm text-slate-600">
            <li>Machakos, Kenya</li>
            <li>
              <a
                href="mailto:hello@degradationwatch.example"
                className="hover:text-brand-blue"
              >
                hello@degradationwatch.example
              </a>
            </li>
            <li>Replace this with your real contact details.</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-brand-green/20">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-4 py-5 text-xs text-slate-500 sm:flex-row">
          <p>© <CopyrightYear/> Degradation Watch. All rights reserved.</p>
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
