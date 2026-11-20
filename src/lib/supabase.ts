import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl as string, supabaseAnonKey as string)
  : null;

export async function fetchLocationsFromSupabase() {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("locations")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching locations from Supabase:", error);
    return null;
  }
  return data;
}

export async function fetchReportsFromSupabase() {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("reports")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching reports from Supabase:", error);
    return null;
  }
  return data;
}
