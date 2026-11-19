export type Role = "user" | "admin";

export type Report = {
  id: number;
  location_id: number;
  image_url: string;
  description: string | null;
  latitude: number;
  longitude: number;
  reporter_name: string;
  created_at: string;
};

export type LocationStatus = "open" | "flagged" | "resolved";

export type Location = {
  id: number;
  latitude: number;
  longitude: number;
  status: LocationStatus;
  unique_reporters: number;
  report_count: number;
  flagged_at: string | null;
  created_at: string;
};

export type LocationDetail = {
  location: Location;
  reports: Report[];
};

export type User = {
  id: number;
  name: string;
  email: string;
  role?: Role;
};

export type Authority = {
  id: number;
  name: string;
  email: string;
  region: string | null;
  notified_count: number;
};

export type Stats = {
  total_reports: number;
  total_locations: number;
  flagged_locations: number;
  reporters: number;
  reports_today: number;
  emails_sent: number;
};
