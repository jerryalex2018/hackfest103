"use client";

import { useState } from "react";
import FlaggedBadge from "@/components/FlaggedBadge";
import { useLocations } from "@/hooks/useLocations";
import { useUpdateLocationStatus } from "@/hooks/useUpdateLocationStatus";
import type { LocationStatus } from "@/lib/types";

const filters: ("all" | LocationStatus)[] = [
  "all",
  "open",
  "flagged",
  "resolved",
];
const statuses: LocationStatus[] = ["open", "flagged", "resolved"];

export default function AdminLocationsPage() {
  const { data: locations, loading, error } = useLocations();
  const { setStatus, saving, error: saveError } = useUpdateLocationStatus();
  const [filter, setFilter] = useState<"all" | LocationStatus>("all");
  const [overrides, setOverrides] = useState<Record<number, LocationStatus>>(
    {},
  );

  const rows = (locations ?? [])
    .map((loc) => ({ ...loc, status: overrides[loc.id] ?? loc.status }))
    .filter((loc) => filter === "all" || loc.status === filter);

  async function change(id: number, status: LocationStatus) {
    const ok = await setStatus(id, status);
    if (ok) setOverrides((prev) => ({ ...prev, [id]: status }));
  }

  return (
    <>
      <div>
        <h1 className="text-3xl font-bold text-brand-green">Locations</h1>
        <p className="mt-2 text-slate-600">
          Review pinned spots and update their status.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {filters.map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={`rounded-full px-4 py-2 text-sm font-medium capitalize transition-colors ${
              filter === f
                ? "bg-brand-green text-brand-white"
                : "bg-brand-white text-slate-700 ring-1 ring-slate-200 hover:ring-brand-blue"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {loading && (
        <p className="animate-pulse text-slate-500">Loading locations...</p>
      )}
      {error && (
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}
      {saveError && (
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
          Could not save: {saveError}
        </p>
      )}

      {!loading && !error && (
        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-brand-white">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-brand-green/5 text-xs uppercase tracking-wider text-slate-600">
              <tr>
                <th className="px-4 py-3">ID</th>
                <th className="px-4 py-3">Coordinates</th>
                <th className="px-4 py-3">Reporters</th>
                <th className="px-4 py-3">Photos</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Change to</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.map((loc) => (
                <tr key={loc.id} className="hover:bg-brand-blue/5">
                  <td className="px-4 py-3 font-semibold text-slate-800">
                    #{loc.id}
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {loc.latitude.toFixed(4)}, {loc.longitude.toFixed(4)}
                  </td>
                  <td className="px-4 py-3">{loc.unique_reporters}</td>
                  <td className="px-4 py-3">{loc.report_count}</td>
                  <td className="px-4 py-3">
                    <FlaggedBadge status={loc.status} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      {statuses
                        .filter((s) => s !== loc.status)
                        .map((s) => (
                          <button
                            key={s}
                            type="button"
                            disabled={saving === loc.id}
                            onClick={() => change(loc.id, s)}
                            className="rounded-full border border-brand-blue/40 px-3 py-1 text-xs font-medium capitalize text-brand-blue transition-colors hover:bg-brand-blue hover:text-brand-white disabled:opacity-50"
                          >
                            {saving === loc.id ? "Saving..." : s}
                          </button>
                        ))}
                    </div>
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-10 text-center text-slate-500"
                  >
                    No locations match this filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
