import type { Report } from "@/lib/types";

type Props = { report: Report };

export default function PhotoCard({ report }: Props) {
  const date = new Date(report.created_at).toLocaleString("en-KE", {
    dateStyle: "medium",
    timeStyle: "short",
  });

  return (
    <article className="animate-fade-in overflow-hidden rounded-2xl border border-brand-green/20 bg-brand-white shadow-sm transition-transform hover:-translate-y-1 hover:shadow-md">
      <div className="aspect-4/3 bg-slate-100">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={report.image_url}
          alt={report.description ?? "Degraded area"}
          className="h-full w-full object-cover"
        />
      </div>
      <div className="space-y-2 p-4">
        <p className="font-medium text-slate-800">
          {report.description ?? "No description"}
        </p>
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span>by {report.reporter_name}</span>
          <span>{date}</span>
        </div>
        <p className="text-xs text-brand-blue">
          {report.latitude.toFixed(4)}, {report.longitude.toFixed(4)}
        </p>
      </div>
    </article>
  );
}
