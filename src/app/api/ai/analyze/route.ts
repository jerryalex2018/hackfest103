import { NextResponse } from "next/server";
import { analyzeDegradationWithPrompt } from "@/lib/gemini";

export const runtime = "edge";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { imageUrl, prompt } = body;

    if (!imageUrl) {
      return NextResponse.json(
        { error: "imageUrl is required for AI degradation prompt analysis" },
        { status: 400 }
      );
    }

    const analysis = await analyzeDegradationWithPrompt(imageUrl, prompt);
    return NextResponse.json({ success: true, analysis });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "AI analysis error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
