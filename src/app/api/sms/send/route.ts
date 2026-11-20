import { NextResponse } from "next/server";
import { sendTextbeeSms } from "@/lib/textbee";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { recipients, message } = body;

    if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
      return NextResponse.json(
        { error: "recipients array is required" },
        { status: 400 }
      );
    }

    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { error: "message string is required" },
        { status: 400 }
      );
    }

    const result = await sendTextbeeSms({ recipients, message });
    return NextResponse.json({ success: true, result });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Internal error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
