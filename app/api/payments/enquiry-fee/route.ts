import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { isPaymentsEnabled, getSetting } from "@/lib/settings";
import { initializePayment, generateReference } from "@/lib/paystack";

const bodySchema = z.object({
  listingId: z.string(),
  message: z.string().optional(),
});

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = session.user.id as string;
  const body = await request.json();
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues }, { status: 400 });

  const { listingId, message } = parsed.data;
  const db: any = prisma;

  const listing = await db.listing.findUnique({
    where: { id: listingId },
    select: { id: true, status: true },
  });

  if (!listing || listing.status !== "PUBLISHED") {
    return NextResponse.json({ error: "Listing not found" }, { status: 404 });
  }

  const paymentsEnabled = await isPaymentsEnabled();

  if (!paymentsEnabled) {
    const enquiry = await db.enquiry.create({
      data: {
        buyerId: userId,
        listingId,
        message,
        isPaid: true,
      },
    });
    return NextResponse.json({ skip: true, enquiryId: enquiry.id });
  }

  const existing = await db.enquiry.findFirst({
    where: { buyerId: userId, listingId, isPaid: true },
  });
  if (existing) {
    return NextResponse.json({ error: "You have already paid to enquire about this listing" }, { status: 400 });
  }

  const feeStr = await getSetting("ENQUIRY_FEE");
  const fee = parseFloat(feeStr);
  const reference = generateReference("EF");

  const payment = await db.payment.create({
    data: {
      userId,
      type: "ENQUIRY_FEE",
      amount: fee,
      listingId,
      paystackRef: reference,
    },
  });

  const enquiry = await db.enquiry.create({
    data: {
      buyerId: userId,
      listingId,
      message,
      isPaid: false,
      paymentId: payment.id,
    },
  });

  const result = await initializePayment({
    email: session.user.email as string,
    amount: fee,
    reference,
    metadata: { listingId, enquiryId: enquiry.id, type: "ENQUIRY_FEE" },
    callbackUrl: `${process.env.NEXTAUTH_URL}/dashboard/payments/verify`,
  });

  if (!result?.status) {
    return NextResponse.json({ error: "Failed to initialize payment" }, { status: 502 });
  }

  return NextResponse.json({
    authorizationUrl: result.data?.authorization_url,
    reference,
    enquiryId: enquiry.id,
  });
}
