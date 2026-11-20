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
  const [searchQuery, setSearchQuery] = useState("");
  const [overrides, setOverrides] = useState<Record<number, LocationStatus>>({});

  // 1. Apply local overrides so the UI updates instantly after an action
  const localizedLocations = (locations ?? []).map((loc) => ({
    ...loc,
    status: overrides[loc.id] ?? loc.status,
  }));

  // 2. Calculate summary stats based on all locations
  const stats = {
    total: localizedLocations.length,
    flagged: localizedLocations.filter((l) => l.status === "flagged").length,
    resolved: localizedLocations.filter((l) => l.status === "resolved").length,
    totalReports: localizedLocations.reduce((sum, l) => sum + l.report_count, 0),
  };

  // 3. Filter by status AND search query
  const rows = localizedLocations.filter((loc) => {
    const matchesFilter = filter === "all" || loc.status === filter;
    
    const query = searchQuery.toLowerCase();
    const matchesSearch = 
      loc.id.toString().includes(query) ||
      loc.latitude.toString().includes(query) ||
      loc.longitude.toString().includes(query) ||
      loc.status.toLowerCase().includes(query);

    return matchesFilter && matchesSearch;
  });

  async function change(id: number, status: LocationStatus) {
    const ok = await setStatus(id, status);
    if (ok) setOverrides((prev) => ({ ...prev, [id]: status }));
  }

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div>
        <h1 className="text-3xl font-bold text-brand-green">Locations</h1>
        <p className="mt-2 text-slate-600">
          Review pinned spots, monitor community reports, and update their status.
        </p>
      </div>

      {/* Stats Section */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-brand-green/20 bg-brand-white p-5 shadow-sm">
          <div className="flex items-center gap-3 text-brand-blue">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
            <h3 className="text-sm font-semibold uppercase tracking-wider">Total Spots</h3>
          </div>
          <p className="mt-4 text-3xl font-bold text-slate-800">{stats.total}</p>
        </div>
        <div className="rounded-2xl border border-brand-green/20 bg-brand-white p-5 shadow-sm">
          <div className="flex items-center gap-3 text-red-500">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"></path><line x1="4" y1="22" x2="4" y2="15"></line></svg>
            <h3 className="text-sm font-semibold uppercase tracking-wider">Flagged</h3>
          </div>
          <p className="mt-4 text-3xl font-bold text-slate-800">{stats.flagged}</p>
        </div>
        <div className="rounded-2xl border border-brand-green/20 bg-brand-white p-5 shadow-sm">
          <div className="flex items-center gap-3 text-brand-green">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
            <h3 className="text-sm font-semibold uppercase tracking-wider">Resolved</h3>
          </div>
          <p className="mt-4 text-3xl font-bold text-slate-800">{stats.resolved}</p>
        </div>
        <div className="rounded-2xl border border-brand-green/20 bg-brand-white p-5 shadow-sm">
          <div className="flex items-center gap-3 text-brand-blue">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
            <h3 className="text-sm font-semibold uppercase tracking-wider">Total Reports</h3>
          </div>
          <p className="mt-4 text-3xl font-bold text-slate-800">{stats.totalReports}</p>
        </div>
      </div>

      {/* Controls Section: Search & Filters */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        {/* Status Filters */}
        <div className="flex flex-wrap gap-2">
          {filters.map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={`rounded-full px-4 py-2 text-sm font-medium capitalize transition-colors ${
                filter === f
                  ? "bg-brand-green text-brand-white shadow-sm"
                  : "bg-brand-white text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50 hover:ring-brand-blue"
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <div className="relative w-full max-w-xs">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input
            type="text"
            placeholder="Search ID, coordinates, status..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-full border border-slate-200 bg-brand-white py-2 pl-10 pr-4 text-sm outline-none transition-colors focus:border-brand-blue focus:ring-1 focus:ring-brand-blue/20"
          />
        </div>
      </div>

      {/* Error States */}
      {error && (
        <div className="rounded-xl bg-red-50 p-4 text-sm text-red-700">
          <p className="font-semibold">Failed to load locations</p>
          <p className="mt-1 opacity-90">{error}</p>
        </div>
      )}
      {saveError && (
        <div className="rounded-xl bg-red-50 p-4 text-sm text-red-700">
          <p className="font-semibold">Could not save changes</p>
          <p className="mt-1 opacity-90">{saveError}</p>
        </div>
      )}

      {/* Loading Skeletons */}
      {loading && (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-brand-white">
          <div className="animate-pulse">
            <div className="h-12 border-b border-slate-200 bg-slate-50"></div>
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center gap-4 border-b border-slate-100 p-4">
                <div className="h-5 w-12 rounded bg-slate-200"></div>
                <div className="h-5 w-32 rounded bg-slate-200"></div>
                <div className="h-5 w-16 rounded bg-slate-200"></div>
                <div className="h-5 w-16 rounded bg-slate-200"></div>
                <div className="h-6 w-20 rounded-full bg-slate-200"></div>
                <div className="h-8 w-24 rounded-full bg-slate-200 ml-auto"></div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Data Table */}
      {!loading && !error && (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-brand-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 font-semibold">ID</th>
                  <th className="px-6 py-4 font-semibold">Coordinates</th>
                  <th className="px-6 py-4 font-semibold">Reporters</th>
                  <th className="px-6 py-4 font-semibold">Photos</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  <th className="px-6 py-4 font-semibold text-right">Change to</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rows.map((loc) => (
                  <tr key={loc.id} className="transition-colors hover:bg-brand-blue/5 group">
                    <td className="px-6 py-4 font-semibold text-slate-800">
                      #{loc.id}
                    </td>
                    
                    {/* Clickable Coordinates */}
                    <td className="px-6 py-4 text-slate-600">
                      <a 
                        href={`https://www.google.com/maps/search/?api=1&query=${loc.latitude},${loc.longitude}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 hover:text-brand-blue hover:underline"
                        title="Open in Google Maps"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                        {loc.latitude.toFixed(4)}, {loc.longitude.toFixed(4)}
                      </a>
                    </td>

                    <td className="px-6 py-4">
                      <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-bold text-slate-700">
                        {loc.unique_reporters} unique
                      </span>
                    </td>
                    
                    <td className="px-6 py-4 text-slate-600">
                      {loc.report_count}
                    </td>
                    
                    <td className="px-6 py-4">
                      <FlaggedBadge status={loc.status} />
                    </td>
                    
                    {/* Action Buttons */}
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap justify-end gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                        {statuses
                          .filter((s) => s !== loc.status)
                          .map((s) => (
                            <button
                              key={s}
                              type="button"
                              disabled={saving === loc.id}
                              onClick={() => change(loc.id, s)}
                              className={`rounded-full border px-3 py-1 text-xs font-medium capitalize transition-colors disabled:opacity-50 ${
                                s === "flagged" ? "border-red-200 text-red-600 hover:bg-red-50" :
                                s === "resolved" ? "border-brand-green/30 text-brand-green hover:bg-brand-green/10" :
                                "border-brand-blue/30 text-brand-blue hover:bg-brand-blue/10"
                              }`}
                            >
                              {saving === loc.id ? "Saving..." : s}
                            </button>
                          ))}
                      </div>
                    </td>
                  </tr>
                ))}
                
                {/* Empty State inside Table */}
                {rows.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-16 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <div className="rounded-full bg-slate-50 p-3">
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                        </div>
                        <h3 className="mt-4 text-base font-semibold text-slate-800">No locations found</h3>
                        <p className="mt-1 text-sm text-slate-500">
                          {searchQuery ? "No results match your search criteria." : "There are no locations matching this filter."}
                        </p>
                        {(searchQuery || filter !== "all") && (
                          <button 
                            onClick={() => { setSearchQuery(""); setFilter("all"); }}
                            className="mt-4 text-sm font-medium text-brand-blue hover:underline"
                          >
                            Clear all filters
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}