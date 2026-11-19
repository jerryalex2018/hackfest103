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

export type Location = {
  id: number;
  latitude: number;
  longitude: number;
  status: "open" | "flagged" | "resolved";
  unique_reporters: number;
  report_count: number;
  flagged_at: string | null;
  created_at: string;
};

export type User = {
  id: number;
  name: string;
  email: string;
};
