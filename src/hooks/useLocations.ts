"use client";

import { USE_MOCKS } from "@/lib/config";
import { mockLocations } from "@/lib/mockData";
import { fetchLocationsFromSupabase } from "@/lib/supabase";
import type { Location } from "@/lib/types";
import { useAsync } from "./useAsync";

export function useLocations() {
  return useAsync<Location[]>(
    async () => {
      if (USE_MOCKS) return mockLocations;
      const sbData = await fetchLocationsFromSupabase();
      if (sbData !== null) return sbData;
      return mockLocations;
    },
    []
  );
}
