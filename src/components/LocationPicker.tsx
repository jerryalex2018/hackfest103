"use client";

import { useGeolocation } from "@/hooks/useGeolocation";
import { useEffect } from "react";

type Props = {
  onChange: (coords: { latitude: number; longitude: number } | null) => void;
};

export default function LocationPicker({ onChange }: Props) {
  const { coords, loading, error, locate } = useGeolocation();

  useEffect(() => {
    onChange(coords);
  }, [coords, onChange]);

  return (
    <div className="overflow-hidden rounded-2xl border border-brand-green/20 bg-brand-white shadow-sm transition-all">
      
      {/* Header Section */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-5">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-green/10 text-brand-green">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                <circle cx="12" cy="10" r="3"></circle>
              </svg>
            </div>
            <p className="font-semibold text-slate-800">Pin the exact spot</p>
          </div>
          <p className="mt-1.5 text-sm text-slate-500 max-w-[250px]">
            Stand next to the problem, then tap the button to capture your GPS coordinates.
          </p>
        </div>

        <button
          type="button"
          onClick={locate}
          disabled={loading}
          className="group flex items-center gap-2 rounded-full bg-brand-green px-5 py-2.5 font-semibold text-brand-white shadow-sm transition-all hover:-translate-y-0.5 hover:bg-brand-green-dark hover:shadow-md disabled:pointer-events-none disabled:opacity-70"
        >
          {loading ? (
            <>
              <svg className="h-4 w-4 animate-spin text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Locating...
            </>
          ) : coords ? (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="transition-transform group-hover:rotate-45">
                <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"></path>
              </svg>
              Update
            </>
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <circle cx="12" cy="12" r="3"></circle>
              </svg>
              Use my location
            </>
          )}
        </button>
      </div>

      {/* Success State: Coordinates captured */}
      {coords && (
        <div className="border-t border-brand-blue/10 bg-brand-blue/5 p-4 animate-fade-in">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-brand-blue">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                Location Pinned
              </p>
              <p className="mt-1 font-mono text-sm font-bold text-slate-700">
                {coords.latitude.toFixed(6)}, {coords.longitude.toFixed(6)}
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${coords.latitude},${coords.longitude}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-brand-blue shadow-sm ring-1 ring-slate-200 transition-colors hover:bg-slate-50"
              >
                Verify on Map
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
              </a>
              
              <button
                type="button"
                onClick={() => onChange(null)}
                className="rounded-full p-1.5 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-500"
                title="Clear location"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="flex items-start gap-3 border-t border-red-100 bg-red-50 p-4 text-sm text-red-700 animate-fade-in">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 shrink-0">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
            <line x1="12" y1="9" x2="12" y2="13"></line>
            <line x1="12" y1="17" x2="12.01" y2="17"></line>
          </svg>
          <p>{error}</p>
        </div>
      )}
    </div>
  );
}