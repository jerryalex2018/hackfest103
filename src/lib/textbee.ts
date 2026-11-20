export type TextbeeSmsPayload = {
  recipients: string[];
  message: string;
};

export async function sendTextbeeSms(payload: TextbeeSmsPayload) {
  const apiKey = process.env.TEXTBEE_API_KEY;
  const deviceId = process.env.TEXTBEE_DEVICE_ID;
  const baseUrl = process.env.TEXTBEE_BASE_URL || "https://api.textbee.dev/api/v1";

  if (!apiKey || !deviceId) {
    console.warn("Textbee credentials missing. Running in simulated SMS mode.");
    return {
      success: true,
      simulated: true,
      recipients: payload.recipients,
      message: payload.message,
      timestamp: new Date().toISOString(),
    };
  }

  try {
    const res = await fetch(`${baseUrl}/gateway/devices/${deviceId}/send-sms`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.message || `Textbee failed with status ${res.status}`);
    }

    return await res.json();
  } catch (error) {
    console.error("Failed to dispatch Textbee SMS:", error);
    throw error;
  }
}
