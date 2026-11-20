"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import LocationPicker from "@/components/LocationPicker";
import PhotoUploader from "@/components/PhotoUploader";
import { useUploadReport } from "@/hooks/useUploadReport";
import { getUser } from "@/lib/auth";
import type { User } from "@/lib/types";

type Coords = { latitude: number; longitude: number };

type IssueCategory =
  | "overflowing_bin"
  | "illegal_dumping"
  | "litter"
  | "broken_bin"
  | "hazardous_waste"
  | "other";

type Severity = "low" | "medium" | "high";

const MAX_BYTES = 5 * 1024 * 1024;

const CATEGORY_OPTIONS: { value: IssueCategory; label: string; hint: string }[] = [
  { value: "overflowing_bin", label: "Overflowing bin", hint: "Bins that are full and spilling over" },
  { value: "illegal_dumping", label: "Illegal dumping", hint: "Bagged or bulk waste left in the open" },
  { value: "litter", label: "Litter", hint: "Scattered small waste on streets or parks" },
  { value: "broken_bin", label: "Broken bin", hint: "Damaged, missing or unusable container" },
  { value: "hazardous_waste", label: "Hazardous waste", hint: "Sharp, chemical or medical items" },
  { value: "other", label: "Something else", hint: "Anything that doesn't fit the list" },
];

const SEVERITY_OPTIONS: {
  value: Severity;
  label: string;
  hint: string;
  active: string;
}[] = [
  {
    value: "low",
    label: "Low",
    hint: "Minor / cosmetic",
    active: "border-brand-green bg-brand-green/10 text-brand-green",
  },
  {
    value: "medium",
    label: "Medium",
    hint: "Needs attention",
    active: "border-amber-400 bg-amber-50 text-amber-700",
  },
  {
    value: "high",
    label: "High",
    hint: "Health hazard",
    active: "border-red-400 bg-red-50 text-red-700",
  },
];

