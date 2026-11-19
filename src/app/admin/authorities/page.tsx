"use client";

import { useAuthorities } from "@/hooks/useAuthorities";

export default function AdminAuthoritiesPage() {
  const { data: authorities, loading, error } = useAuthorities();

  return (
    <>
      <div>
        <h1 className="text-3xl font-bold text-brand-green">Authorities</h1>
        <p className="mt-2 text-slate-600">
          Offices that receive an email when a spot is flagged.
        </p>
      </div>

      {loading && (
        <p className="animate-pulse text-slate-500">Loading authorities...</p>
      )}
      {error && (
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}

      {authorities && (
        <div className="grid gap-4 md:grid-cols-2">
          {authorities.map((a) => (
            <div
              key={a.id}
              className="animate-fade-in rounded-2xl border border-brand-green/20 bg-brand-white p-6 shadow-sm"
            >
              <p className="text-xs font-semibold uppercase tracking-wider text-brand-blue">
                {a.region ?? "Region not set"}
              </p>
              <h2 className="mt-2 text-lg font-semibold text-slate-800">
                {a.name}
              </h2>
              <a
                href={`mailto:${a.email}`}
                className="mt-1 block text-sm text-slate-600 hover:text-brand-blue"
              >
                {a.email}
              </a>
              <p className="mt-4 text-sm text-slate-500">
                Notified{" "}
                <span className="font-semibold text-brand-green">
                  {a.notified_count}
                </span>{" "}
                times
              </p>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
