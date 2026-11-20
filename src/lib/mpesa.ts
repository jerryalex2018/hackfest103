export type MpesaStkPushRequest = {
  phoneNumber: string; // Format: 2547XXXXXXXX
  amount: number;
  accountReference: string;
  transactionDesc: string;
};

export async function initiateMpesaStkPush(req: MpesaStkPushRequest) {
  const consumerKey = process.env.MPESA_CONSUMER_KEY;
  const consumerSecret = process.env.MPESA_CONSUMER_SECRET;
  const shortcode = process.env.MPESA_BUSINESS_SHORTCODE || "174379";
  const passkey =
    process.env.MPESA_PASSKEY ||
    "bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919";
  const callbackUrl =
    process.env.MPESA_CALLBACK_URL ||
    "https://example.com/api/mpesa/callback";
  const env = process.env.MPESA_ENVIRONMENT || "sandbox";

  // If credentials are not present, return a realistic simulated Daraja STK Push response
  if (!consumerKey || !consumerSecret) {
    console.warn("M-Pesa credentials not set. Simulating STK push response.");
    const checkoutRequestId = `ws_CO_${Date.now()}_${Math.floor(Math.random() * 100000)}`;
    return {
      MerchantRequestID: `REQ-${Date.now()}`,
      CheckoutRequestID: checkoutRequestId,
      ResponseCode: "0",
      ResponseDescription: "Success. Request accepted for processing",
      CustomerMessage: "Success. Request accepted for processing",
      simulated: true,
      amount: req.amount,
      phoneNumber: req.phoneNumber,
    };
  }

  const authUrl =
    env === "production"
      ? "https://api.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials"
      : "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials";

  const stkUrl =
    env === "production"
      ? "https://api.safaricom.co.ke/mpesa/stkpush/v1/processrequest"
      : "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest";

  // 1. Get OAuth Bearer token
  const authHeader = Buffer.from(`${consumerKey}:${consumerSecret}`).toString(
    "base64"
  );
  const tokenRes = await fetch(authUrl, {
    headers: { Authorization: `Basic ${authHeader}` },
  });

  if (!tokenRes.ok) {
    throw new Error(`Failed to authenticate with Safaricom Daraja: ${tokenRes.status}`);
  }

  const { access_token } = await tokenRes.json();

  // 2. Generate Timestamp and Password
  const date = new Date();
  const timestamp =
    date.getFullYear() +
    String(date.getMonth() + 1).padStart(2, "0") +
    String(date.getDate()).padStart(2, "0") +
    String(date.getHours()).padStart(2, "0") +
    String(date.getMinutes()).padStart(2, "0") +
    String(date.getSeconds()).padStart(2, "0");

  const password = Buffer.from(`${shortcode}${passkey}${timestamp}`).toString(
    "base64"
  );

  // Normalize phone number (e.g. 0712... -> 254712...)
  let phone = req.phoneNumber.trim().replace("+", "");
  if (phone.startsWith("0")) {
    phone = `254${phone.substring(1)}`;
  }

  // 3. Dispatch STK Push
  const stkRes = await fetch(stkUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${access_token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      BusinessShortCode: shortcode,
      Password: password,
      Timestamp: timestamp,
      TransactionType: "CustomerPayBillOnline",
      Amount: Math.round(req.amount),
      PartyA: phone,
      PartyB: shortcode,
      PhoneNumber: phone,
      CallBackURL: callbackUrl,
      AccountReference: req.accountReference,
      TransactionDesc: req.transactionDesc,
    }),
  });

  return stkRes.json();
}
