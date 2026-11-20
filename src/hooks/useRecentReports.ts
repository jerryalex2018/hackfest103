"use client";

import { apiGet } from "@/lib/api";
import { USE_MOCKS } from "@/lib/config";
import { mockReports } from "@/lib/mockData";
import { fetchReportsFromSupabase } from "@/lib/supabase";
import type { Report } from "@/lib/types";
import { useAsync } from "./useAsync";

export function useRecentReports(limit = 12) {
  return useAsync<Report[]>(
    async () => {
      if (USE_MOCKS) return mockReports.slice(0, limit);
      const sbData = await fetchReportsFromSupabase(limit);
      if (sbData && sbData.length > 0) return sbData;
      return apiGet<Report[]>(`/reports/recent?limit=${limit}`);
    },
    [limit]
  );
}
