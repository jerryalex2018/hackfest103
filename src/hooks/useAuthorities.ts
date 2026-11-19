"use client";

import { apiGet } from "@/lib/api";
import { USE_MOCKS } from "@/lib/config";
import { mockAuthorities } from "@/lib/mockData";
import type { Authority } from "@/lib/types";
import { useAsync } from "./useAsync";

export function useAuthorities() {
  return useAsync<Authority[]>(
    () =>
      USE_MOCKS
        ? Promise.resolve(mockAuthorities)
        : apiGet<Authority[]>("/admin/authorities"),
    [],
  );
}
