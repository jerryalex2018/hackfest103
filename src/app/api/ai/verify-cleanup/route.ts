import { NextResponse } from "next/server";
import { verifyCleanupWithGemini } from "@/lib/gemini";
import { initiateMpesaStkPush } from "@/lib/mpesa";
import { updateLocationStatusInSupabase } from "@/lib/supabase";

export const runtime = "edge";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { beforeImageUrl, afterImageUrl, locationId, cleanerPhone, bountyAmount } = body;

    if (!afterImageUrl) {
      return NextResponse.json(
        { error: "afterImageUrl is required for cleanup verification" },
        { status: 400 }
      );
    }

    const amount = Number(bountyAmount) || 500;

    // Run Gemini Vision Multimodal Cleanup Verification
    const aiResult = await verifyCleanupWithGemini(
      beforeImageUrl || "/images/sample-1.jpg",
      afterImageUrl
    );

    // If verified by AI, mark location as resolved in Supabase
    let locationUpdated = false;
    if (aiResult.verified && locationId) {
      try {
        locationUpdated = await updateLocationStatusInSupabase(Number(locationId), "resolved");
      } catch (dbErr) {
        console.warn("Could not auto-resolve location in DB:", dbErr);
      }
    }

    // Trigger M-Pesa STK Push / Reward Payout if phone is provided and verified
    let mpesaResult = null;
    if (cleanerPhone && aiResult.verified) {
      try {
        mpesaResult = await initiateMpesaStkPush({
          phoneNumber: cleanerPhone,
          amount,
          accountReference: `CleanSite#${locationId || 1}`,
          transactionDesc: "Verified Civic Cleanup Bounty",
        });
      } catch (mpesaErr) {
        console.warn("M-Pesa payout trigger error:", mpesaErr);
      }
    }

    return NextResponse.json({
      success: true,
      verification: aiResult,
      bountyAmount: amount,
      cleanerPhone,
      locationUpdated,
      mpesaResult,
      resolvedAt: new Date().toISOString(),
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Cleanup verification error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
