"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import LocationPicker from "@/components/LocationPicker";
import PhotoUploader from "@/components/PhotoUploader";
import { useUploadReport } from "@/hooks/useUploadReport";
import { getUser } from "@/lib/auth";
import { fileToBase64Optimized } from "@/lib/supabase";
import type { User } from "@/lib/types";

type Coords = { latitude: number; longitude: number };

const MAX_BYTES = 5 * 1024 * 1024;

interface AiTriageData {
  category: string;
  severity: "low" | "medium" | "high" | "critical";
  hazardScore: number;
  description: string;
  recommendedAction: string;
}

export default function ReportPage() {
  const router = useRouter();
  const { submit, submitting, error, result } = useUploadReport();

  const [user, setUser] = useState<User | null>(null);
  const [checked, setChecked] = useState(false);
  const [photo, setPhoto] = useState<File | null>(null);
  const [coords, setCoords] = useState<Coords | null>(null);
  const [description, setDescription] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  // AI Triage State
  const [isAnalyzingAi, setIsAnalyzingAi] = useState(false);
  const [aiTriage, setAiTriage] = useState<AiTriageData | null>(null);

  // Stable callback for PhotoUploader
  const handlePhoto = useCallback(async (file: File | null) => {
    setPhoto(file);
    if (!file) {
      setAiTriage(null);
      return;
    }

    // Run Instant Gemini Multimodal Visual Triage in Background
    setIsAnalyzingAi(true);
    try {
      const base64 = await fileToBase64Optimized(file);
      const res = await fetch("/api/ai/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrl: base64 }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.analysis) {
          setAiTriage(data.analysis);
        }
      }
    } catch (err) {
      console.warn("AI Triage background error:", err);
    } finally {
      setIsAnalyzingAi(false);
    }
  }, []);

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

    // Pass Gemini AI Triage fields
    if (aiTriage) {
      form.append("category", aiTriage.category);
      form.append("severity", aiTriage.severity);
      form.append("ai_analysis", JSON.stringify(aiTriage));
    }

    await submit(form);
  }

  if (result) {
    return (
      <section className="mx-auto max-w-2xl space-y-6 px-4 py-12 text-center animate-fade-in">
        <div className="rounded-3xl bg-gradient-to-br from-brand-green to-brand-blue p-10 text-brand-white shadow-lg">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white/20 text-3xl">
            ✓
          </div>
          <h1 className="text-3xl font-bold">Report Live on Map!</h1>
          <p className="mt-3 opacity-95">
            Your degradation pin is recorded in Supabase. This spot has{" "}
            {result.location.unique_reporters} report
            {result.location.unique_reporters === 1 ? "" : "s"} so far.
          </p>

          {aiTriage && (
            <div className="mt-6 rounded-2xl bg-white/10 p-4 text-left text-sm backdrop-blur-xs">
              <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-emerald-200">
                <span>🤖 Gemini Vision Triage</span>
                <span>Severity: {aiTriage.severity}</span>
              </div>
              <p className="mt-1 font-medium">{aiTriage.category}</p>
              <p className="mt-1 text-xs opacity-80">{aiTriage.recommendedAction}</p>
              <p className="mt-2 text-[11px] text-amber-200 font-mono">
                ⏱️ 48-Hour SLA Countdown has started. County authorities alerted.
              </p>
            </div>
          )}

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              href="/map"
              className="rounded-full bg-brand-white px-6 py-3 font-semibold text-brand-green shadow-md hover:bg-slate-100 transition"
            >
              View the map
            </Link>
            <Link
              href="/recent"
              className="rounded-full border-2 border-brand-white px-6 py-3 font-semibold text-brand-white hover:bg-white/10 transition"
            >
              See recent reports
            </Link>
          </div>
        </div>
      </section>
    );
  }

  const severityColors = {
    low: "bg-blue-100 text-blue-800 border-blue-200",
    medium: "bg-amber-100 text-amber-800 border-amber-200",
    high: "bg-orange-100 text-orange-800 border-orange-200",
    critical: "bg-red-100 text-red-800 border-red-200",
  };

  return (
    <section className="mx-auto max-w-5xl space-y-8 px-4 py-10 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-brand-green">Report a spot</h1>
        <p className="mt-2 text-slate-600">
          Take a photo, then pin the exact location. Signed in as{" "}
          <span className="font-semibold text-slate-800">{user.name}</span>.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="grid gap-8 lg:grid-cols-2">
        <div className="space-y-6">
          <PhotoUploader onChange={handlePhoto} />

          {/* Real-time Gemini AI Visual Triage Card */}
          {isAnalyzingAi && (
            <div className="flex items-center gap-3 rounded-2xl border border-teal-200 bg-teal-50/80 p-4 text-sm text-teal-800 animate-pulse">
              <span className="text-xl">✨</span>
              <div>
                <p className="font-bold">Gemini 3.8 Flash Vision Scanning...</p>
                <p className="text-xs text-teal-600">Auto-classifying degradation and environmental hazard level.</p>
              </div>
            </div>
          )}

          {aiTriage && !isAnalyzingAi && (
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm animate-fade-in space-y-2">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-500">
                  <span>✨ Gemini AI Live Triage</span>
                </span>
                <span
                  className={`rounded-full border px-2.5 py-0.5 text-xs font-bold uppercase ${
                    severityColors[aiTriage.severity] || severityColors.medium
                  }`}
                >
                  {aiTriage.severity} (Hazard: {aiTriage.hazardScore}/10)
                </span>
              </div>
              <p className="font-semibold text-slate-800 text-sm">{aiTriage.category}</p>
              <p className="text-xs text-slate-600">{aiTriage.description}</p>
              <div className="rounded-xl bg-slate-50 p-2.5 text-xs text-slate-600">
                <span className="font-semibold text-slate-700">Recommended Action: </span>
                {aiTriage.recommendedAction}
              </div>
              <p className="text-[11px] text-teal-700 font-medium">
                ⏱️ 48-Hour Municipal Response SLA will be activated upon posting.
              </p>
            </div>
          )}
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
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              <p className="font-semibold">Unable to submit report</p>
              <p className="mt-1 text-xs">{formError ?? error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-full bg-brand-green px-6 py-4 text-lg font-semibold text-brand-white transition-opacity hover:opacity-90 disabled:opacity-50 shadow-lg"
          >
            {submitting ? "Saving to Database..." : "Submit report"}
          </button>
        </div>
      </form>
    </section>
  );
}
