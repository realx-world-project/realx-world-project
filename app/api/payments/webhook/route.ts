import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  const rawBody = await request.text();

  const hash = crypto
    .createHmac("sha512", process.env.PAYSTACK_SECRET_KEY ?? "")
    .update(rawBody)
    .digest("hex");

  if (hash !== request.headers.get("x-paystack-signature")) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const event = JSON.parse(rawBody);
  const db: any = prisma;

  try {
    if (event.event === "charge.success") {
      const reference = event.data?.reference;
      const payment = await db.payment.findUnique({ where: { paystackRef: reference } });

      if (payment && payment.status === "PENDING") {
        await db.payment.update({
          where: { id: payment.id },
          data: { status: "SUCCESS", paystackData: event },
        });

        if (payment.type === "ENQUIRY_FEE") {
          await db.enquiry.updateMany({
            where: { paymentId: payment.id },
            data: { isPaid: true },
          });
        }
      }
    }
  } catch (err) {
    console.error("[payments webhook] error:", err);
  }

  return NextResponse.json({ received: true });
}
