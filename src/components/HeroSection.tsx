import Link from "next/link";

export default function HeroSection() {
  return (
    <section className="relative animate-fade-in overflow-hidden rounded-3xl bg-gradient-to-br from-brand-green to-brand-blue px-6 py-14 text-brand-white shadow-xl sm:px-12 lg:py-20">
      
      {/* Decorative Background Blurs */}
      <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
      <div className="absolute -bottom-20 -left-20 h-72 w-72 rounded-full bg-brand-blue/30 blur-3xl" />

      {/* Main Content Grid */}
      <div className="relative z-10 grid gap-12 lg:grid-cols-2 lg:items-center">
        
        {/* Left Column: Text & CTAs */}
        <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1.5 text-xs font-bold uppercase tracking-widest backdrop-blur-md">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-white"></span>
            </span>
            Community Watch
          </div>

          {/* Headline */}
          <h1 className="mt-6 max-w-2xl text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
            See a problem? <br className="hidden lg:block" />
            <span className="text-brand-green-100 text-white">Pin it. Get it fixed.</span>
          </h1>

          {/* Subheadline */}
          <p className="mt-6 max-w-xl text-lg font-medium text-white/90">
            Snap a photo, drop a pin at the exact spot, and help local authorities 
            see where action is needed. Together, we keep our neighborhoods clean.
          </p>

          {/* Buttons */}
          <div className="mt-8 flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            <Link
              href="/report"
              className="group inline-flex items-center justify-center gap-2 rounded-full bg-brand-white px-8 py-4 text-base font-bold text-brand-green shadow-lg transition-all hover:-translate-y-1 hover:shadow-xl active:translate-y-0"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="transition-transform group-hover:scale-110">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
                <circle cx="12" cy="13" r="4"></circle>
              </svg>
              Report a spot
            </Link>
            
            <Link
              href="/map"
              className="group inline-flex items-center justify-center gap-2 rounded-full border-2 border-white/40 bg-white/5 px-8 py-4 text-base font-bold text-white backdrop-blur-sm transition-all hover:border-white hover:bg-white/10"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="transition-transform group-hover:-translate-y-0.5">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                <circle cx="12" cy="10" r="3"></circle>
              </svg>
              View the map
            </Link>
          </div>

          {/* Social Proof */}
          <div className="mt-8 flex items-center gap-3 text-sm font-medium text-white/80">
            <div className="flex -space-x-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-brand-blue bg-slate-200 text-xs font-bold text-slate-600">
                  {String.fromCharCode(64 + i)}
                </div>
              ))}
              <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-brand-blue bg-brand-white text-xs font-bold text-brand-green">
                +
              </div>
            </div>
            <p>Join the growing community of active citizens.</p>
          </div>
        </div>

        {/* Right Column: Floating Mockup Card */}
        <div className="relative hidden lg:block lg:pl-10">
          {/* Glassmorphism Card */}
          <div className="relative rounded-3xl border border-white/20 bg-white/10 p-6 shadow-2xl backdrop-blur-md">
            
            {/* Mockup Header */}
            <div className="flex items-center justify-between border-b border-white/20 pb-4">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-red-400"></div>
                <div className="h-3 w-3 rounded-full bg-amber-400"></div>
                <div className="h-3 w-3 rounded-full bg-green-400"></div>
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-white/60">Live Report</span>
            </div>

            {/* Mockup Body */}
            <div className="mt-4 space-y-4">
              {/* Image Placeholder */}
              <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-white/20 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-white/40">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                  <circle cx="8.5" cy="8.5" r="1.5"></circle>
                  <polyline points="21 15 16 10 5 21"></polyline>
                </svg>
                {/* Status Badge */}
                <div className="absolute top-3 right-3 rounded-full bg-brand-blue px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-white shadow-sm flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse"></span>
                  Flagged
                </div>
              </div>

              {/* Info Rows */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-white/60">Location</span>
                  <span className="font-mono font-bold">-1.5177, 37.2634</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-white/60">Reporters</span>
                  <span className="font-bold text-white">12 Citizens</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-white/60">SLA Timer</span>
                  <span className="font-bold text-amber-300">47h 59m remaining</span>
                </div>
              </div>

              {/* Fake Action Button */}
              <div className="mt-4 rounded-xl bg-white/20 py-2.5 text-center text-sm font-bold text-white">
                View Details
              </div>
            </div>
          </div>

          {/* Floating Decorative Element behind the card */}
          <div className="absolute -right-6 -top-6 -z-10 h-24 w-24 rotate-12 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20"></div>
        </div>
        
      </div>
    </section>
  );
}