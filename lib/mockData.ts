import type { Location, Report } from "./types";

export const mockReports: Report[] = [
  {
    id: 1,
    location_id: 1,
    image_url: "/images/sample-1.jpg",
    description: "Overflowing bins near the bus stop",
    latitude: -1.5177,
    longitude: 37.2634,
    reporter_name: "Jerry",
    created_at: "2026-11-19T10:22:00Z",
  },
  {
    id: 2,
    location_id: 2,
    image_url: "/images/sample-2.jpg",
    description: "Blocked drain with stagnant water",
    latitude: -1.5201,
    longitude: 37.2598,
    reporter_name: "Amina",
    created_at: "2026-11-19T09:10:00Z",
  },
  {
    id: 3,
    location_id: 3,
    image_url: "/images/sample-3.jpg",
    description: "Litter piled along the footpath",
    latitude: -1.5163,
    longitude: 37.2671,
    reporter_name: "Brian",
    created_at: "2026-11-18T16:45:00Z",
  },
];

export const mockLocations: Location[] = [
  {
    id: 1,
    latitude: -1.5177,
    longitude: 37.2634,
    status: "flagged",
    unique_reporters: 11,
    report_count: 14,
    flagged_at: "2026-11-19T11:00:00Z",
    created_at: "2026-11-18T08:00:00Z",
  },
  {
    id: 2,
    latitude: -1.5201,
    longitude: 37.2598,
    status: "open",
    unique_reporters: 3,
    report_count: 3,
    flagged_at: null,
    created_at: "2026-11-19T09:10:00Z",
  },
  {
    id: 3,
    latitude: -1.5163,
    longitude: 37.2671,
    status: "open",
    unique_reporters: 1,
    report_count: 1,
    flagged_at: null,
    created_at: "2026-11-18T16:45:00Z",
  },
];
