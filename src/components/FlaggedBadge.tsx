export default function FlaggedBadge({
  status,
}: {
  status: "open" | "flagged" | "resolved";
}) {
  const styles = {
    open: "bg-slate-100 text-slate-600",
    flagged: "animate-pulse-ring bg-brand-blue text-brand-white",
    resolved: "bg-brand-green text-brand-white",
  } as const;

  const labels = {
    open: "Open",
    flagged: "Flagged",
    resolved: "Resolved",
  } as const;

  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${styles[status]}`}
    >
      {labels[status]}
    </span>
  );
}
