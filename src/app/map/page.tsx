"use client";

import dynamic from "next/dynamic";
import { useLocations } from "@/hooks/useLocations";

const MapView = dynamic(() => import("@/components/MapView"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[60vh] w-full animate-pulse items-center justify-center rounded-2xl bg-slate-100 text-slate-500 sm:h-[70vh]">
      Loading map...
    </div>
  ),
});

export default function MapPage() {
  const { data: locations, loading, error } = useLocations();

  return (
    <section className="mx-auto max-w-6xl space-y-6 px-4 py-10 animate-fade-in">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-brand-green">Map</h1>
          <p className="mt-2 text-slate-600">
            Every pinned spot in the community.
          </p>
        </div>
        <div className="flex items-center gap-4 text-sm text-slate-600">
          <span className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-brand-green" /> Open
          </span>
          <span className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-brand-blue" /> Flagged
          </span>
        </div>
      </div>

      {error && (
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
          Could not load locations: {error}
        </p>
      )}

      {!loading && !error && locations?.length === 0 && (
        <div className="rounded-2xl border border-dashed border-brand-blue/40 p-10 text-center">
          <p className="font-semibold text-slate-700">No pins yet</p>
          <p className="mt-1 text-sm text-slate-500">
            Pins appear here after the first report.
          </p>
        </div>
      )}

      {!loading && !error && locations && locations.length > 0 && (
        <MapView locations={locations} />
      )}
    </section>
  );
}