export default function ReportPage() {
  const router = useRouter();
  const { submit, submitting, error, result } = useUploadReport();

  const [user, setUser] = useState<User | null>(null);
  const [checked, setChecked] = useState(false);
  const [photo, setPhoto] = useState<File | null>(null);
  const [coords, setCoords] = useState<Coords | null>(null);
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<IssueCategory | "">("");
  const [severity, setSeverity] = useState<Severity | "">("");
  const [landmark, setLandmark] = useState("");
  const [observedAt, setObservedAt] = useState(() =>
    new Date().toISOString().slice(0, 10)
  );
  const [anonymous, setAnonymous] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const maxDate = new Date().toISOString().slice(0, 10);

  // Stable callbacks: LocationPicker re-runs its effect when these change
  const handlePhoto = useCallback((file: File | null) => setPhoto(file), []);
  const handleCoords = useCallback((c: Coords | null) => setCoords(c), []);

  // Redirect to login if nobody is signed in
  useEffect(() => {
    const stored = getUser();
    if (!stored) {
      router.replace("/login");
    } else {
      setUser(stored);
    }
    setChecked(true);
  }, [router]);

  if (!checked || !user) {
    return (
      <div className="mx-auto flex min-h-[50vh] max-w-5xl items-center justify-center px-4 py-12">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-green border-t-transparent" />
          <p className="animate-pulse text-slate-500 font-medium">Verifying your account...</p>
        </div>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormError(null);

    if (!photo) return setFormError("Please add a photo of the issue first.");
    if (!coords) return setFormError("Please pin the location of the issue first.");
    if (photo.size > MAX_BYTES)
      return setFormError("The photo is over 5 MB. Please choose a smaller image.");
    if (!category) return setFormError("Please select the type of issue.");
    if (!severity) return setFormError("Please choose how severe the issue is.");
    if (!observedAt) return setFormError("Please tell us when you noticed the issue.");

    const form = new FormData();
    form.append("photo", photo);
    form.append("latitude", String(coords.latitude));
    form.append("longitude", String(coords.longitude));
    form.append("category", category);
    form.append("severity", severity);
    form.append("observed_at", observedAt);
    form.append("anonymous", String(anonymous));
    if (description.trim()) form.append("description", description.trim());
    if (landmark.trim()) form.append("landmark", landmark.trim());

    await submit(form);
  }

  // --- SUCCESS SCREEN ---
  if (result) {
    const categoryLabel =
      CATEGORY_OPTIONS.find((c) => c.value === category)?.label ?? "Report";
    const severityMeta = SEVERITY_OPTIONS.find((s) => s.value === severity);

    return (
      <section className="mx-auto max-w-2xl space-y-6 px-4 py-12 animate-fade-in">
        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-brand-white shadow-xl">
          {/* Success Header */}
          <div className="bg-gradient-to-br from-brand-green to-brand-blue p-8 text-center text-brand-white">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
            </div>
            <h1 className="text-3xl font-bold">Report Submitted!</h1>
            <p className="mt-2 text-white/90">
              Thank you for helping keep our community clean.
            </p>
          </div>

          {/* Report Summary */}
          <div className="p-8 space-y-6">
            <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100 flex gap-4">
              {/* Photo Preview */}
              {photo && (
                <div className="h-24 w-24 shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-white">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={URL.createObjectURL(photo)}
                    alt="Uploaded report"
                    className="h-full w-full object-cover"
                  />
                </div>
              )}
              <div className="flex flex-col justify-center space-y-1">
                <p className="font-semibold text-slate-800">
                  {categoryLabel} · Location #{result.location.id}
                </p>
                <p className="text-sm text-slate-500">
                  This spot has <strong className="text-brand-green">{result.location.unique_reporters}</strong> unique report{result.location.unique_reporters === 1 ? "" : "s"}.
                </p>
                {severityMeta && (
                  <span
                    className={`inline-flex w-fit items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${severityMeta.active}`}
                  >
                    {severityMeta.label} severity
                  </span>
                )}
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${result.location.latitude},${result.location.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-medium text-brand-blue hover:underline flex items-center gap-1"
                >
                  View exact location on map →
                </a>
              </div>
            </div>

            <dl className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wider text-slate-500">Observed on</dt>
                <dd className="mt-0.5 text-slate-700">{observedAt}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wider text-slate-500">Reported as</dt>
                <dd className="mt-0.5 text-slate-700">
                  {anonymous ? "Anonymous" : user.name}
                </dd>
              </div>
              {landmark.trim() && (
                <div className="col-span-2">
                  <dt className="text-xs font-semibold uppercase tracking-wider text-slate-500">Landmark</dt>
                  <dd className="mt-0.5 text-slate-700">{landmark.trim()}</dd>
                </div>
              )}
            </dl>

            {description && (
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Your Description</h3>
                <p className="text-sm text-slate-700 italic bg-slate-50 p-3 rounded-lg border border-slate-100">
                  &quot;{description}&quot;
                </p>
              </div>
            )}

            <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:justify-center">
              <Link
                href="/map"
                className="rounded-full bg-brand-blue px-6 py-3 font-semibold text-brand-white text-center transition-transform hover:-translate-y-0.5 shadow-sm"
              >
                View the map
              </Link>
              <button
                onClick={() => {
                  setPhoto(null);
                  setCoords(null);
                  setDescription("");
                  setCategory("");
                  setSeverity("");
                  setLandmark("");
                  setAnonymous(false);
                  setObservedAt(new Date().toISOString().slice(0, 10));
                  // Force a reload to clear the hook's result state
                  window.location.reload();
                }}
                className="rounded-full border-2 border-slate-200 px-6 py-3 font-semibold text-slate-700 text-center transition-colors hover:border-slate-300 hover:bg-slate-50"
              >
                Report another spot
              </button>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // --- FORM SCREEN ---
  return (
    <section className="mx-auto max-w-5xl space-y-8 px-4 py-10 animate-fade-in">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h1 className="text-3xl font-bold text-brand-green">Report a spot</h1>
          <p className="mt-2 text-slate-600">
            Take a clear photo, pin the exact location, and add a few details to alert authorities faster.
          </p>
        </div>
        <div className="inline-flex items-center gap-2 rounded-full bg-brand-green/10 px-4 py-1.5 text-sm font-medium text-brand-green">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
          Signed in as {user.name}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Step 1: Photo */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-green text-xs font-bold text-white">1</span>
              <h2 className="text-lg font-semibold text-slate-800">Upload a Photo</h2>
            </div>
            <PhotoUploader onChange={handlePhoto} />
            <div className="rounded-xl bg-brand-blue/5 p-4 text-sm text-brand-blue flex gap-3">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
              <p><strong>Tip:</strong> Make sure the problem is clearly visible and well-lit. Avoid taking photos from too far away.</p>
            </div>
          </div>

          {/* Step 2: Location */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-green text-xs font-bold text-white">2</span>
              <h2 className="text-lg font-semibold text-slate-800">Pin the Location</h2>
            </div>
            <LocationPicker onChange={handleCoords} />
            <div className="rounded-xl bg-brand-blue/5 p-4 text-sm text-brand-blue flex gap-3">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
              <p><strong>Tip:</strong> Stand as close to the spot as possible and tap &quot;Use my location&quot; for the most accurate pin.</p>
            </div>
          </div>
        </div>

        {/* Step 3: Details */}
        <div className="space-y-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-green text-xs font-bold text-white">3</span>
            <h2 className="text-lg font-semibold text-slate-800">Tell us more</h2>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            {/* Category */}
            <div className="space-y-2">
              <label htmlFor="category" className="text-sm font-semibold text-slate-700">
                Type of issue <span className="text-red-500">*</span>
              </label>
              <select
                id="category"
                required
                value={category}
                onChange={(e) => setCategory(e.target.value as IssueCategory | "")}
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-800 focus:border-brand-blue focus:outline-none focus:ring-2 focus:ring-brand-blue/30 transition-shadow"
              >
                <option value="" disabled>Select a category…</option>
                {CATEGORY_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              <p className="text-xs text-slate-400">
                {CATEGORY_OPTIONS.find((c) => c.value === category)?.hint ??
                  "Pick the closest match so the right team is dispatched."}
              </p>
            </div>

            {/* Date observed */}
            <div className="space-y-2">
              <label htmlFor="observedAt" className="text-sm font-semibold text-slate-700">
                When did you notice it? <span className="text-red-500">*</span>
              </label>
              <input
                id="observedAt"
                type="date"
                required
                max={maxDate}
                value={observedAt}
                onChange={(e) => setObservedAt(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-800 focus:border-brand-blue focus:outline-none focus:ring-2 focus:ring-brand-blue/30 transition-shadow"
              />
              <p className="text-xs text-slate-400">
                Future dates are not allowed.
              </p>
            </div>
          </div>

          {/* Severity */}
          <div className="space-y-2">
            <span className="text-sm font-semibold text-slate-700">
              How severe is it? <span className="text-red-500">*</span>
            </span>
            <div className="grid gap-3 sm:grid-cols-3">
              {SEVERITY_OPTIONS.map((opt) => {
                const selected = severity === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => setSeverity(opt.value)}
                    className={`rounded-xl border-2 px-4 py-3 text-left transition-all ${
                      selected
                        ? opt.active
                        : "border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                    }`}
                  >
                    <span className="block text-sm font-semibold">{opt.label}</span>
                    <span className="block text-xs opacity-80">{opt.hint}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Landmark */}
          <div className="space-y-2">
            <label htmlFor="landmark" className="text-sm font-semibold text-slate-700">
              Nearest landmark <span className="font-normal text-slate-400">(optional)</span>
            </label>
            <input
              id="landmark"
              type="text"
              maxLength={120}
              value={landmark}
              onChange={(e) => setLandmark(e.target.value)}
              placeholder="e.g. Opposite the Shell station on 5th Avenue"
              className="w-full rounded-xl border border-slate-300 px-4 py-3 focus:border-brand-blue focus:outline-none focus:ring-2 focus:ring-brand-blue/30 transition-shadow"
            />
            <div className="flex justify-between text-xs text-slate-400">
              <span>Helps crews find the spot faster.</span>
              <span>{landmark.length}/120</span>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label htmlFor="description" className="text-sm font-semibold text-slate-700">
              Add details <span className="font-normal text-slate-400">(optional)</span>
            </label>
            <textarea
              id="description"
              rows={3}
              maxLength={500}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="For example: overflowing bins near the bus stop, smell is strong"
              className="w-full rounded-xl border border-slate-300 px-4 py-3 focus:border-brand-blue focus:outline-none focus:ring-2 focus:ring-brand-blue/30 transition-shadow"
            />
            <div className="flex justify-between text-xs text-slate-400">
              <span>Helpful details speed up the cleanup.</span>
              <span>{description.length}/500</span>
            </div>
          </div>

          {/* Anonymous */}
          <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
            <input
              type="checkbox"
              checked={anonymous}
              onChange={(e) => setAnonymous(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-slate-300 text-brand-green focus:ring-brand-green"
            />
            <span className="text-sm">
              <span className="font-semibold text-slate-800">Report anonymously</span>
              <span className="block text-slate-500">
                Your name will be hidden from public views, but authorities can still contact you.
              </span>
            </span>
          </label>
        </div>

        {/* Error Banner */}
        {(formError || error) && (
          <div className="flex items-start gap-3 rounded-xl bg-red-50 p-4 text-sm text-red-700 border border-red-100">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 mt-0.5"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
            <div>
              <p className="font-semibold">Cannot submit report</p>
              <p>{formError ?? error}</p>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={submitting}
          className="group flex w-full items-center justify-center gap-2 rounded-full bg-brand-green px-6 py-4 text-lg font-semibold text-brand-white shadow-md transition-all hover:-translate-y-0.5 hover:bg-brand-green-dark hover:shadow-lg disabled:pointer-events-none disabled:opacity-50 disabled:hover:translate-y-0"
        >
          {submitting ? (
            <>
              <svg className="h-5 w-5 animate-spin text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
              Submitting...
            </>
          ) : (
            <>
              Submit report
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="transition-transform group-hover:translate-x-1"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
            </>
          )}
        </button>
      </form>
    </section>
  );
}