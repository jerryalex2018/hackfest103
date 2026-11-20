"use client";

import dynamic from "next/dynamic";
import { useLocations } from "@/hooks/useLocations";

const GpsTrackerView = dynamic(() => import("@/components/GpsTrackerView"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[60vh] w-full animate-pulse items-center justify-center rounded-2xl bg-slate-100 text-slate-500 sm:h-[70vh]">
      Initializing GPS & OpenStreetMap telemetry...
    </div>
  ),
});

export default function TrackingPage() {
  const { data: locations, loading, error } = useLocations();

  return (
    <section className="mx-auto max-w-7xl space-y-6 px-4 py-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Live GPS <span className="text-brand-blue">Patrol Tracker</span>
            </h1>
            <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-semibold text-brand-blue animate-pulse">
              Active GPS
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-500">
            Real-time field navigation using OpenStreetMap, breadcrumb routing, and automatic degradation proximity alerts.
          </p>
        </div>

        <div className="flex items-center gap-4 text-xs font-medium text-slate-600">
          <span className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-full bg-brand-blue ring-2 ring-blue-300" /> Current Position
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-full bg-red-600" /> Flagged Sites
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-full bg-brand-green" /> Open Sites
          </span>
        </div>
      </div>

      {error && (
        <div className="rounded-xl bg-red-50 p-4 text-sm text-red-700">
          Could not load locations: {error}
        </div>
      )}

      {loading ? (
        <div className="h-[60vh] rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-400">
          Loading map coordinates...
        </div>
      ) : (
        <GpsTrackerView locations={locations || []} />
      )}
    </section>
  );
}
