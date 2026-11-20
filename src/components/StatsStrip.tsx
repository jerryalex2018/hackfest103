import type { LucideIcon } from "lucide-react";

type Item = {
  label: string;
  value: number;
  hint?: string;
  icon?: LucideIcon;
};

export default function StatsStrip({ items }: { items: Item[] }) {
  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <div
            key={item.label}
            className="animate-fade-in rounded-2xl border border-brand-green/20 bg-brand-white p-5 shadow-sm"
          >
            <div className="flex items-start justify-between gap-3">
              <p className="text-3xl font-bold text-brand-green">
                {item.value.toLocaleString("en-KE")}
              </p>
              {Icon && (
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-blue/10 text-brand-blue">
                  <Icon className="h-5 w-5" aria-hidden />
                </span>
              )}
            </div>
            <p className="mt-2 font-semibold text-slate-800">{item.label}</p>
            {item.hint && <p className="text-xs text-slate-500">{item.hint}</p>}
          </div>
        );
      })}
    </div>
  );
}
