"use client";

import { useState } from "react";
import type { Report } from "@/lib/types";
import { deleteReportFromSupabase } from "@/lib/supabase";

type Props = {
  report: Report;
  onDelete?: (id: number) => void | Promise<void>;
  allowDelete?: boolean;
};

export default function PhotoCard({ report, onDelete, allowDelete = true }: Props) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const date = new Date(report.created_at).toLocaleString("en-KE", {
    dateStyle: "medium",
    timeStyle: "short",
  });

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDeleting(true);
    try {
      await deleteReportFromSupabase(report.id);
      if (onDelete) {
        await onDelete(report.id);
      }
    } catch (err) {
      console.error("Failed to delete report:", err);
      setIsDeleting(false);
      setShowConfirm(false);
    }
  };

  return (
    <article className="group relative animate-fade-in overflow-hidden rounded-2xl border border-brand-green/20 bg-brand-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-md">
      {/* Photo Container */}
      <div className="relative aspect-4/3 bg-slate-100 overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={report.image_url}
          alt={report.description ?? "Degraded area"}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />

        {/* AI Category Pill if present */}
        {report.category && (
          <span className="absolute bottom-2 left-2 rounded-full bg-slate-900/80 backdrop-blur-xs px-2.5 py-0.5 text-[10px] font-bold text-white shadow-xs">
            {report.category}
          </span>
        )}

        {/* Remove Image Action */}
        {allowDelete && (
          <div className="absolute top-2 right-2 z-10">
            {!showConfirm ? (
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setShowConfirm(true);
                }}
                title="Remove image from feed"
                className="flex items-center gap-1 rounded-full bg-black/60 px-2.5 py-1 text-xs font-semibold text-white backdrop-blur-xs transition hover:bg-red-600 shadow-md"
              >
                <span>🗑️</span>
                <span className="text-[11px]">Remove</span>
              </button>
            ) : (
              <div className="flex items-center gap-1 rounded-xl bg-white/95 p-1 text-xs shadow-lg border border-red-200 animate-fade-in backdrop-blur-xs">
                <span className="text-[10px] font-bold text-red-700 px-1">Delete?</span>
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="rounded-lg bg-red-600 px-2 py-0.5 text-[11px] font-bold text-white hover:bg-red-700 disabled:opacity-50"
                >
                  {isDeleting ? "..." : "Yes"}
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setShowConfirm(false);
                  }}
                  className="rounded-lg bg-slate-200 px-1.5 py-0.5 text-[11px] text-slate-700 hover:bg-slate-300"
                >
                  ✕
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Card Info */}
      <div className="space-y-2 p-4">
        <p className="font-medium text-slate-800 line-clamp-2">
          {report.description ?? "No description provided"}
        </p>
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span>by {report.reporter_name}</span>
          <span>{date}</span>
        </div>
        <div className="flex items-center justify-between pt-1 border-t border-slate-100">
          <p className="font-mono text-[11px] text-brand-blue">
            {report.latitude.toFixed(4)}, {report.longitude.toFixed(4)}
          </p>
          <a
            href={`/flagged/${report.location_id}`}
            className="text-[11px] font-semibold text-brand-green hover:underline"
          >
            Location #{report.location_id} →
          </a>
        </div>
      </div>
    </article>
  );
}
