export default function FlaggedBadge({
  status,
}: {
  status: "open" | "flagged" | "resolved";
}) {
  const styles = {
    // Added ring and softer text color for "open" to look more like a neutral state
    open: "bg-slate-100 text-slate-700 ring-1 ring-slate-200",
    // Kept your pulse-ring and added a subtle shadow
    flagged: "animate-pulse-ring bg-brand-blue text-brand-white shadow-sm ring-1 ring-brand-blue/20",
    // Added a subtle shadow and ring
    resolved: "bg-brand-green text-brand-white shadow-sm ring-1 ring-brand-green/20",
  } as const;

  const labels = {
    open: "Open",
    flagged: "Flagged",
    resolved: "Resolved",
  } as const;

  const icons = {
    // A simple dot for open
    open: (
      <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
    ),
    // A flag icon for flagged
    flagged: (
      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"></path>
        <line x1="4" y1="22" x2="4" y2="15"></line>
      </svg>
    ),
    // A checkmark for resolved
    resolved: (
      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12"></polyline>
      </svg>
    ),
  } as const;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider transition-all duration-300 ${styles[status]}`}
      aria-label={`Status: ${labels[status]}`}
    >
      {icons[status]}
      {labels[status]}
    </span>
  );
}