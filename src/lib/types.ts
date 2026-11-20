export type Role = "user" | "admin" | "citizen" | "authority" | "patrol";

export type Report = {
  id: number;
  location_id: number;
  image_url: string;
  description: string | null;
  latitude: number;
  longitude: number;
  reporter_name: string;
  created_at: string;
  category?: string;
  severity?: "low" | "medium" | "high" | "critical";
  ai_analysis?: string;
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
  resolved_at?: string | null;
  created_at: string;
  title?: string;
  risk_level?: "low" | "medium" | "high" | "critical";
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
  phone?: string;
};

export type GPSPosition = {
  latitude: number;
  longitude: number;
  accuracy: number;
  speed: number | null;
  heading: number | null;
  altitude: number | null;
  timestamp: number;
};

export type PatrolBreadcrumb = {
  latitude: number;
  longitude: number;
  timestamp: number;
};

export type Authority = {
  id: number;
  name: string;
  email: string;
  phone?: string;
  region: string | null;
  notified_count?: number;
  active_alerts?: number;
};

export type Stats = {
  total_reports: number;
  total_locations: number;
  flagged_locations: number;
  reporters: number;
  reports_today: number;
  emails_sent: number;
};

export type MpesaBounty = {
  id: string;
  location_id: number;
  amount: number;
  phone: string;
  status: "pending" | "completed" | "failed";
  receipt?: string;
  created_at: string;
};
