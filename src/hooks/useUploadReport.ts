"use client";

import { useState } from "react";
import { apiPost } from "@/lib/api";
import { USE_MOCKS } from "@/lib/config";
import { insertReportToSupabase } from "@/lib/supabase";
import type { Location, Report } from "@/lib/types";

type UploadResponse = { report: Report; location: Location };

export function useUploadReport() {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<UploadResponse | null>(null);

  async function submit(form: FormData) {
    setSubmitting(true);
    setError(null);
    try {
      if (USE_MOCKS) {
        await new Promise((r) => setTimeout(r, 800));
        setResult({
          report: {
            id: 99,
            location_id: 99,
            image_url: "/images/sample-1.jpg",
            description: (form.get("description") as string) || null,
            latitude: Number(form.get("latitude")),
            longitude: Number(form.get("longitude")),
            reporter_name: "You",
            created_at: new Date().toISOString(),
          },
          location: {
            id: 99,
            latitude: Number(form.get("latitude")),
            longitude: Number(form.get("longitude")),
            status: "open",
            unique_reporters: 1,
            report_count: 1,
            flagged_at: null,
            created_at: new Date().toISOString(),
          },
        });
      } else {
        // First try inserting directly into Supabase
        const sbResult = await insertReportToSupabase(form).catch(() => null);
        if (sbResult) {
          setResult(sbResult);
          return;
        }

        const data = await apiPost<UploadResponse>("/reports", form);
        setResult(data);
      }
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSubmitting(false);
    }
  }

  return { submit, submitting, error, result };
}
