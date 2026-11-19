"use client";

import { apiGet } from "@/lib/api";
import { USE_MOCKS } from "@/lib/config";
import { mockLocations, mockReports } from "@/lib/mockData";
import type { LocationDetail } from "@/lib/types";
import { useAsync } from "./useAsync";

export function useLocation(id: string) {
  return useAsync<LocationDetail>(() => {
    if (!USE_MOCKS) return apiGet<LocationDetail>(`/locations/${id}`);

    const location = mockLocations.find((l) => l.id === Number(id));
    if (!location) return Promise.reject(new Error("Location not found"));
    const reports = mockReports.filter((r) => r.location_id === location.id);
    return Promise.resolve({ location, reports });
  }, [id]);
}
