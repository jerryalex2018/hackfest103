"use client";

import { useState } from "react";
import { useAuthorities } from "@/hooks/useAuthorities";

export default function AdminAuthoritiesPage() {
  const { data: authorities, loading, error } = useAuthorities();
  const [searchQuery, setSearchQuery] = useState("");

  // Calculate Stats
  const totalAuthorities = authorities?.length || 0;
  const uniqueRegions = new Set(authorities?.map((a) => a.region)).size;
  const totalNotifications =
    authorities?.reduce((sum, a) => sum + (a.notified_count || 0), 0) || 0;

  // Filter authorities based on search
  const filteredAuthorities = authorities?.filter((a) => {
    const query = searchQuery.toLowerCase();
    return (
      a.name.toLowerCase().includes(query) ||
      (a.region && a.region.toLowerCase().includes(query)) ||
      a.email.toLowerCase().includes(query)
    );
  });

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-bold text-brand-green">Authorities</h1>
          <p className="mt-2 text-slate-600">
            Offices that receive an email when a spot is flagged.
          </p>
        </div>
        <button className="inline-flex items-center justify-center gap-2 rounded-full bg-brand-blue px-5 py-2.5 text-sm font-semibold text-brand-white transition-opacity hover:opacity-90">
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
          >
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          Add Authority
        </button>
      </div>

      {/* Stats Section */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-brand-green/20 bg-brand-white p-5 shadow-sm">
          <div className="flex items-center gap-3 text-brand-blue">
            {/* Building Icon */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect>
              <path d="M9 22v-4h6v4"></path>
              <path d="M8 6h.01"></path>
              <path d="M16 6h.01"></path>
              <path d="M12 6h.01"></path>
              <path d="M12 10h.01"></path>
              <path d="M12 14h.01"></path>
              <path d="M16 10h.01"></path>
              <path d="M16 14h.01"></path>
              <path d="M8 10h.01"></path>
              <path d="M8 14h.01"></path>
            </svg>
            <h3 className="text-sm font-semibold uppercase tracking-wider">
              Total Authorities
            </h3>
          </div>
          <p className="mt-4 text-3xl font-bold text-slate-800">
            {totalAuthorities}
          </p>
        </div>
        <div className="rounded-2xl border border-brand-green/20 bg-brand-white p-5 shadow-sm">
          <div className="flex items-center gap-3 text-brand-blue">
            {/* Map Pin Icon */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
              <circle cx="12" cy="10" r="3"></circle>
            </svg>
            <h3 className="text-sm font-semibold uppercase tracking-wider">
              Regions Covered
            </h3>
          </div>
          <p className="mt-4 text-3xl font-bold text-slate-800">
            {uniqueRegions}
          </p>
        </div>
        <div className="rounded-2xl border border-brand-green/20 bg-brand-white p-5 shadow-sm">
          <div className="flex items-center gap-3 text-brand-blue">
            {/* Bell Icon */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
            </svg>
            <h3 className="text-sm font-semibold uppercase tracking-wider">
              Total Notifications
            </h3>
          </div>
          <p className="mt-4 text-3xl font-bold text-slate-800">
            {totalNotifications}
          </p>
        </div>
      </div>

      {/* Search & Filter Section */}
      <div className="flex items-center gap-4">
        <div className="relative w-full max-w-md">
          {/* Search Icon */}
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
            placeholder="Search by name, region, or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-brand-white py-2.5 pl-10 pr-4 text-sm outline-none transition-colors focus:border-brand-blue focus:ring-1 focus:ring-brand-blue/20"
          />
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="rounded-xl bg-red-50 p-4 text-sm text-red-700">
          <p className="font-semibold">Failed to load authorities</p>
          <p className="mt-1 opacity-90">{error}</p>
        </div>
      )}

      {/* Loading State (Skeletons) */}
      {loading && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="animate-pulse rounded-2xl border border-slate-100 bg-brand-white p-6 shadow-sm"
            >
              <div className="h-4 w-1/3 rounded bg-slate-200"></div>
              <div className="mt-4 h-6 w-2/3 rounded bg-slate-200"></div>
              <div className="mt-2 h-4 w-1/2 rounded bg-slate-200"></div>
              <div className="mt-6 h-4 w-1/4 rounded bg-slate-200"></div>
            </div>
          ))}
        </div>
      )}

      {/* Content Section */}
      {!loading && !error && (
        <>
          {filteredAuthorities && filteredAuthorities.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredAuthorities.map((a) => (
                <div
                  key={a.id}
                  className="group relative flex flex-col justify-between rounded-2xl border border-brand-green/20 bg-brand-white p-6 shadow-sm transition-all hover:border-brand-blue/40 hover:shadow-md"
                >
                  <div>
                    {/* Card Header & Action Button */}
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-green/10 px-2.5 py-1 text-xs font-semibold tracking-wide text-brand-green">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="12"
                            height="12"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                            <circle cx="12" cy="10" r="3"></circle>
                          </svg>
                          {a.region ?? "Region not set"}
                        </span>
                        <h2 className="mt-3 text-lg font-bold text-slate-800">
                          {a.name}
                        </h2>
                      </div>
                      <button className="rounded-full p-1.5 text-slate-400 opacity-0 transition-colors hover:bg-slate-100 hover:text-slate-700 group-hover:opacity-100">
                        {/* More Vertical Icon */}
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <circle cx="12" cy="12" r="1"></circle>
                          <circle cx="12" cy="5" r="1"></circle>
                          <circle cx="12" cy="19" r="1"></circle>
                        </svg>
                      </button>
                    </div>

                    {/* Email */}
                    <a
                      href={`mailto:${a.email}`}
                      className="mt-2 inline-flex items-center gap-2 text-sm text-slate-600 transition-colors hover:text-brand-blue"
                    >
                      {/* Mail Icon */}
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
                        className="text-slate-400"
                      >
                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                        <polyline points="22,6 12,13 2,6"></polyline>
                      </svg>
                      {a.email}
                    </a>
                  </div>

                  {/* Footer Stats */}
                  <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4">
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                      {/* Bell Icon */}
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
                        className="text-brand-blue/70"
                      >
                        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                        <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                      </svg>
                      Notified
                    </div>
                    <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-bold text-slate-700">
                      {a.notified_count} times
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* Empty State */
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50/50 py-16 text-center">
              <div className="rounded-full bg-slate-100 p-4">
                {/* Users Icon */}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="32"
                  height="32"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-slate-400"
                >
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                  <circle cx="9" cy="7" r="4"></circle>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                </svg>
              </div>
              <h3 className="mt-4 text-lg font-semibold text-slate-800">
                No authorities found
              </h3>
              <p className="mt-1 max-w-sm text-sm text-slate-500">
                {searchQuery
                  ? "No authorities match your search criteria. Try adjusting your search."
                  : "You haven't added any authorities yet. Add one to start routing flagged spots."}
              </p>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="mt-4 text-sm font-medium text-brand-blue hover:underline"
                >
                  Clear search
                </button>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}