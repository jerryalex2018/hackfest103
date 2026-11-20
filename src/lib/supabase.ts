import { createClient } from "@supabase/supabase-js";
import { getUser } from "./auth";
import type { Location, Report, Authority, LocationDetail, Stats } from "./types";

const DEFAULT_SUPABASE_URL = "https://wdprlvmhwfngnucaryev.supabase.co";
const DEFAULT_SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndkcHJsdm1od2ZuZ251Y2FyeWV2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTUxMzA1MTAsImV4cCI6MjExMDcwNjUxMH0._6PsqFJZ1fWiLQbKW_Hp0piQUJbhXoHhDv0jvf-Gquo";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || DEFAULT_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
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

export async function fetchStatsFromSupabase(): Promise<Stats | null> {
  if (!supabase) return null;
  try {
    const [locsRes, repsRes] = await Promise.all([
      supabase.from("locations").select("id, status"),
      supabase.from("reports").select("id, created_at, reporter_name"),
    ]);

    const locations = locsRes.data || [];
    const reports = repsRes.data || [];

    const totalLocations = locations.length;
    const flaggedLocations = locations.filter((l) => l.status === "flagged").length;
    const totalReports = reports.length;

    const uniqueReporters = new Set(reports.map((r) => r.reporter_name)).size;
    const today = new Date().toISOString().split("T")[0];
    const reportsToday = reports.filter((r) => r.created_at?.startsWith(today)).length;

    return {
      total_reports: totalReports,
      total_locations: totalLocations,
      flagged_locations: flaggedLocations,
      reporters: Math.max(uniqueReporters, 1),
      reports_today: reportsToday,
      emails_sent: flaggedLocations * 2,
    };
  } catch (err) {
    console.error("Error fetching stats from Supabase:", err);
    return null;
  }
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

// Compress & optimize image file to base64 to keep payload lightweight (< 200KB)
export async function fileToBase64Optimized(file: File): Promise<string> {
  return new Promise((resolve) => {
    if (typeof window === "undefined" || !file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = () => resolve((reader.result as string) || "/images/sample-1.jpg");
      reader.onerror = () => resolve("/images/sample-1.jpg");
      reader.readAsDataURL(file);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const MAX_DIM = 640;
        let width = img.width;
        let height = img.height;
        if (width > height && width > MAX_DIM) {
          height = Math.round((height * MAX_DIM) / width);
          width = MAX_DIM;
        } else if (height > MAX_DIM) {
          width = Math.round((width * MAX_DIM) / height);
          height = MAX_DIM;
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL("image/jpeg", 0.5));
        } else {
          resolve((e.target?.result as string) || "/images/sample-1.jpg");
        }
      };
      img.onerror = () => resolve((e.target?.result as string) || "/images/sample-1.jpg");
      img.src = e.target?.result as string;
    };
    reader.onerror = () => resolve("/images/sample-1.jpg");
    reader.readAsDataURL(file);
  });
}

export async function insertReportToSupabase(
  form: FormData
): Promise<{ report: Report; location: Location } | null> {
  if (!supabase) return null;

  const lat = Number(form.get("latitude"));
  const lng = Number(form.get("longitude"));
  const description = (form.get("description") as string) || null;
  const category = (form.get("category") as string) || "Illegal Dumping";
  const severity = (form.get("severity") as string) || "medium";
  const aiAnalysis = (form.get("ai_analysis") as string) || null;

  const currentUser = getUser();
  const reporterName = currentUser?.name || "Citizen Reporter";

  // Process uploaded photo with canvas compression
  let imageUrl = "/images/sample-1.jpg";
  const photoFile = form.get("photo") as File | null;
  if (photoFile && photoFile.size > 0 && typeof window !== "undefined") {
    try {
      imageUrl = await fileToBase64Optimized(photoFile);
    } catch {
      imageUrl = "/images/sample-1.jpg";
    }
  }

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

    if (locErr || !newLoc) {
      console.error("Supabase location error:", locErr);
      throw new Error(locErr?.message || "Failed to create location in database");
    }
    matchedLoc = newLoc;
  }

  // Insert the report with AI fields
  const { data: newReport, error: repErr } = await supabase
    .from("reports")
    .insert({
      location_id: matchedLoc.id,
      reporter_name: reporterName,
      image_url: imageUrl,
      description,
      latitude: lat,
      longitude: lng,
      category,
      severity,
      ai_analysis: aiAnalysis,
    })
    .select()
    .single();

  if (repErr || !newReport) {
    console.error("Supabase report error:", repErr);
    throw new Error(repErr?.message || "Failed to submit report to database");
  }

  // Fetch updated location to get the latest unique_reporters and status from the DB trigger
  const { data: updatedLoc } = await supabase
    .from("locations")
    .select("*")
    .eq("id", matchedLoc.id)
    .single();

  return {
    report: newReport as Report,
    location: (updatedLoc || matchedLoc) as Location,
  };
}

export async function deleteReportFromSupabase(reportId: number): Promise<boolean> {
  if (!supabase) return false;
  try {
    // 1. Get the report to find its location_id
    const { data: report } = await supabase
      .from("reports")
      .select("location_id")
      .eq("id", reportId)
      .single();

    // 2. Delete the report
    const { error } = await supabase
      .from("reports")
      .delete()
      .eq("id", reportId);

    if (error) {
      console.error("Error deleting report from Supabase:", error);
      return false;
    }

    // 3. Update the associated location stats if it exists
    if (report?.location_id) {
      const { data: remainingReports } = await supabase
        .from("reports")
        .select("id, reporter_name")
        .eq("location_id", report.location_id);

      const count = remainingReports?.length || 0;
      const uniqueReporters = new Set(remainingReports?.map((r) => r.reporter_name) || []).size;

      await supabase
        .from("locations")
        .update({
          report_count: count,
          unique_reporters: uniqueReporters,
          status: count >= 10 ? "flagged" : "open",
          updated_at: new Date().toISOString(),
        })
        .eq("id", report.location_id);
    }

    return true;
  } catch (err) {
    console.error("deleteReportFromSupabase error:", err);
    return false;
  }
}
