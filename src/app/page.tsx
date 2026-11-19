"use client";

import Link from "next/link";
import FlaggedBadge from "@/components/FlaggedBadge";
import HeroSection from "@/components/HeroSection";
import HowItWorks from "@/components/HowItWorks";
import PhotoCard from "@/components/PhotoCard";
import StatsStrip from "@/components/StatsStrip";
import { useFlaggedLocations } from "@/hooks/useFlaggedLocations";
import { useRecentReports } from "@/hooks/useRecentReports";
import { useStats } from "@/hooks/useStats";

export default function HomePage() {
  const { data: reports, loading, error } = useRecentReports(6);
  const { data: stats } = useStats("/stats");
  const { data: flagged } = useFlaggedLocations();

  return (
    <div className="mx-auto max-w-6xl space-y-16 px-4 py-10">
      <HeroSection />

      {stats && (
        <StatsStrip
          items={[
            {
              label: "Reports filed",
              value: stats.total_reports,
              hint: "All time",
            },
            {
              label: "Spots pinned",
              value: stats.total_locations,
              hint: "Unique locations",
            },
            {
              label: "Spots flagged",
              value: stats.flagged_locations,
              hint: "Sent to authorities",
            },
            {
              label: "Community members",
              value: stats.reporters,
              hint: "People who reported",
            },
          ]}
        />
      )}

      <HowItWorks />

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
          <Link
            href="/recent"
            className="text-sm font-semibold text-brand-blue hover:underline"
          >
            See all →
          </Link>
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

      {flagged && flagged.length > 0 && (
        <section className="space-y-6">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-brand-blue">
                Flagged spotlight
              </h2>
              <p className="text-sm text-slate-500">
                Spots the community has escalated
              </p>
            </div>
            <Link
              href="/flagged"
              className="text-sm font-semibold text-brand-blue hover:underline"
            >
              All flagged →
            </Link>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {flagged.slice(0, 3).map((loc) => (
              <Link
                key={loc.id}
                href={`/flagged/${loc.id}`}
                className="animate-fade-in flex items-center justify-between rounded-2xl border border-brand-blue/30 bg-brand-white p-5 shadow-sm transition-transform hover:-translate-y-1"
              >
                <div>
                  <p className="font-semibold text-slate-800">
                    Location #{loc.id}
                  </p>
                  <p className="text-sm text-slate-500">
                    {loc.unique_reporters} people reported
                  </p>
                </div>
                <FlaggedBadge status={loc.status} />
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="animate-fade-in rounded-3xl bg-gradient-to-br from-brand-green to-brand-blue p-10 text-center text-brand-white shadow-lg">
        <h2 className="text-2xl font-bold sm:text-3xl">
          Spotted something that needs attention?
        </h2>
        <p className="mx-auto mt-3 max-w-xl opacity-95">
          Your photo and pin take less than a minute, and they help the people
          who can fix it.
        </p>
        <Link
          href="/report"
          className="mt-8 inline-block rounded-full bg-brand-white px-8 py-3 font-semibold text-brand-green transition-transform hover:scale-105"
        >
          Report a spot now
        </Link>
      </section>
    </div>
  );
}
