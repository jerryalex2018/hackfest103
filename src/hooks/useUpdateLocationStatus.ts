"use client";

import { useState } from "react";
import { USE_MOCKS } from "@/lib/config";
import { updateLocationStatusInSupabase } from "@/lib/supabase";
import type { LocationStatus } from "@/lib/types";

export function useUpdateLocationStatus() {
  const [saving, setSaving] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function setStatus(
    id: number,
    status: LocationStatus,
  ): Promise<boolean> {
    setSaving(id);
    setError(null);
    try {
      if (USE_MOCKS) {
        await new Promise((r) => setTimeout(r, 400));
        return true;
      }

      const sbSuccess = await updateLocationStatusInSupabase(id, status);
      if (sbSuccess) return true;
      throw new Error("Failed to update status in Supabase database");
    } catch (e) {
      setError((e as Error).message);
      return false;
    } finally {
      setSaving(null);
    }
  }

  return { setStatus, saving, error };
}
