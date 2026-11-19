"use client";

import PhotoCard from "@/components/PhotoCard";
import { useRecentReports } from "@/hooks/useRecentReports";

export default function RecentPage() {
  const { data: reports, loading, error } = useRecentReports(24);

  return (
    <section className="mx-auto max-w-6xl space-y-8 px-4 py-10 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-brand-green">Recent reports</h1>
        <p className="mt-2 text-slate-600">
          The latest degraded and dirty spots reported by the community.
        </p>
      </div>

      {loading && (
        <p className="animate-pulse text-slate-500">Loading reports...</p>
      )}

      {error && (
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
          Could not load reports: {error}
        </p>
      )}

      {!loading && !error && reports?.length === 0 && (
        <div className="rounded-2xl border border-dashed border-brand-blue/40 p-10 text-center">
          <p className="font-semibold text-slate-700">No reports yet</p>
          <p className="mt-1 text-sm text-slate-500">
            Reports will appear here once people start posting.
          </p>
        </div>
      )}

      {!loading && !error && reports && reports.length > 0 && (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {reports.map((report) => (
            <PhotoCard key={report.id} report={report} />
          ))}
        </div>
      )}
    </section>
  );
}
