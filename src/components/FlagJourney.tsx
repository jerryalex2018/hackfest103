import {
  ArrowRight,
  Bell,
  ShieldCheck,
  Users,
  type LucideIcon,
} from "lucide-react";

const stages: { icon: LucideIcon; title: string; text: string }[] = [
  {
    icon: Users,
    title: "Community confirms",
    text: "Different people photograph and report the same spot.",
  },
  {
    icon: Flag,
    title: "Spot is flagged",
    text: "After more than 10 distinct reporters, the location is flagged once.",
  },
  {
    icon: Bell,
    title: "Authorities notified",
    text: "Each responsible office receives an email with the location and photos.",
  },
  {
    icon: ShieldCheck,
    title: "Status tracked",
    text: "The spot stays visible until it is marked resolved.",
  },
];

import { Flag } from "lucide-react";

export default function FlagJourney() {
  return (
    <section className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-brand-green">
          What happens after a flag
        </h2>
        <p className="text-sm text-slate-500">
          From community reports to a response
        </p>
      </div>
      <div className="grid gap-4 lg:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] lg:items-center">
        {stages.map((stage, i) => {
          const Icon = stage.icon;
          return (
            <div key={stage.title} className="contents">
              <div className="animate-fade-in rounded-2xl border border-brand-green/20 bg-brand-white p-5 shadow-sm">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-blue text-brand-white">
                  <Icon className="h-5 w-5" aria-hidden />
                </span>
                <h3 className="mt-3 font-semibold text-slate-800">
                  {stage.title}
                </h3>
                <p className="mt-1 text-sm leading-relaxed text-slate-600">
                  {stage.text}
                </p>
              </div>
              {i < stages.length - 1 && (
                <ArrowRight
                  className="mx-auto hidden h-6 w-6 text-brand-green/50 lg:block"
                  aria-hidden
                />
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
