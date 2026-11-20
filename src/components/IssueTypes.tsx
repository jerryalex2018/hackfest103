import {
  Construction,
  Droplets,
  Lightbulb,
  Recycle,
  Trash2,
  TreePine,
  type LucideIcon,
} from "lucide-react";

const issues: { icon: LucideIcon; title: string; text: string }[] = [
  {
    icon: Trash2,
    title: "Overflowing bins",
    text: "Bins left full for days, or litter spilling onto the street.",
  },
  {
    icon: Droplets,
    title: "Blocked drains",
    text: "Stagnant water, drains choked with waste, and flooding after rain.",
  },
  {
    icon: Construction,
    title: "Broken roads and footpaths",
    text: "Potholes, cracked pavements, and damaged walkways.",
  },
  {
    icon: Lightbulb,
    title: "Dead street lights",
    text: "Dark stretches that make walking unsafe at night.",
  },
  {
    icon: TreePine,
    title: "Neglected green spaces",
    text: "Overgrown parks, fallen trees, and unkept public gardens.",
  },
  {
    icon: Recycle,
    title: "Illegal dumping",
    text: "Rubbish, old furniture, or construction waste left in public spaces.",
  },
];

export default function IssueTypes() {
  return (
    <section className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-brand-green">
          What you can report
        </h2>
        <p className="text-sm text-slate-500">
          If it makes a public space worse, it belongs here
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {issues.map((issue) => {
          const Icon = issue.icon;
          return (
            <div
              key={issue.title}
              className="flex gap-4 rounded-2xl border border-slate-200 bg-brand-white p-5 transition-colors hover:border-brand-blue/40"
            >
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-blue/10 text-brand-blue">
                <Icon className="h-5 w-5" aria-hidden />
              </span>
              <div>
                <h3 className="font-semibold text-slate-800">{issue.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-slate-600">
                  {issue.text}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
