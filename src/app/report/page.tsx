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

const MAX_BYTES = 5 * 1024 * 1024;

export default function ReportPage() {
  const router = useRouter();
  const { submit, submitting, error, result } = useUploadReport();

  const [user, setUser] = useState<User | null>(null);
  const [checked, setChecked] = useState(false);
  const [photo, setPhoto] = useState<File | null>(null);
  const [coords, setCoords] = useState<Coords | null>(null);
  const [description, setDescription] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

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
      <p className="mx-auto max-w-5xl px-4 py-12 animate-pulse text-slate-500">
        Checking your account...
      </p>
    );
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormError(null);

    if (!photo) return setFormError("Add a photo first.");
    if (!coords) return setFormError("Pin your location first.");
    if (photo.size > MAX_BYTES)
      return setFormError("The photo is over 5 MB. Choose a smaller one.");

    const form = new FormData();
    form.append("photo", photo);
    form.append("latitude", String(coords.latitude));
    form.append("longitude", String(coords.longitude));
    if (description.trim()) form.append("description", description.trim());

    await submit(form);
  }

  if (result) {
    return (
      <section className="mx-auto max-w-2xl space-y-6 px-4 py-12 text-center animate-fade-in">
        <div className="rounded-3xl bg-gradient-to-br from-brand-green to-brand-blue p-10 text-brand-white shadow-lg">
          <h1 className="text-3xl font-bold">Thanks for reporting</h1>
          <p className="mt-3 opacity-95">
            Your pin is live. This spot has {result.location.unique_reporters}{" "}
            report
            {result.location.unique_reporters === 1 ? "" : "s"} so far.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              href="/map"
              className="rounded-full bg-brand-white px-6 py-3 font-semibold text-brand-green"
            >
              View the map
            </Link>
            <Link
              href="/recent"
              className="rounded-full border-2 border-brand-white px-6 py-3 font-semibold text-brand-white"
            >
              See recent reports
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-5xl space-y-8 px-4 py-10 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-brand-green">Report a spot</h1>
        <p className="mt-2 text-slate-600">
          Take a clear photo, then pin the exact location. Signed in as{" "}
          {user.name}.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="grid gap-8 lg:grid-cols-2">
        <div className="space-y-6">
          <PhotoUploader onChange={handlePhoto} />
        </div>

        <div className="space-y-6">
          <LocationPicker onChange={handleCoords} />

          <div className="space-y-2">
            <label
              htmlFor="description"
              className="text-sm font-semibold text-slate-700"
            >
              What is the problem?{" "}
              <span className="font-normal text-slate-400">(optional)</span>
            </label>
            <textarea
              id="description"
              rows={4}
              maxLength={500}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="For example: overflowing bins near the bus stop"
              className="w-full rounded-xl border border-slate-300 px-4 py-3 focus:border-brand-blue focus:outline-none focus:ring-2 focus:ring-brand-blue/30"
            />
            <p className="text-right text-xs text-slate-400">
              {description.length}/500
            </p>
          </div>

          {(formError || error) && (
            <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
              {formError ?? error}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-full bg-brand-green px-6 py-4 text-lg font-semibold text-brand-white transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {submitting ? "Submitting..." : "Submit report"}
          </button>
        </div>
      </form>
    </section>
  );
}
