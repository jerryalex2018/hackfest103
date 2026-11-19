"use client";

import Link from "next/link";
import AdminGuard from "@/components/AdminGuard";
import FlaggedBadge from "@/components/FlaggedBadge";
import StatsStrip from "@/components/StatsStrip";
import { useFlaggedLocations } from "@/hooks/useFlaggedLocations";
import { useStats } from "@/hooks/useStats";

export default function AdminOverviewPage() {
  return (
    <AdminGuard>
      <AdminOverview />
    </AdminGuard>
  );
}

function AdminOverview() {
  const { data: stats, loading, error } = useStats("/admin/stats");
  const { data: flagged } = useFlaggedLocations();

  return (
    <>
      <div>
        <h1 className="text-3xl font-bold text-brand-green">Overview</h1>
        <p className="mt-2 text-slate-600">
          Activity across all reports and locations.
        </p>
      </div>

      {loading && (
        <p className="animate-pulse text-slate-500">Loading stats...</p>
      )}
      {error && (
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
          Could not load stats: {error}
        </p>
      )}

      {stats && (
        <StatsStrip
          items={[
            { label: "Total reports", value: stats.total_reports },
            { label: "Reports today", value: stats.reports_today },
            { label: "Locations", value: stats.total_locations },
            {
              label: "Flagged",
              value: stats.flagged_locations,
              hint: "Needs follow-up",
            },
            { label: "Reporters", value: stats.reporters },
            {
              label: "Emails sent",
              value: stats.emails_sent,
              hint: "To authorities",
            },
          ]}
        />
      )}

      <section className="space-y-4">
        <div className="flex items-end justify-between">
          <h2 className="text-xl font-bold text-slate-800">Flagged queue</h2>
          <Link
            href="/admin/locations"
            className="text-sm font-semibold text-brand-blue hover:underline"
          >
            Manage all →
          </Link>
        </div>

        {flagged && flagged.length === 0 && (
          <p className="rounded-2xl border border-dashed border-brand-blue/40 p-8 text-center text-slate-500">
            Nothing waiting for follow-up.
          </p>
        )}

        <ul className="divide-y divide-slate-200 overflow-hidden rounded-2xl border border-slate-200 bg-brand-white">
          {flagged?.slice(0, 5).map((loc) => (
            <li
              key={loc.id}
              className="flex flex-wrap items-center justify-between gap-3 p-4"
            >
              <div>
                <p className="font-semibold text-slate-800">
                  Location #{loc.id}
                </p>
                <p className="text-xs text-slate-500">
                  {loc.latitude.toFixed(4)}, {loc.longitude.toFixed(4)} ·{" "}
                  {loc.unique_reporters} reporters
                </p>
              </div>
              <div className="flex items-center gap-3">
                <FlaggedBadge status={loc.status} />
                <Link
                  href={`/flagged/${loc.id}`}
                  className="text-sm font-semibold text-brand-blue hover:underline"
                >
                  View
                </Link>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
