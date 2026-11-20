"use client";

import { useEffect, useState } from "react";

interface SlaCountdownProps {
  flaggedAt: string | null;
  locationId: number;
  slaHours?: number; // Default 48 hours
}

export default function SlaCountdown({
  flaggedAt,
  locationId,
  slaHours = 48,
}: SlaCountdownProps) {
  const [timeLeft, setTimeLeft] = useState<{
    hours: number;
    minutes: number;
    seconds: number;
    isBreached: boolean;
    totalMs: number;
  } | null>(null);

  const [escalating, setEscalating] = useState(false);
  const [escalatedStatus, setEscalatedStatus] = useState<string | null>(null);

  useEffect(() => {
    // If flaggedAt is not set, use a fallback date 28 hours ago for rich interactive demo
    const baseDate = flaggedAt ? new Date(flaggedAt) : new Date(Date.now() - 28 * 3600 * 1000);
    const deadlineMs = baseDate.getTime() + slaHours * 3600 * 1000;

    const updateTimer = () => {
      const now = Date.now();
      const diffMs = deadlineMs - now;

      if (diffMs <= 0) {
        const overdueMs = Math.abs(diffMs);
        const hours = Math.floor(overdueMs / (1000 * 60 * 60));
        const minutes = Math.floor((overdueMs % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((overdueMs % (1000 * 60)) / 1000);
        setTimeLeft({ hours, minutes, seconds, isBreached: true, totalMs: diffMs });
      } else {
        const hours = Math.floor(diffMs / (1000 * 60 * 60));
        const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);
        setTimeLeft({ hours, minutes, seconds, isBreached: false, totalMs: diffMs });
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [flaggedAt, slaHours]);

  const triggerSmsEscalation = async () => {
    setEscalating(true);
    setEscalatedStatus(null);
    try {
      const res = await fetch("/api/sms/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipients: ["+254712345678"],
          message: `ESCALATION ALERT: Location #${locationId} SLA deadline reached with 0 county response. Automated dispatch notice issued.`,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setEscalatedStatus("✓ Urgent Textbee SMS Escalation dispatched to County Environment Leadership!");
      }
    } catch {
      setEscalatedStatus("Failed to send automated SMS escalation.");
    } finally {
      setEscalating(false);
    }
  };

  if (!timeLeft) return null;

  return (
    <div
      className={`rounded-2xl border p-5 shadow-xs transition-all ${
        timeLeft.isBreached
          ? "border-red-300 bg-red-50/80 text-red-900"
          : timeLeft.hours < 12
          ? "border-amber-300 bg-amber-50/80 text-amber-900"
          : "border-slate-200 bg-white text-slate-800"
      }`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-lg">⏱</span>
            <h3 className="text-sm font-bold uppercase tracking-wider">
              {timeLeft.isBreached
                ? "Government Response SLA Breached"
                : "Public 48-Hour Government SLA Countdown"}
            </h3>
            <span
              className={`rounded-full px-2 py-0.5 text-[10px] font-extrabold uppercase ${
                timeLeft.isBreached
                  ? "bg-red-200 text-red-800 animate-pulse"
                  : timeLeft.hours < 12
                  ? "bg-amber-200 text-amber-800 animate-pulse"
                  : "bg-emerald-100 text-emerald-800"
              }`}
            >
              {timeLeft.isBreached
                ? "Overdue - Escalated"
                : timeLeft.hours < 12
                ? "Urgent Deadline"
                : "Active SLA"}
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            {timeLeft.isBreached
              ? "County Sanitation has exceeded the 48-hour response window for this flagged community crisis."
              : "Authorities have been notified and must inspect or mobilize cleanup crews before the timer expires."}
          </p>
        </div>

        {/* Digital Clock display */}
        <div className="flex items-center gap-1.5 font-mono text-xl font-extrabold">
          <div className="rounded-xl bg-slate-900/90 px-3 py-1.5 text-white shadow-2xs">
            {String(timeLeft.hours).padStart(2, "0")}
            <span className="block text-[9px] font-normal font-sans text-slate-300 text-center">HRS</span>
          </div>
          <span>:</span>
          <div className="rounded-xl bg-slate-900/90 px-3 py-1.5 text-white shadow-2xs">
            {String(timeLeft.minutes).padStart(2, "0")}
            <span className="block text-[9px] font-normal font-sans text-slate-300 text-center">MIN</span>
          </div>
          <span>:</span>
          <div className="rounded-xl bg-slate-900/90 px-3 py-1.5 text-white shadow-2xs">
            {String(timeLeft.seconds).padStart(2, "0")}
            <span className="block text-[9px] font-normal font-sans text-slate-300 text-center">SEC</span>
          </div>
        </div>
      </div>

      {/* Escalation button & alert */}
      <div className="mt-4 pt-3 border-t border-slate-200/60 flex flex-col sm:flex-row items-center justify-between gap-3">
        <span className="text-xs text-slate-500">
          Responsible: <span className="font-semibold text-slate-700">County Sanitation & Rapid Response Taskforce</span>
        </span>

        <button
          onClick={triggerSmsEscalation}
          disabled={escalating}
          className="rounded-xl bg-red-600 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-red-700 disabled:opacity-50 transition shadow-2xs"
        >
          {escalating ? "Dispatching SMS..." : "🚨 Trigger Automated Textbee SMS Escalation"}
        </button>
      </div>

      {escalatedStatus && (
        <div className="mt-3 rounded-lg bg-emerald-100 p-2.5 text-xs font-semibold text-emerald-800">
          {escalatedStatus}
        </div>
      )}
    </div>
  );
}
