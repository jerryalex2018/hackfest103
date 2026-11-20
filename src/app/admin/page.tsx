"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useLocations } from "@/hooks/useLocations";
import { useRecentReports } from "@/hooks/useRecentReports";
import { useFlaggedLocations } from "@/hooks/useFlaggedLocations";
import { useStats } from "@/hooks/useStats";
import FlaggedBadge from "@/components/FlaggedBadge";
import StatsStrip from "@/components/StatsStrip";
import type { Location, Report } from "@/lib/types";
import type { DegradationAnalysisResult, PredictiveRiskZone } from "@/lib/gemini";
import { deleteReportFromSupabase } from "@/lib/supabase";

export default function AdminOverviewPage() {
  const { data: stats } = useStats("/admin/stats");
  const { data: initialLocations } = useLocations();
  const { data: initialReports } = useRecentReports(50);
  const { data: flaggedQueue } = useFlaggedLocations();

  // Local state allowing admin to interact and test actions in real-time
  const [locations, setLocations] = useState<Location[] | null>(null);
  const [reports, setReports] = useState<Report[] | null>(null);
  const [filter, setFilter] = useState<"all" | "flagged" | "open" | "resolved">("all");
  const [search, setSearch] = useState("");
  const [alertNotice, setAlertNotice] = useState<string | null>(null);

  // Modal / Feature States
  const [activeTab, setActiveTab] = useState<"telemetry" | "ai_prompt" | "predictive" | "mpesa" | "sms">("telemetry");

  // AI Prompting State
  const [selectedImageUrl] = useState<string>("/images/sample-1.jpg");
  const [customPrompt, setCustomPrompt] = useState<string>(
    "Assess health risks, toxic runoff hazard, and recommended cleanup team size."
  );
  const [aiAnalyzing, setAiAnalyzing] = useState(false);
  const [aiResult, setAiResult] = useState<DegradationAnalysisResult | null>(null);

  // Predictive Risk State
  const [predictiveZones, setPredictiveZones] = useState<PredictiveRiskZone[]>([]);
  const [loadingPredictive, setLoadingPredictive] = useState(false);

  // M-Pesa STK Push State
  const [mpesaPhone, setMpesaPhone] = useState("0712345678");
  const [mpesaAmount, setMpesaAmount] = useState("500");
  const [mpesaLoading, setMpesaLoading] = useState(false);
  const [mpesaStatus, setMpesaStatus] = useState<string | null>(null);

  // Textbee SMS State
  const [smsPhone, setSmsPhone] = useState("+254712345678");
  const [smsMessage, setSmsMessage] = useState(
    "URGENT: Location #1 flagged with 14 community reports. Immediate waste evacuation required."
  );
  const [smsLoading, setSmsLoading] = useState(false);
  const [smsStatus, setSmsStatus] = useState<string | null>(null);

  // Synchronize when initial data arrives
  const currentLocations = locations ?? initialLocations ?? [];
  const currentReports = reports ?? initialReports ?? [];

  useEffect(() => {
    if (activeTab === "predictive" && predictiveZones.length === 0) {
      setLoadingPredictive(true);
      fetch("/api/ai/predictive-risk")
        .then((res) => res.json())
        .then((data) => {
          if (data.predictions) {
            setPredictiveZones(data.predictions);
          }
        })
        .catch((err) => console.warn("Predictive risk load error:", err))
        .finally(() => setLoadingPredictive(false));
    }
  }, [activeTab, predictiveZones.length]);

  const handleStatusChange = (locId: number, newStatus: "open" | "flagged" | "resolved") => {
    const updated = currentLocations.map((loc) =>
      loc.id === locId
        ? {
            ...loc,
            status: newStatus,
            resolved_at: newStatus === "resolved" ? new Date().toISOString() : loc.resolved_at,
          }
        : loc
    );
    setLocations(updated);
    setAlertNotice(`Status for Location #${locId} updated to "${newStatus.toUpperCase()}".`);
    setTimeout(() => setAlertNotice(null), 4000);
  };

  const handleDeleteReport = async (repId: number) => {
    try {
      await deleteReportFromSupabase(repId);
      const updated = currentReports.filter((r) => r.id !== repId);
      setReports(updated);
      setAlertNotice(`Report #${repId} deleted successfully.`);
      setTimeout(() => setAlertNotice(null), 4000);
    } catch {
      setAlertNotice(`Failed to delete report #${repId}.`);
    }
  };

  // Run AI Prompting
  const runAiAnalysis = async () => {
    setAiAnalyzing(true);
    setAiResult(null);
    try {
      const res = await fetch("/api/ai/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageUrl: selectedImageUrl,
          prompt: customPrompt,
        }),
      });
      const data = await res.json();
      if (data.analysis) {
        setAiResult(data.analysis);
      }
    } catch {
      setAlertNotice("Failed to run AI prompt analysis");
    } finally {
      setAiAnalyzing(false);
    }
  };

  // Run M-Pesa STK Push
  const triggerMpesa = async () => {
    setMpesaLoading(true);
    setMpesaStatus(null);
    try {
      const res = await fetch("/api/mpesa/stkpush", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phoneNumber: mpesaPhone,
          amount: mpesaAmount,
          accountReference: "DegradationWatch",
          transactionDesc: "Citizen Cleanup Bounty",
        }),
      });
      const data = await res.json();
      if (data.success) {
        setMpesaStatus(
          `✓ STK Push sent to ${mpesaPhone}! Checkout ID: ${
            data.result?.CheckoutRequestID || "CO_REQ_99"
          }`
        );
      } else {
        setMpesaStatus(`Error: ${data.error || "STK Push failed"}`);
      }
    } catch {
      setMpesaStatus("Failed to send M-Pesa push");
    } finally {
      setMpesaLoading(false);
    }
  };

  // Run Textbee SMS
  const triggerSms = async (phoneToUse?: string, msgToUse?: string) => {
    setSmsLoading(true);
    setSmsStatus(null);
    try {
      const res = await fetch("/api/sms/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipients: [phoneToUse || smsPhone],
          message: msgToUse || smsMessage,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSmsStatus("✓ SMS successfully sent via Textbee Gateway!");
      } else {
        setSmsStatus(`Error: ${data.error || "SMS failed"}`);
      }
    } catch {
      setSmsStatus("Failed to send SMS");
    } finally {
      setSmsLoading(false);
    }
  };

  const filteredLocations = currentLocations.filter((l) => {
    const matchesFilter = filter === "all" ? true : l.status === filter;
    const matchesSearch =
      search === "" ||
      l.id.toString().includes(search) ||
      l.latitude.toString().includes(search) ||
      l.longitude.toString().includes(search);
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="space-y-8 animate-fade-in pb-16">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-ping" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Operations Center
            </span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
            Command & Enforcement Hub
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Real-time field incident intake, Gemini 3.8 Flash visual intelligence & civic dispatch.
          </p>
        </div>

        {/* Global Action Toolbar */}
        <div className="flex items-center gap-2">
          <Link
            href="/tracking"
            className="flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-bold text-white shadow-md hover:bg-slate-800 transition"
          >
            <span>🛰 Live GPS Patrol Track</span>
          </Link>
          <Link
            href="/map"
            className="flex items-center gap-2 rounded-xl bg-brand-green px-4 py-2.5 text-xs font-bold text-white shadow-md hover:bg-emerald-700 transition"
          >
            <span>🗺 View Incident Map</span>
          </Link>
        </div>
      </div>

      {/* Active Alert Banner */}
      {alertNotice && (
        <div className="rounded-xl bg-brand-green/10 border border-brand-green/30 p-4 text-brand-green flex items-center justify-between animate-fade-in shadow-xs">
          <div className="flex items-center gap-2 text-sm font-medium">
            <span>✓</span>
            <span>{alertNotice}</span>
          </div>
          <button
            onClick={() => setAlertNotice(null)}
            className="text-xs font-bold uppercase text-brand-green hover:underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Stats Overview */}
      {stats && (
        <StatsStrip
          items={[
            { label: "Total reports", value: stats.total_reports },
            { label: "Reports today", value: stats.reports_today },
            { label: "Locations", value: stats.total_locations },
            {
              label: "Flagged",
              value: stats.flagged_locations,
              hint: "Needs follow-up",
            },
            { label: "Reporters", value: stats.reporters },
            {
              label: "Emails sent",
              value: stats.emails_sent,
              hint: "To authorities",
            },
          ]}
        />
      )}

      {/* Feature Navigation Tabs */}
      <div className="flex border-b border-slate-200 gap-2 overflow-x-auto pb-1 [scrollbar-width:none]">
        <button
          onClick={() => setActiveTab("telemetry")}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-t-xl transition ${
            activeTab === "telemetry"
              ? "bg-white border-t-2 border-l border-r border-slate-200 text-brand-green border-t-brand-green shadow-xs"
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          <span>🛰 Field Telemetry & Queue</span>
        </button>

        <button
          onClick={() => setActiveTab("ai_prompt")}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-t-xl transition ${
            activeTab === "ai_prompt"
              ? "bg-white border-t-2 border-l border-r border-slate-200 text-brand-blue border-t-brand-blue shadow-xs"
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          <span>✨ Gemini AI Prompting</span>
        </button>

        <button
          onClick={() => setActiveTab("predictive")}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-t-xl transition ${
            activeTab === "predictive"
              ? "bg-white border-t-2 border-l border-r border-slate-200 text-amber-600 border-t-amber-500 shadow-xs"
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          <span>🔥 72h Predictive Risk</span>
          <span className="rounded-full bg-red-600 px-1.5 py-0.2 text-[9px] text-white">AI</span>
        </button>

        <button
          onClick={() => setActiveTab("mpesa")}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-t-xl transition ${
            activeTab === "mpesa"
              ? "bg-white border-t-2 border-l border-r border-slate-200 text-emerald-700 border-t-emerald-600 shadow-xs"
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          <span>💳 M-Pesa Bounties</span>
        </button>

        <button
          onClick={() => setActiveTab("sms")}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-t-xl transition ${
            activeTab === "sms"
              ? "bg-white border-t-2 border-l border-r border-slate-200 text-amber-700 border-t-amber-600 shadow-xs"
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          <span>📱 Textbee SMS Gateway</span>
        </button>
      </div>

      {/* TAB 1: FIELD TELEMETRY */}
      {activeTab === "telemetry" && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
            <div className="border-b border-slate-200 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex flex-wrap gap-1">
                {(["all", "flagged", "open", "resolved"] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setFilter(tab)}
                    className={`rounded-lg px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition ${
                      filter === tab
                        ? "bg-slate-900 text-white"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              <input
                type="text"
                placeholder="Filter by ID or GPS..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="rounded-xl border border-slate-300 bg-slate-50 px-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:border-brand-blue focus:bg-white focus:outline-none"
              />
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-50 text-xs font-semibold uppercase text-slate-500 border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3">Site ID</th>
                    <th className="px-4 py-3">GPS Coordinates</th>
                    <th className="px-4 py-3">Reports</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Rapid Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredLocations.map((loc) => (
                    <tr key={loc.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-4 py-3 font-bold text-slate-900">#{loc.id}</td>
                      <td className="px-4 py-3 font-mono text-xs text-slate-500">
                        {loc.latitude.toFixed(4)}, {loc.longitude.toFixed(4)}
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-semibold text-slate-800">{loc.report_count}</span>
                        <span className="text-xs text-slate-400"> ({loc.unique_reporters} users)</span>
                      </td>
                      <td className="px-4 py-3">
                        <FlaggedBadge status={loc.status} />
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {loc.status !== "resolved" ? (
                            <button
                              onClick={() => handleStatusChange(loc.id, "resolved")}
                              className="rounded-lg bg-emerald-600 px-2 py-1 text-xs font-semibold text-white hover:bg-emerald-700"
                            >
                              Resolve
                            </button>
                          ) : (
                            <button
                              onClick={() => handleStatusChange(loc.id, "open")}
                              className="rounded-lg bg-slate-200 px-2 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-300"
                            >
                              Re-open
                            </button>
                          )}
                          <Link
                            href={`/flagged/${loc.id}`}
                            className="rounded-lg border border-slate-300 px-2 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                          >
                            Details →
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredLocations.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-xs text-slate-400">
                        No locations matching filter.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* SLA Escalation Queue */}
          {flaggedQueue && flaggedQueue.length > 0 && (
            <div className="rounded-2xl border border-red-200 bg-red-50/50 p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-red-600 font-bold">⚠️</span>
                  <h3 className="text-sm font-bold text-red-900 uppercase tracking-wider">
                    SLA Escalation Queue ({flaggedQueue.length} Flagged Sites)
                  </h3>
                </div>
                <span className="text-xs text-red-700 font-medium">48h Government Response Clock Active</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {flaggedQueue.slice(0, 3).map((fl) => (
                  <div key={fl.id} className="rounded-xl border border-red-200 bg-white p-3 shadow-xs">
                    <p className="font-bold text-slate-900 text-xs">Site #{fl.id}</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {fl.unique_reporters} citizen reports · Flagged for urgent dispatch
                    </p>
                    <Link
                      href={`/flagged/${fl.id}`}
                      className="mt-2 inline-block text-xs font-bold text-red-600 hover:underline"
                    >
                      Audit & Disburse Bounty →
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Live Ingest Feed */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
            <h2 className="text-lg font-bold text-slate-900">📸 Recent Citizen Photographic Evidence</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
              {currentReports.slice(0, 6).map((rep) => (
                <div key={rep.id} className="space-y-1 group">
                  <div className="relative h-28 w-full overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
                    <Image
                      src={rep.image_url || "/images/sample-1.jpg"}
                      alt="Report evidence"
                      fill
                      unoptimized={rep.image_url?.startsWith("data:")}
                      className="object-cover group-hover:scale-105 transition"
                    />
                    <button
                      type="button"
                      onClick={() => handleDeleteReport(rep.id)}
                      title="Delete this image report"
                      className="absolute top-1 right-1 z-10 rounded-full bg-black/60 p-1 text-[10px] text-white hover:bg-red-600 transition shadow-xs"
                    >
                      🗑️
                    </button>
                  </div>
                  <p className="text-[11px] font-bold text-slate-800 truncate">
                    {rep.category || "General Debris"}
                  </p>
                  <p className="text-[10px] text-slate-400">By {rep.reporter_name}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: AI PROMPTING */}
      {activeTab === "ai_prompt" && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs animate-fade-in space-y-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900">✨ Gemini 3.8 Flash Vision Inspector</h2>
            <p className="text-xs text-slate-500 mt-1">
              Interact directly with Gemini Vision on degradation imagery to generate hazard scores, action plans, and SMS drafts.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <label className="block text-xs font-bold uppercase text-slate-500">
                Custom Environmental Inspection Prompt
              </label>
              <textarea
                rows={4}
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                className="w-full rounded-xl border border-slate-300 p-3 text-xs text-slate-800 focus:border-brand-blue focus:outline-none"
              />
              <button
                type="button"
                onClick={runAiAnalysis}
                disabled={aiAnalyzing}
                className="w-full rounded-xl bg-brand-blue py-2.5 text-xs font-bold text-white hover:bg-blue-700 disabled:opacity-50 transition shadow-md"
              >
                {aiAnalyzing ? "Analyzing with Gemini Vision..." : "🚀 Run Gemini AI Analysis"}
              </button>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs">
              {aiResult ? (
                <div className="space-y-2 animate-fade-in">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 text-sm">{aiResult.category}</span>
                    <span className="rounded-full bg-orange-100 text-orange-800 px-2 py-0.5 font-bold uppercase text-[10px]">
                      {aiResult.severity} · Hazard: {aiResult.hazardScore}/10
                    </span>
                  </div>
                  <p className="text-slate-700">{aiResult.description}</p>
                  <p className="text-brand-green font-semibold">
                    <span className="text-slate-500">Recommended Action: </span>
                    {aiResult.recommendedAction}
                  </p>
                  <div className="rounded-lg bg-white p-2.5 border border-slate-200 mt-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block mb-0.5">
                      Generated SMS Authority Escalation:
                    </span>
                    <p className="font-mono text-slate-800 text-[11px]">{aiResult.authorityEscalationSummary}</p>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                  <span className="text-3xl mb-2">🤖</span>
                  <p>Click Run Gemini AI Analysis to trigger live multimodal inspection.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: 72H PREDICTIVE RISK */}
      {activeTab === "predictive" && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs animate-fade-in space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-amber-500 text-lg">🔥</span>
                <h2 className="text-lg font-bold text-slate-900">
                  72-Hour Predictive Dumping Risk & Preventive Routing
                </h2>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Gemini 3.8 Flash temporal clustering forecasts high-risk dumping windows to intercept waste BEFORE it hits storm drains.
              </p>
            </div>
            <Link
              href="/map"
              className="rounded-xl bg-amber-500 px-4 py-2 text-xs font-bold text-slate-900 hover:bg-amber-400 shadow-xs"
            >
              View on Heatmap →
            </Link>
          </div>

          {loadingPredictive ? (
            <p className="text-xs text-slate-500 animate-pulse py-8 text-center">
              Gemini AI calculating 72-hour accumulation probabilities across municipal coordinates...
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {predictiveZones.map((zone) => (
                <div
                  key={zone.id}
                  className="rounded-2xl border border-slate-200 p-4 space-y-3 bg-slate-50/50 hover:bg-white hover:shadow-md transition"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 text-sm">{zone.locationName}</span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-extrabold uppercase ${
                        zone.riskLevel === "critical"
                          ? "bg-red-100 text-red-700"
                          : zone.riskLevel === "high"
                          ? "bg-orange-100 text-orange-700"
                          : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {zone.riskLevel} ({zone.riskScore}%)
                    </span>
                  </div>

                  <div className="space-y-1 text-xs text-slate-600">
                    <p>
                      <span className="font-semibold text-slate-700">Peak Dumping Window:</span>{" "}
                      {zone.peakWindow}
                    </p>
                    <p>
                      <span className="font-semibold text-slate-700">Expected Waste:</span>{" "}
                      {zone.predictedWasteType}
                    </p>
                  </div>

                  <div className="rounded-xl bg-white p-2.5 border border-slate-200 text-xs text-slate-700">
                    <span className="font-bold text-brand-green">Intervention: </span>
                    {zone.recommendedAction}
                  </div>

                  <p className="text-[11px] text-slate-400 italic">{zone.forecastSummary}</p>

                  <button
                    onClick={() =>
                      triggerSms(
                        "+254712345678",
                        `PREDICTIVE PATROL ALERT: ${zone.locationName} flagged at ${zone.riskScore}% risk for ${zone.predictedWasteType}. Recommended: ${zone.recommendedAction}`
                      )
                    }
                    className="w-full rounded-xl bg-slate-900 py-2 text-xs font-bold text-white hover:bg-slate-800 transition"
                  >
                    🚨 Alert Patrol Unit
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: M-PESA BOUNTIES */}
      {activeTab === "mpesa" && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs animate-fade-in space-y-4">
          <h2 className="text-lg font-bold text-slate-900">💳 Safaricom M-Pesa Daraja STK Push</h2>
          <div className="max-w-md space-y-3">
            <input
              type="text"
              value={mpesaPhone}
              onChange={(e) => setMpesaPhone(e.target.value)}
              placeholder="0712345678"
              className="w-full rounded-xl border border-slate-300 p-2.5 text-xs"
            />
            <input
              type="number"
              value={mpesaAmount}
              onChange={(e) => setMpesaAmount(e.target.value)}
              placeholder="500"
              className="w-full rounded-xl border border-slate-300 p-2.5 text-xs"
            />
            <button
              type="button"
              onClick={triggerMpesa}
              disabled={mpesaLoading}
              className="w-full rounded-xl bg-brand-green py-2.5 text-xs font-bold text-white hover:bg-emerald-700 disabled:opacity-50"
            >
              {mpesaLoading ? "Initiating STK Push..." : "Trigger M-Pesa STK Push"}
            </button>
            {mpesaStatus && <p className="text-xs text-emerald-800 bg-emerald-50 p-2.5 rounded-lg">{mpesaStatus}</p>}
          </div>
        </div>
      )}

      {/* TAB 5: TEXTBEE SMS */}
      {activeTab === "sms" && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs animate-fade-in space-y-4">
          <h2 className="text-lg font-bold text-slate-900">📱 Textbee SMS Gateway Dispatch</h2>
          <div className="max-w-md space-y-3">
            <input
              type="text"
              value={smsPhone}
              onChange={(e) => setSmsPhone(e.target.value)}
              placeholder="+254712345678"
              className="w-full rounded-xl border border-slate-300 p-2.5 text-xs"
            />
            <textarea
              rows={3}
              value={smsMessage}
              onChange={(e) => setSmsMessage(e.target.value)}
              className="w-full rounded-xl border border-slate-300 p-2.5 text-xs"
            />
            <button
              type="button"
              onClick={() => triggerSms()}
              disabled={smsLoading}
              className="w-full rounded-xl bg-slate-900 py-2.5 text-xs font-bold text-white hover:bg-slate-800 disabled:opacity-50"
            >
              {smsLoading ? "Dispatching SMS..." : "Send Textbee SMS Alert"}
            </button>
            {smsStatus && <p className="text-xs text-blue-800 bg-blue-50 p-2.5 rounded-lg">{smsStatus}</p>}
          </div>
        </div>
      )}
    </div>
  );
}
