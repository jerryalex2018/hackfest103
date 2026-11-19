"use client";

import Link from "next/link";
import FlaggedBadge from "@/components/FlaggedBadge";
import PhotoCard from "@/components/PhotoCard";
import { useLocation } from "@/hooks/useLocation";

export default function FlaggedDetailView({ id }: { id: string }) {
  const { data, loading, error } = useLocation(id);

  return (
    <section className="mx-auto max-w-6xl space-y-8 px-4 py-10 animate-fade-in">
      <Link
        href="/flagged"
        className="text-sm font-semibold text-brand-blue hover:underline"
      >
        ← Back to flagged spots
      </Link>

      {loading && (
        <p className="animate-pulse text-slate-500">Loading location...</p>
      )}

      {error && (
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
          Could not load this location: {error}
        </p>
      )}

      {!loading && !error && data && (
        <>
          <div className="flex flex-wrap items-start justify-between gap-4 rounded-3xl bg-gradient-to-br from-brand-green to-brand-blue p-8 text-brand-white shadow-lg">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold">
                Location #{data.location.id}
              </h1>
              <p className="opacity-90">
                {data.location.latitude.toFixed(6)},{" "}
                {data.location.longitude.toFixed(6)}
              </p>
              <p className="text-sm opacity-90">
                {data.location.unique_reporters} people reported ·{" "}
                {data.location.report_count} photos
              </p>
              {data.location.flagged_at && (
                <p className="text-sm opacity-90">
                  Flagged on{" "}
                  {new Date(data.location.flagged_at).toLocaleString("en-KE", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </p>
              )}
            </div>
            <FlaggedBadge status={data.location.status} />
          </div>

          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-brand-green">
              Photos from this spot
            </h2>

            {data.reports.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-brand-blue/40 p-10 text-center">
                <p className="font-semibold text-slate-700">No photos yet</p>
              </div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {data.reports.map((report) => (
                  <PhotoCard key={report.id} report={report} />
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </section>
  );
}
