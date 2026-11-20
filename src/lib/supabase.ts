import { createClient } from "@supabase/supabase-js";
import type { Location, Report, Authority, LocationDetail } from "./types";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl as string, supabaseAnonKey as string)
  : null;

export async function fetchLocationsFromSupabase(status?: string): Promise<Location[] | null> {
  if (!supabase) return null;
  let query = supabase
    .from("locations")
    .select("*")
    .order("created_at", { ascending: false });

  if (status) {
    query = query.eq("status", status);
  }

  const { data, error } = await query;
  if (error) {
    console.error("Error fetching locations from Supabase:", error);
    return null;
  }
  return data as Location[];
}

export async function fetchFlaggedLocationsFromSupabase(): Promise<Location[] | null> {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("locations")
    .select("*")
    .eq("status", "flagged")
    .order("flagged_at", { ascending: false });

  if (error) {
    console.error("Error fetching flagged locations from Supabase:", error);
    return null;
  }
  return data as Location[];
}

export async function fetchLocationDetailFromSupabase(id: string | number): Promise<LocationDetail | null> {
  if (!supabase) return null;
  const numId = Number(id);

  const { data: location, error: locError } = await supabase
    .from("locations")
    .select("*")
    .eq("id", numId)
    .single();

  if (locError || !location) {
    console.error("Location detail error:", locError);
    return null;
  }

  const { data: reports } = await supabase
    .from("reports")
    .select("*")
    .eq("location_id", numId)
    .order("created_at", { ascending: false });

  return {
    location: location as Location,
    reports: (reports || []) as Report[],
  };
}

export async function fetchReportsFromSupabase(limit = 50): Promise<Report[] | null> {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("reports")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Error fetching reports from Supabase:", error);
    return null;
  }
  return data as Report[];
}

export async function fetchAuthoritiesFromSupabase(): Promise<Authority[] | null> {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("authorities")
    .select("*")
    .order("name");

  if (error) {
    console.error("Error fetching authorities from Supabase:", error);
    return null;
  }
  return data as Authority[];
}

export async function updateLocationStatusInSupabase(
  id: number,
  status: "open" | "flagged" | "resolved"
): Promise<boolean> {
  if (!supabase) return false;
  const { error } = await supabase
    .from("locations")
    .update({
      status,
      resolved_at: status === "resolved" ? new Date().toISOString() : null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  return !error;
}

export async function insertReportToSupabase(form: FormData): Promise<{ report: Report; location: Location } | null> {
  if (!supabase) return null;

  const lat = Number(form.get("latitude"));
  const lng = Number(form.get("longitude"));
  const description = (form.get("description") as string) || null;
  const reporterName = "Citizen Contributor";

  // Check if a location already exists nearby (~0.0003 deg is roughly 30m)
  const { data: existingLocations } = await supabase
    .from("locations")
    .select("*");

  let matchedLoc = (existingLocations || []).find((l) => {
    const dLat = Math.abs(l.latitude - lat);
    const dLng = Math.abs(l.longitude - lng);
    return dLat < 0.0003 && dLng < 0.0003;
  });

  if (!matchedLoc) {
    const { data: newLoc, error: locErr } = await supabase
      .from("locations")
      .insert({
        latitude: lat,
        longitude: lng,
        title: `Degradation Area (${lat.toFixed(4)}, ${lng.toFixed(4)})`,
        status: "open",
        unique_reporters: 1,
        report_count: 1,
      })
      .select()
      .single();

    if (locErr || !newLoc) throw new Error(locErr?.message || "Failed to create location");
    matchedLoc = newLoc;
  }

  // Insert the report
  const imageUrl = "/images/sample-1.jpg"; // Default sample or Supabase storage path
  const { data: newReport, error: repErr } = await supabase
    .from("reports")
    .insert({
      location_id: matchedLoc.id,
      reporter_name: reporterName,
      image_url: imageUrl,
      description,
      latitude: lat,
      longitude: lng,
    })
    .select()
    .single();

  if (repErr || !newReport) throw new Error(repErr?.message || "Failed to submit report");

  return {
    report: newReport as Report,
    location: matchedLoc as Location,
  };
}
