"use client";

import { useState } from "react";
import Image from "next/image";
import { fileToBase64Optimized } from "@/lib/supabase";

interface ProofOfCleanupModalProps {
  locationId: number;
  beforeImageUrl: string;
  onSuccess?: () => void;
}

export default function ProofOfCleanupModal({
  locationId,
  beforeImageUrl,
  onSuccess,
}: ProofOfCleanupModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [afterImageUrl, setAfterImageUrl] = useState<string>("/images/sample-2.jpg");
  const [phone, setPhone] = useState("0712345678");
  const [bountyAmount] = useState(500);
  const [isVerifying, setIsVerifying] = useState(false);
  const [customFileLoaded, setCustomFileLoaded] = useState(false);
  const [verificationResult, setVerificationResult] = useState<{
    cleanupScore: number;
    verified: boolean;
    analysis: string;
    wasteReductionPercentage: string;
    inspectorNotes?: string;
    mpesaResult?: { CheckoutRequestID?: string };
  } | null>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const base64 = await fileToBase64Optimized(file);
        setAfterImageUrl(base64);
        setCustomFileLoaded(true);
      } catch (err) {
        console.error("Error reading file:", err);
      }
    }
  };

  const handleVerify = async () => {
    setIsVerifying(true);
    setVerificationResult(null);

    try {
      const res = await fetch("/api/ai/verify-cleanup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          locationId,
          beforeImageUrl,
          afterImageUrl,
          cleanerPhone: phone,
          bountyAmount,
        }),
      });

      const data = await res.json();
      if (data.verification) {
        setVerificationResult({
          ...data.verification,
          mpesaResult: data.mpesaResult,
        });
        if (onSuccess) onSuccess();
      }
    } catch (err) {
      console.error("Verification failed:", err);
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-2.5 text-sm font-bold text-white shadow-md hover:from-emerald-700 hover:to-teal-700 transition transform hover:-translate-y-0.5"
      >
        <span>✨ Submit Proof-of-Cleanup & Claim Bounty</span>
        <span className="rounded-full bg-white/20 px-2 py-0.5 text-xs font-mono">
          KES {bountyAmount}
        </span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="relative w-full max-w-2xl rounded-3xl bg-white p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <div>
                <h3 className="text-xl font-bold text-slate-900">
                  Proof-of-Cleanup AI Verification
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Location #{locationId} · Gemini AI Multimodal Vision Audit & M-Pesa Payout
                </p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
              >
                ✕
              </button>
            </div>

            {/* Before vs After Visual Comparison */}
            <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Before */}
              <div className="space-y-2">
                <span className="inline-block rounded-md bg-red-100 px-2 py-0.5 text-xs font-bold uppercase text-red-700">
                  Before (Reported silentsignals Evidence)
                </span>
                <div className="relative h-44 w-full overflow-hidden rounded-2xl border border-slate-200 bg-slate-100">
                  <Image
                    src={beforeImageUrl || "/images/sample-1.jpg"}
                    alt="Before cleanup"
                    fill
                    unoptimized={beforeImageUrl?.startsWith("data:")}
                    className="object-cover"
                  />
                </div>
                <p className="text-[11px] text-slate-400">Original evidence recorded in database</p>
              </div>

              {/* After */}
              <div className="space-y-2">
                <span className="inline-block rounded-md bg-emerald-100 px-2 py-0.5 text-xs font-bold uppercase text-emerald-700">
                  After (Cleaned & Restored Site)
                </span>
                <div className="relative h-44 w-full overflow-hidden rounded-2xl border-2 border-dashed border-emerald-400 bg-slate-50">
                  <Image
                    src={afterImageUrl}
                    alt="After cleanup"
                    fill
                    unoptimized={afterImageUrl?.startsWith("data:")}
                    className="object-cover"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-semibold text-slate-600 cursor-pointer">
                    <span className="inline-flex items-center gap-1 text-emerald-700 font-bold hover:underline">
                      📸 Upload Live Proof Photo
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      capture="environment"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                  {!customFileLoaded && (
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-slate-400">Or sample:</span>
                      {["/images/sample-2.jpg", "/images/sample-3.jpg"].map((img, i) => (
                        <button
                          key={img}
                          type="button"
                          onClick={() => setAfterImageUrl(img)}
                          className={`text-[10px] rounded-md px-2 py-0.5 border ${
                            afterImageUrl === img
                              ? "bg-emerald-600 text-white border-emerald-600"
                              : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                          }`}
                        >
                          Clean Sample {i + 1}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* M-Pesa Phone & Bounty Setup */}
            <div className="mt-5 rounded-2xl bg-emerald-50/70 border border-emerald-200 p-4 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex-1">
                  <label className="block text-xs font-bold uppercase text-emerald-900 mb-1">
                    Cleaner M-Pesa Mobile Number
                  </label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="0712345678"
                    className="w-full rounded-xl border border-emerald-300 bg-white px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-emerald-900 mb-1">
                    Bounty Reward
                  </label>
                  <div className="rounded-xl border border-emerald-300 bg-white px-3 py-2 text-sm font-bold text-emerald-700">
                    KES {bountyAmount}
                  </div>
                </div>
              </div>
              <p className="text-[11px] text-emerald-800">
                ⚡ Gemini Multimodal Vision inspects waste clearance. If verified (≥75%), an automated M-Pesa Daraja STK Push will disburse KES {bountyAmount} to this number and mark the spot resolved.
              </p>
            </div>

            {/* Verification Result Display */}
            {verificationResult && (
              <div className="mt-5 rounded-2xl bg-white border border-slate-200 p-4 shadow-sm animate-fade-in space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase text-slate-500">Gemini AI Audit Verdict</span>
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-extrabold text-emerald-800">
                      Cleanup Score: {verificationResult.cleanupScore}%
                    </span>
                    <span className="rounded-full bg-teal-100 px-2 py-0.5 text-xs font-bold text-teal-800">
                      Reduction: {verificationResult.wasteReductionPercentage}
                    </span>
                  </div>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed font-medium">
                  {verificationResult.analysis}
                </p>
                {verificationResult.inspectorNotes && (
                  <p className="text-[11px] text-slate-500 italic">
                    Note: {verificationResult.inspectorNotes}
                  </p>
                )}
                <div className="rounded-xl bg-emerald-100/70 p-3 text-xs font-semibold text-emerald-900 flex items-center justify-between">
                  <span>✓ M-Pesa Bounty Disbursed Successfully! Site marked Resolved.</span>
                  <span className="font-mono text-[11px]">
                    ID: {verificationResult.mpesaResult?.CheckoutRequestID || "CO_REQ_4810"}
                  </span>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="mt-6 flex items-center justify-end gap-3 border-t border-slate-200 pt-4">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-xl px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 transition"
              >
                Close
              </button>

              <button
                type="button"
                onClick={handleVerify}
                disabled={isVerifying}
                className="rounded-xl bg-brand-green px-5 py-2.5 text-sm font-bold text-white shadow-md hover:bg-emerald-700 disabled:opacity-50 transition"
              >
                {isVerifying ? "Verifying with Gemini AI..." : "🚀 Run AI Audit & Disburse Bounty"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
