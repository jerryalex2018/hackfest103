"use client";

import HeroSection from "@/components/HeroSection";
import PhotoCard from "@/components/PhotoCard";
import { useRecentReports } from "@/hooks/useRecentReports";

export default function HomePage() {
  const { data: reports, loading, error } = useRecentReports(6);

  return (
    <div className="mx-auto max-w-6xl space-y-12 px-4 py-10">
      <HeroSection />

      <section className="space-y-6">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-brand-green">
              Recent degraded areas
            </h2>
            <p className="text-sm text-slate-500">
              Latest photos from around the community
            </p>
          </div>
          <a
            href="/recent"
            className="text-sm font-semibold text-brand-blue hover:underline"
          >
            See all
          </a>
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
              Be the first to report a spot.
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
    </div>
  );
}
