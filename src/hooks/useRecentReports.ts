"use client";

import { apiGet } from "@/lib/api";
import { USE_MOCKS } from "@/lib/config";
import { mockReports } from "@/lib/mockData";
import type { Report } from "@/lib/types";
import { useAsync } from "./useAsync";

export function useRecentReports(limit = 12) {
  return useAsync<Report[]>(
    () =>
      USE_MOCKS
        ? Promise.resolve(mockReports.slice(0, limit))
        : apiGet<Report[]>(`/reports/recent?limit=${limit}`),
    [limit],
  );
}
