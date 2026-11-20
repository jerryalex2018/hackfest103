import { NextResponse } from "next/server";
import { predictDumpingRisksWithGemini } from "@/lib/gemini";
import { fetchLocationsFromSupabase } from "@/lib/supabase";

export const runtime = "edge";

export async function GET() {
  try {
    const locations = (await fetchLocationsFromSupabase()) || [];
    const predictions = await predictDumpingRisksWithGemini(
      locations.map((l) => ({
        id: l.id,
        latitude: l.latitude,
        longitude: l.longitude,
        title: l.title,
        report_count: l.report_count,
      }))
    );

    return NextResponse.json({
      success: true,
      predictions,
      generatedAt: new Date().toISOString(),
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Predictive risk generation error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
