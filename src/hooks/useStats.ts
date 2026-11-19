"use client";

import { apiGet } from "@/lib/api";
import { USE_MOCKS } from "@/lib/config";
import { mockStats } from "@/lib/mockData";
import type { Stats } from "@/lib/types";
import { useAsync } from "./useAsync";

export function useStats(path: "/stats" | "/admin/stats" = "/stats") {
  return useAsync<Stats>(
    () => (USE_MOCKS ? Promise.resolve(mockStats) : apiGet<Stats>(path)),
    [path],
  );
}
