import Link from "next/link";

export default function HeroSection() {
  return (
    <section className="animate-fade-in rounded-3xl bg-gradient-to-br from-brand-green to-brand-blue px-6 py-14 text-brand-white shadow-lg sm:px-12">
      <p className="text-sm font-semibold uppercase tracking-widest opacity-90">
        Community watch
      </p>
      <h1 className="mt-3 max-w-2xl text-3xl font-bold leading-tight sm:text-5xl">
        See a dirty or damaged public space? Pin it and get it fixed.
      </h1>
      <p className="mt-4 max-w-xl text-base opacity-95">
        Snap a photo, drop a pin at the exact spot, and help local authorities
        see where action is needed.
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Link
          href="/report"
          className="rounded-full bg-brand-white px-6 py-3 font-semibold text-brand-green transition-transform hover:scale-105"
        >
          Report a spot
        </Link>
        <Link
          href="/map"
          className="rounded-full border-2 border-brand-white px-6 py-3 font-semibold text-brand-white transition-colors hover:bg-brand-white/10"
        >
          View the map
        </Link>
      </div>
    </section>
  );
}
