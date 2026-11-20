"use client";

import { USE_MOCKS } from "@/lib/config";
import { mockLocations } from "@/lib/mockData";
import { fetchFlaggedLocationsFromSupabase } from "@/lib/supabase";
import type { Location } from "@/lib/types";
import { useAsync } from "./useAsync";

export function useFlaggedLocations() {
  return useAsync<Location[]>(
    async () => {
      if (USE_MOCKS) return mockLocations.filter((l) => l.status === "flagged");
      const sbData = await fetchFlaggedLocationsFromSupabase();
      if (sbData !== null) return sbData;
      return mockLocations.filter((l) => l.status === "flagged");
    },
    [],
  );
}
