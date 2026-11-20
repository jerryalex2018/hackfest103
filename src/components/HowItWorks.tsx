import { Camera, Flag, Landmark, MapPin, type LucideIcon } from "lucide-react";

const steps: {
  icon: LucideIcon;
  badge: string;
  title: string;
  text: string;
  detail: string;
}[] = [
  {
    icon: Camera,
    badge: "Step 01 • Evidence",
    title: "Snap & Document",
    text: "Take a clear photo of the overflowing bin, pothole, or broken streetlight. Visual proof cuts through bureaucracy and prevents false or duplicate claims.",
    detail: "Auto-compresses for fast uploads on mobile data",
  },
  {
    icon: MapPin,
    badge: "Step 02 • Precision",
    title: "Pin the Exact Spot",
    text: "Stand beside the issue and let your phone lock onto the GPS coordinates. You can also add a quick landmark note to help cleanup crews find it fast.",
    detail: "Accurate within 5 meters • No street address needed",
  },
  {
    icon: Landmark,
    badge: "Step 03 • Escalation",
    title: "Crowd-Verify & Flag",
    text: "Your pin goes live on the neighborhood map. Once 10+ unique neighbors verify the same spot, an official, priority ticket is dispatched to local authorities.",
    detail: "Real-time status updates until resolved",
  },
];

export default function HowItWorks() {
  return (
    <section className="page-container relative py-12">
      <div className="max-w-2xl">
        <span className="inline-flex items-center rounded-full bg-brand-green/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-brand-green">
          Simple & Civic-Powered
        </span>
        <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-brand-green sm:text-4xl">
          How it works
        </h2>
        <p className="mt-2 text-base text-slate-600">
          Three simple steps to turn everyday neighborhood frustrations into
          verified, actionable public works tickets.
        </p>
      </div>

      <div className="relative mt-10 grid gap-8 md:grid-cols-3">
        <div
          aria-hidden="true"
          className="absolute top-16 inset-x-[16%] hidden h-0.5 bg-gradient-to-r from-brand-green/20 via-brand-blue/30 to-brand-green/20 md:block"
        />

        {steps.map((step, i) => {
          const Icon = step.icon;
          return (
            <div
              key={step.title}
              className="group animate-fade-in relative flex flex-col justify-between overflow-hidden rounded-2xl border border-brand-blue/20 bg-brand-white p-7 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-brand-green/40 hover:shadow-md"
            >
              <span
                aria-hidden="true"
                className="pointer-events-none absolute -right-2 -top-4 select-none text-8xl font-black text-brand-green/[0.07] transition-transform duration-300 group-hover:scale-110"
              >
                {i + 1}
              </span>

              <div>
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-green text-brand-white shadow-inner">
                    <Icon className="h-6 w-6" aria-hidden />
                  </div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-brand-blue">
                    {step.badge}
                  </span>
                </div>

                <h3 className="mt-6 text-xl font-bold text-slate-800 transition-colors group-hover:text-brand-green">
                  {step.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-slate-600">
                  {step.text}
                </p>
              </div>

              <div className="mt-6 border-t border-slate-100 pt-4">
                <p className="flex items-center gap-2 text-xs font-medium text-slate-500">
                  <span className="h-1.5 w-1.5 rounded-full bg-brand-green" />
                  {step.detail}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-10 flex flex-col items-start justify-between gap-4 rounded-2xl border border-brand-green/15 bg-brand-green/[0.04] p-6 sm:flex-row sm:items-center">
        <div className="space-y-1">
          <h4 className="text-sm font-bold text-slate-800">
            Why require 10+ reports before escalating?
          </h4>
          <p className="text-xs leading-relaxed text-slate-600 sm:text-sm">
            Community consensus filters out spam and ensures municipal teams
            prioritize verified, high-impact issues that neighbors actually care
            about.
          </p>
        </div>
        <div className="shrink-0 rounded-xl border border-brand-green/20 bg-brand-white px-4 py-2.5 text-xs font-semibold text-brand-green shadow-xs">
          100% Anonymous Reporting
        </div>
      </div>
    </section>
  );
}
