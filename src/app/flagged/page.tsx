"use client";

import Link from "next/link";
import FlaggedBadge from "@/components/FlaggedBadge";
import { useFlaggedLocations } from "@/hooks/useFlaggedLocations";

export default function FlaggedPage() {
  const { data: locations, loading, error } = useFlaggedLocations();

  return (
    <section className="mx-auto max-w-6xl space-y-8 px-4 py-10 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-brand-green">
          Flagged locations
        </h1>
        <p className="mt-2 text-slate-600">
          Spots reported by more than 10 different people. These have been sent
          to local authorities.
        </p>
      </div>

      {loading && (
        <p className="animate-pulse text-slate-500">Loading flagged spots...</p>
      )}

      {error && (
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
          Could not load flagged spots: {error}
        </p>
      )}

      {!loading && !error && locations?.length === 0 && (
        <div className="rounded-2xl border border-dashed border-brand-blue/40 p-10 text-center">
          <p className="font-semibold text-slate-700">No flagged spots</p>
          <p className="mt-1 text-sm text-slate-500">
            Spots appear here once 11 different people report them.
          </p>
        </div>
      )}

      {!loading && !error && locations && locations.length > 0 && (
        <ul className="grid gap-4 sm:grid-cols-2">
          {locations.map((loc) => (
            <li key={loc.id}>
              <Link
                href={`/flagged/${loc.id}`}
                className="flex items-center justify-between gap-4 rounded-2xl border border-brand-blue/30 bg-brand-white p-5 shadow-sm transition-transform hover:-translate-y-1 hover:shadow-md"
              >
                <div className="space-y-1">
                  <p className="font-semibold text-slate-800">
                    Location #{loc.id}
                  </p>
                  <p className="text-sm text-slate-500">
                    {loc.unique_reporters} people reported · {loc.report_count}{" "}
                    photos
                  </p>
                  <p className="text-xs text-brand-blue">
                    {loc.latitude.toFixed(4)}, {loc.longitude.toFixed(4)}
                  </p>
                </div>
                <FlaggedBadge status={loc.status} />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
