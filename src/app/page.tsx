"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Camera, Flag, Users, MapPin } from "lucide-react";
import FaqSection from "@/components/FaqSection";
import FlagJourney from "@/components/FlagJourney";
import FlaggedBadge from "@/components/FlaggedBadge";
import HeroSection from "@/components/HeroSection";
import HowItWorks from "@/components/HowItWorks";
import IssueTypes from "@/components/IssueTypes";
import PhotoCard from "@/components/PhotoCard";
import StatsStrip from "@/components/StatsStrip";
import { useFlaggedLocations } from "@/hooks/useFlaggedLocations";
import { useRecentReports } from "@/hooks/useRecentReports";
import { useStats } from "@/hooks/useStats";
import type { Report } from "@/lib/types";

export default function HomePage() {
  const { data: reports, loading, error } = useRecentReports(6);
  const { data: stats } = useStats("/stats");
  const { data: flagged } = useFlaggedLocations();

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
    <div className="page-container space-y-20 py-10">
      <HeroSection />

      {stats && (
        <StatsStrip
          items={[
            {
              label: "Reports filed",
              value: stats.total_reports,
              hint: "All time",
              icon: Camera,
            },
            {
              label: "Spots pinned",
              value: stats.total_locations,
              hint: "Unique locations",
              icon: MapPin,
            },
            {
              label: "Spots flagged",
              value: stats.flagged_locations,
              hint: "Sent to authorities",
              icon: Flag,
            },
            {
              label: "Community members",
              value: stats.reporters,
              hint: "People who reported",
              icon: Users,
            },
          ]}
        />
      )}

      <HowItWorks />
      <IssueTypes />

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
            className="inline-flex items-center gap-1 text-sm font-semibold text-brand-blue hover:underline"
          >
            See all <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
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
              Be the first to report a spot.
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
              className="inline-flex items-center gap-1 text-sm font-semibold text-brand-blue hover:underline"
            >
              All flagged <ArrowRight className="h-4 w-4" aria-hidden />
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

      <FlagJourney />
      <FaqSection />

      <section className="animate-fade-in rounded-3xl bg-gradient-to-br from-brand-green to-brand-blue p-10 text-center text-brand-white shadow-lg sm:p-16">
        <h2 className="text-2xl font-bold sm:text-3xl">
          Spotted something that needs attention?
        </h2>
        <p className="mx-auto mt-3 max-w-xl opacity-95">
          Your photo and pin take less than a minute, and they help the people
          who can fix it.
        </p>
        <Link
          href="/report"
          className="mt-8 inline-flex items-center gap-2 rounded-full bg-brand-white px-8 py-3 font-semibold text-brand-green transition-transform hover:scale-105"
        >
          Report a spot now <ArrowRight className="h-4 w-4" aria-hidden />
        </Link>
      </section>
    </div>
  );
}
