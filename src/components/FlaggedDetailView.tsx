"use client";

import Link from "next/link";
import FlaggedBadge from "@/components/FlaggedBadge";
import PhotoCard from "@/components/PhotoCard";
import SlaCountdown from "@/components/SlaCountdown";
import ProofOfCleanupModal from "@/components/ProofOfCleanupModal";
import { useLocation } from "@/hooks/useLocation";

export default function FlaggedDetailView({ id }: { id: string }) {
  const { data, loading, error } = useLocation(id);

  return (
    <section className="mx-auto max-w-6xl space-y-8 px-4 py-10 animate-fade-in">
      
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <Link
          href="/flagged"
          className="group inline-flex items-center gap-2 text-sm font-semibold text-brand-blue hover:text-brand-green transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="transition-transform group-hover:-translate-x-1">
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
          Back to flagged spots
        </Link>
      </div>

      {/* Loading Skeletons */}
      {loading && (
        <div className="space-y-8 animate-pulse">
          {/* Header Skeleton */}
          <div className="h-48 w-full rounded-3xl bg-slate-200"></div>
          {/* SLA Skeleton */}
          <div className="h-24 w-full rounded-2xl bg-slate-100 border border-slate-200"></div>
          {/* Grid Skeleton */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="aspect-[4/3] rounded-2xl bg-slate-200"></div>
            ))}
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-red-100 bg-red-50/50 py-16 text-center">
          <div className="rounded-full bg-red-100 p-4">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-500">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
          </div>
          <h2 className="mt-4 text-xl font-bold text-slate-800">Location Not Found</h2>
          <p className="mt-1 max-w-md text-slate-600">
            {error}
          </p>
          <Link href="/flagged" className="mt-6 rounded-full bg-slate-800 px-6 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90">
            Return to list
          </Link>
        </div>
      )}

      {/* Main Content */}
      {!loading && !error && data && (
        <>
          {/* Header Banner */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-green to-brand-blue p-6 text-brand-white shadow-xl sm:p-8">
            {/* Decorative Background Element */}
            <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-3xl"></div>
            
            <div className="relative flex flex-col justify-between gap-6 md:flex-row md:items-start">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <h1 className="text-3xl font-bold sm:text-4xl">
                    Location #{data.location.id}
                  </h1>
                  <FlaggedBadge status={data.location.status} />
                </div>
                
                {/* Google Maps Link */}
                <a 
                  href={`https://www.google.com/maps/search/?api=1&query=${data.location.latitude},${data.location.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-sm font-medium text-white transition-colors hover:bg-white/30"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                    <circle cx="12" cy="10" r="3"></circle>
                  </svg>
                  {data.location.latitude.toFixed(6)}, {data.location.longitude.toFixed(6)}
                </a>

                <div className="flex flex-wrap items-center gap-4 text-sm text-white/90">
                  <span className="flex items-center gap-1.5">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                    <strong>{data.location.unique_reporters}</strong> unique reporters
                  </span>
                  <span className="flex items-center gap-1.5">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle></svg>
                    <strong>{data.location.report_count}</strong> photos
                  </span>
                </div>

                {data.location.flagged_at && (
                  <p className="flex items-center gap-1.5 text-sm text-white/80">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                    Flagged on {new Date(data.location.flagged_at).toLocaleString("en-KE", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </p>
                )}
              </div>

              {/* Action Area */}
              <div className="flex shrink-0 flex-col items-start gap-3 md:items-end">
                <ProofOfCleanupModal
                  locationId={data.location.id}
                  beforeImageUrl={data.reports[0]?.image_url || "/images/sample-1.jpg"}
                />
              </div>
            </div>
          </div>

          {/* 48-Hour Government SLA Escalation Timer */}
          <SlaCountdown
            flaggedAt={data.location.flagged_at}
            locationId={data.location.id}
            slaHours={48}
          />

          {/* Reports Grid */}
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <h2 className="text-2xl font-bold text-brand-green flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-brand-green/70"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle></svg>
                Community Evidence
              </h2>
              <span className="rounded-full bg-brand-blue/10 px-3 py-1 text-xs font-bold text-brand-blue">
                {data.reports.length} {data.reports.length === 1 ? 'submission' : 'submissions'}
              </span>
            </div>

            {data.reports.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-slate-50 py-16 text-center">
                <div className="rounded-full bg-slate-200 p-4">
                  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
                </div>
                <h3 className="mt-4 text-lg font-semibold text-slate-800">No photos uploaded</h3>
                <p className="mt-1 text-sm text-slate-500">This location was flagged, but the photos are missing.</p>
              </div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {data.reports.map((report) => (
                  <PhotoCard key={report.id} report={report} />
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </section>
  );
}