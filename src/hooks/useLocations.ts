"use client";

import { apiGet } from "@/lib/api";
import { USE_MOCKS } from "@/lib/config";
import { mockLocations } from "@/lib/mockData";
import type { Location } from "@/lib/types";
import { useAsync } from "./useAsync";

export function useLocations() {
  return useAsync<Location[]>(
    () =>
      USE_MOCKS
        ? Promise.resolve(mockLocations)
        : apiGet<Location[]>("/locations"),
    []
  );
}