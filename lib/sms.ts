const TERMII_BASE = "https://api.ng.termii.com/api";
const SENDER_ID = process.env.TERMII_SENDER_ID ?? "RealXWorld";

export interface SmsResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

export async function sendSms(params: {
  to: string;
  message: string;
}): Promise<SmsResult> {
  const apiKey = process.env.TERMII_API_KEY;
  if (!apiKey) {
    console.warn("[sms] TERMII_API_KEY not set — skipping SMS");
    return { success: false, error: "SMS not configured" };
  }

  // Normalize Nigerian phone number to international format
  // e.g. 08012345678 → +2348012345678
  let phone = params.to.trim();
  if (phone.startsWith("0")) {
    phone = "+234" + phone.slice(1);
  } else if (phone.startsWith("234")) {
    phone = "+" + phone;
  } else if (!phone.startsWith("+")) {
    phone = "+234" + phone;
  }

  try {
    const res = await fetch(`${TERMII_BASE}/sms/send`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        to: phone,
        from: SENDER_ID,
        sms: params.message,
        type: "plain",
        api_key: apiKey,
        channel: "generic",
      }),
    });

    const data = await res.json();

    if (data?.code === "ok" || res.ok) {
      console.log("[sms] sent successfully to", phone);
      return { success: true, messageId: data?.message_id };
    }

    console.error("[sms] failed:", data);
    return {
      success: false,
      error: data?.message ?? "SMS delivery failed",
    };
  } catch (err: any) {
    console.error("[sms] error:", err?.message);
    return { success: false, error: err?.message };
  }
}

// Helper: send SMS fire-and-forget (never throws)
export function sendSmsAsync(params: { to: string; message: string }): void {
  sendSms(params).catch((err) =>
    console.error("[sms] async error:", err)
  );
}
