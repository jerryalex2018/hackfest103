"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useLocations } from "@/hooks/useLocations";
import { useRecentReports } from "@/hooks/useRecentReports";
import { useFlaggedLocations } from "@/hooks/useFlaggedLocations";
import { useStats } from "@/hooks/useStats";
import FlaggedBadge from "@/components/FlaggedBadge";
import StatsStrip from "@/components/StatsStrip";
import type { Location, Report } from "@/lib/types";
import type { DegradationAnalysisResult } from "@/lib/gemini";

export default function AdminOverviewPage() {
  const { data: stats, loading: loadingStats } = useStats("/admin/stats");
  const { data: initialLocations, loading: loadingLocations } = useLocations();
  const { data: initialReports, loading: loadingReports } = useRecentReports(50);
  const { data: flaggedQueue } = useFlaggedLocations();

  // Local state allowing admin to interact and test actions in real-time
  const [locations, setLocations] = useState<Location[] | null>(null);
  const [reports, setReports] = useState<Report[] | null>(null);
  const [filter, setFilter] = useState<"all" | "flagged" | "open" | "resolved">("all");
  const [search, setSearch] = useState("");
  const [alertNotice, setAlertNotice] = useState<string | null>(null);

  // Modal / Feature States
  const [activeTab, setActiveTab] = useState<"telemetry" | "ai_prompt" | "mpesa" | "sms">("telemetry");

  // AI Prompting State
  const [selectedImageUrl, setSelectedImageUrl] = useState<string>("/images/sample-1.jpg");
  const [customPrompt, setCustomPrompt] = useState<string>(
    "Assess health risks, toxic runoff hazard, and recommended cleanup team size."
  );
  const [aiAnalyzing, setAiAnalyzing] = useState(false);
  const [aiResult, setAiResult] = useState<DegradationAnalysisResult | null>(null);

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
          accountReference: "Silent Signals",
          transactionDesc: "Citizen Cleanup Bounty",
        }),
      });
      const data = await res.json();
      if (data.success) {
        setMpesaStatus(
          `✓ STK Push sent to ${mpesaPhone}! Checkout ID: ${
            data.result.CheckoutRequestID || "CO_REQ_99"
          }`
        );
      } else {
        setMpesaStatus(`Error: ${data.error || "STK Push failed"}`);
      }
    } catch {
      setMpesaStatus("Network error triggering M-Pesa STK Push.");
    } finally {
      setMpesaLoading(false);
    }
  };

  // Run Textbee SMS Dispatch
  const triggerSms = async () => {
    setSmsLoading(true);
    setSmsStatus(null);
    try {
      const res = await fetch("/api/sms/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipients: [smsPhone],
          message: smsMessage,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSmsStatus(`✓ Textbee SMS successfully dispatched to ${smsPhone}!`);
      } else {
        setSmsStatus(`Error: ${data.error || "SMS sending failed"}`);
      }
    } catch {
      setSmsStatus("Network error dispatching SMS via Textbee.");
    } finally {
      setSmsLoading(false);
    }
  };

  // Filtered lists
  const filteredLocations = currentLocations.filter((loc) => {
    const matchesFilter = filter === "all" ? true : loc.status === filter;
    const matchesSearch =
      search === "" ||
      loc.id.toString().includes(search) ||
      loc.latitude.toString().includes(search) ||
      loc.longitude.toString().includes(search);
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Control Room <span className="text-brand-green">Overview</span>
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Real-time silentsignals telemetry, GPS patrols, Gemini AI analysis, and M-Pesa bounties.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/tracking"
            className="inline-flex items-center gap-2 rounded-xl bg-brand-blue px-3.5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-blue-700 transition"
          >
            <span>🛰 Live GPS Patrol</span>
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-200 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
            </span>
          </Link>
          <Link
            href="/admin/locations"
            className="rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
          >
            Manage Locations →
          </Link>
        </div>
      </div>

      {/* Alert toast notification */}
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
                              Reopen
                            </button>
                          )}
                          <Link
                            href={`/flagged/${loc.id}`}
                            className="rounded-lg border border-slate-300 px-2 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-100"
                          >
                            Details
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: GEMINI AI PROMPTS */}
      {activeTab === "ai_prompt" && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs animate-fade-in space-y-4">
          <h2 className="text-lg font-bold text-slate-900">✨ Gemini Multimodal AI Prompting</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <label className="block text-xs font-bold uppercase text-slate-600">Select Image</label>
              <div className="flex gap-2">
                {["/images/sample-1.jpg", "/images/sample-2.jpg", "/images/sample-3.jpg"].map(
                  (img) => (
                    <button
                      key={img}
                      type="button"
                      onClick={() => setSelectedImageUrl(img)}
                      className={`relative h-16 w-16 overflow-hidden rounded-xl border-2 ${
                        selectedImageUrl === img ? "border-brand-blue" : "border-slate-200 opacity-60"
                      }`}
                    >
                      <Image src={img} alt="Sample" fill className="object-cover" />
                    </button>
                  )
                )}
              </div>
              <textarea
                rows={3}
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                className="w-full rounded-xl border border-slate-300 p-2.5 text-xs text-slate-800"
              />
              <button
                type="button"
                onClick={runAiAnalysis}
                disabled={aiAnalyzing}
                className="w-full rounded-xl bg-brand-blue py-2.5 text-xs font-bold text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {aiAnalyzing ? "Analyzing with Gemini..." : "Run AI Prompt Analysis"}
              </button>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs">
              {aiResult ? (
                <div className="space-y-2">
                  <p className="font-bold text-slate-900">Category: {aiResult.category}</p>
                  <p className="text-slate-700">{aiResult.description}</p>
                  <p className="text-brand-green font-semibold">Action: {aiResult.recommendedAction}</p>
                  <p className="font-mono text-slate-600 bg-white p-2 rounded border border-slate-200">
                    SMS Draft: {aiResult.authorityEscalationSummary}
                  </p>
                </div>
              ) : (
                <p className="text-slate-400 text-center py-10">Click Run AI Prompt Analysis to test</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: M-PESA BOUNTIES */}
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

      {/* TAB 4: TEXTBEE SMS */}
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
              onClick={triggerSms}
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
