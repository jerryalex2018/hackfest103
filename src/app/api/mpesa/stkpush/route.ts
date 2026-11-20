import { NextResponse } from "next/server";
import { initiateMpesaStkPush } from "@/lib/mpesa";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { phoneNumber, amount, accountReference, transactionDesc } = body;

    if (!phoneNumber || !amount) {
      return NextResponse.json(
        { error: "phoneNumber and amount are required" },
        { status: 400 }
      );
    }

    const result = await initiateMpesaStkPush({
      phoneNumber,
      amount: Number(amount),
      accountReference: accountReference || "DegradationWatch",
      transactionDesc: transactionDesc || "Cleanup Bounty",
    });

    return NextResponse.json({ success: true, result });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "M-Pesa processing error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
