type Item = { label: string; value: number; hint?: string };

export default function StatsStrip({ items }: { items: Item[] }) {
  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {items.map((item) => (
        <div
          key={item.label}
          className="animate-fade-in rounded-2xl border border-brand-green/20 bg-brand-white p-5 shadow-sm"
        >
          <p className="text-3xl font-bold text-brand-green">
            {item.value.toLocaleString("en-KE")}
          </p>
          <p className="mt-1 font-semibold text-slate-800">{item.label}</p>
          {item.hint && <p className="text-xs text-slate-500">{item.hint}</p>}
        </div>
      ))}
    </div>
  );
}
