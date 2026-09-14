const PAYSTACK_BASE = "https://api.paystack.co";

async function paystackRequest(
  method: string,
  path: string,
  body?: object
) {
  const res = await fetch(`${PAYSTACK_BASE}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  return res.json();
}

export async function initializePayment(params: {
  email: string;
  amount: number; // in Naira, converted to kobo below
  reference: string;
  metadata?: object;
  callbackUrl: string;
}) {
  return paystackRequest("POST", "/transaction/initialize", {
    email: params.email,
    amount: params.amount * 100, // convert to kobo
    reference: params.reference,
    metadata: params.metadata,
    callback_url: params.callbackUrl,
  });
}

export async function verifyPayment(reference: string) {
  return paystackRequest("GET", `/transaction/verify/${reference}`);
}

export function generateReference(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}
