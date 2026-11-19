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
    <div className="rounded-2xl border border-brand-green/20 bg-brand-white p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-semibold text-slate-800">Pin the exact spot</p>
          <p className="text-sm text-slate-500">
            Stand next to the problem, then tap the button.
          </p>
        </div>
        <button
          type="button"
          onClick={locate}
          disabled={loading}
          className="rounded-full bg-brand-green px-5 py-3 font-semibold text-brand-white transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {loading
            ? "Locating..."
            : coords
              ? "Update location"
              : "Use my location"}
        </button>
      </div>

      {coords && (
        <p className="mt-4 rounded-xl bg-brand-blue/10 px-4 py-2 text-sm text-brand-blue">
          {coords.latitude.toFixed(6)}, {coords.longitude.toFixed(6)}
        </p>
      )}
      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
    </div>
  );
}
