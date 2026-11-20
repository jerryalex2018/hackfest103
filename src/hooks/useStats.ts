"use client";

import { USE_MOCKS } from "@/lib/config";
import { mockStats } from "@/lib/mockData";
import { fetchStatsFromSupabase } from "@/lib/supabase";
import type { Stats } from "@/lib/types";
import { useAsync } from "./useAsync";

export function useStats(_path: "/stats" | "/admin/stats" = "/stats") {
  return useAsync<Stats>(
    async () => {
      if (USE_MOCKS) return mockStats;
      const sbStats = await fetchStatsFromSupabase();
      if (sbStats) return sbStats;
      return mockStats;
    },
    [],
  );
}
