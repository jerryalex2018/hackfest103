"use client";

import { useState } from "react";
import Link from "next/link";
import FlaggedBadge from "@/components/FlaggedBadge";
import { useFlaggedLocations } from "@/hooks/useFlaggedLocations";

export default function FlaggedPage() {
  const { data: locations, loading, error } = useFlaggedLocations();
  const [searchQuery, setSearchQuery] = useState("");

  // Filter locations based on search query
  const filteredLocations = locations?.filter((loc) => {
    const query = searchQuery.toLowerCase();
    return (
      loc.id.toString().includes(query) ||
      loc.latitude.toString().includes(query) ||
      loc.longitude.toString().includes(query)
    );
  });

  return (
    <section className="mx-auto max-w-6xl space-y-8 px-4 py-10 animate-fade-in">
      
      {/* Header Section */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h1 className="text-3xl font-bold text-brand-green">
            Flagged locations
          </h1>
          <p className="mt-2 text-slate-600 max-w-2xl">
            Spots reported by more than 10 different people. These have been automatically routed to local authorities for review.
          </p>
        </div>
        
        {/* Search Bar */}
        <div className="relative w-full max-w-xs">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
          >
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input
            type="text"
            placeholder="Search by ID or coordinates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-full border border-slate-200 bg-brand-white py-2 pl-10 pr-4 text-sm outline-none transition-colors focus:border-brand-blue focus:ring-1 focus:ring-brand-blue/20"
          />
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="rounded-xl bg-red-50 p-4 text-sm text-red-700">
          <p className="font-semibold">Could not load flagged spots</p>
          <p className="mt-1 opacity-90">{error}</p>
        </div>
      )}

      {/* Loading Skeletons */}
      {loading && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="animate-pulse flex flex-col justify-between rounded-2xl border border-slate-200 bg-brand-white p-5 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <div className="h-6 w-24 rounded bg-slate-200"></div>
                <div className="h-6 w-16 rounded-full bg-slate-200"></div>
              </div>
              <div className="mt-6 space-y-3">
                <div className="h-4 w-1/2 rounded bg-slate-200"></div>
                <div className="h-4 w-2/3 rounded bg-slate-200"></div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State (No flagged spots at all) */}
      {!loading && !error && locations?.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-brand-blue/40 bg-slate-50/50 py-16 text-center">
          <div className="rounded-full bg-brand-blue/10 p-4">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-brand-blue">
              <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"></path>
              <line x1="4" y1="22" x2="4" y2="15"></line>
            </svg>
          </div>
          <h3 className="mt-4 text-lg font-semibold text-slate-800">No flagged spots yet</h3>
          <p className="mt-1 max-w-md text-sm text-slate-500">
            Spots appear here automatically once 11 different community members report the same location.
          </p>
        </div>
      )}

      {/* Search Empty State */}
      {!loading && !error && locations && locations.length > 0 && filteredLocations?.length === 0 && (
        <div className="rounded-2xl border border-slate-200 bg-slate-50 py-12 text-center">
          <p className="font-semibold text-slate-700">No results found</p>
          <p className="mt-1 text-sm text-slate-500">
            No flagged locations match "{searchQuery}".
          </p>
          <button
            onClick={() => setSearchQuery("")}
            className="mt-4 text-sm font-medium text-brand-blue hover:underline"
          >
            Clear search
          </button>
        </div>
      )}

      {/* Flagged Locations Grid */}
      {!loading && !error && filteredLocations && filteredLocations.length > 0 && (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredLocations.map((loc) => (
            <li key={loc.id}>
              <Link
                href={`/flagged/${loc.id}`}
                className="group flex h-full flex-col justify-between gap-4 rounded-2xl border border-slate-200 bg-brand-white p-5 shadow-sm transition-all hover:-translate-y-1 hover:border-brand-blue/50 hover:shadow-md"
              >
                <div>
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-4">
                    <h2 className="text-lg font-bold text-slate-800 group-hover:text-brand-blue transition-colors">
                      Location #{loc.id}
                    </h2>
                    <FlaggedBadge status={loc.status} />
                  </div>

                  {/* Stats */}
                  <div className="mt-4 space-y-2">
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400">
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                        <circle cx="9" cy="7" r="4"></circle>
                        <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                        <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                      </svg>
                      <span className="font-semibold text-slate-800">{loc.unique_reporters}</span> people reported
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400">
                        <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
                        <circle cx="12" cy="13" r="4"></circle>
                      </svg>
                      <span className="font-semibold text-slate-800">{loc.report_count}</span> photos attached
                    </div>
                  </div>
                </div>

                {/* Footer / Coordinates */}
                <div className="flex items-center justify-between border-t border-slate-100 pt-3">
                  <p className="flex items-center gap-1.5 text-xs font-medium text-brand-blue">
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                      <circle cx="12" cy="10" r="3"></circle>
                    </svg>
                    {loc.latitude.toFixed(4)}, {loc.longitude.toFixed(4)}
                  </p>
                  
                  {/* View Details Cue */}
                  <span className="flex items-center gap-1 text-xs font-semibold text-slate-400 opacity-0 transition-opacity group-hover:opacity-100">
                    View
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="5" y1="12" x2="19" y2="12"></line>
                      <polyline points="12 5 19 12 12 19"></polyline>
                    </svg>
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}