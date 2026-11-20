"use client";

import { apiGet } from "@/lib/api";
import { USE_MOCKS } from "@/lib/config";
import { mockAuthorities } from "@/lib/mockData";
import { fetchAuthoritiesFromSupabase } from "@/lib/supabase";
import type { Authority } from "@/lib/types";
import { useAsync } from "./useAsync";

export function useAuthorities() {
  return useAsync<Authority[]>(
    async () => {
      if (USE_MOCKS) return mockAuthorities;
      const sbData = await fetchAuthoritiesFromSupabase();
      if (sbData && sbData.length > 0) return sbData;
      return apiGet<Authority[]>("/admin/authorities");
    },
    [],
  );
}
