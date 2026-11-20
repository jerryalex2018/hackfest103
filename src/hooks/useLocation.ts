"use client";

import { USE_MOCKS } from "@/lib/config";
import { mockLocations, mockReports } from "@/lib/mockData";
import { fetchLocationDetailFromSupabase } from "@/lib/supabase";
import type { LocationDetail } from "@/lib/types";
import { useAsync } from "./useAsync";

export function useLocation(id: string) {
  return useAsync<LocationDetail>(async () => {
    if (USE_MOCKS) {
      const location = mockLocations.find((l) => l.id === Number(id));
      if (!location) throw new Error("Location not found");
      const reports = mockReports.filter((r) => r.location_id === location.id);
      return { location, reports };
    }

    const sbDetail = await fetchLocationDetailFromSupabase(id);
    if (sbDetail) return sbDetail;

    const fallbackLoc = mockLocations.find((l) => l.id === Number(id));
    if (fallbackLoc) {
      return {
        location: fallbackLoc,
        reports: mockReports.filter((r) => r.location_id === fallbackLoc.id),
      };
    }
    throw new Error("Location not found");
  }, [id]);
}
