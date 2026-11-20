"use client";

import { useEffect, useState } from "react";
import PhotoCard from "@/components/PhotoCard";
import { useRecentReports } from "@/hooks/useRecentReports";
import type { Report } from "@/lib/types";

export default function RecentPage() {
  const { data: reports, loading, error } = useRecentReports(24);
  const [reportList, setReportList] = useState<Report[]>([]);
  const [removedNotice, setRemovedNotice] = useState<string | null>(null);

  useEffect(() => {
    if (reports) {
      setReportList(reports);
    }
  }, [reports]);

  const handleRemoveReport = (id: number) => {
    setReportList((prev) => prev.filter((r) => r.id !== id));
    setRemovedNotice(`Image report #${id} removed from feed successfully.`);
    setTimeout(() => setRemovedNotice(null), 4000);
  };

  return (
    <section className="mx-auto max-w-6xl space-y-8 px-4 py-10 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-brand-green">Recent reports</h1>
        <p className="mt-2 text-slate-600">
          The latest degraded and dirty spots reported by the community.
        </p>
      </div>

      {removedNotice && (
        <div className="flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-xs font-semibold text-emerald-800 shadow-xs animate-fade-in">
          <span>✓ {removedNotice}</span>
          <button
            onClick={() => setRemovedNotice(null)}
            className="text-emerald-700 font-bold hover:underline"
          >
            ✕
          </button>
        </div>
      )}

      {loading && (
        <p className="animate-pulse text-slate-500">Loading reports...</p>
      )}

      {error && (
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
          Could not load reports: {error}
        </p>
      )}

      {!loading && !error && reportList.length === 0 && (
        <div className="rounded-2xl border border-dashed border-brand-blue/40 p-10 text-center">
          <p className="font-semibold text-slate-700">No reports yet</p>
          <p className="mt-1 text-sm text-slate-500">
            Reports will appear here once people start posting.
          </p>
        </div>
      )}

      {!loading && !error && reportList.length > 0 && (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {reportList.map((report) => (
            <PhotoCard
              key={report.id}
              report={report}
              onDelete={handleRemoveReport}
            />
          ))}
        </div>
      )}
    </section>
  );
}
