import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { isPaymentsEnabled, getSetting } from "@/lib/settings";
import { initializePayment, generateReference } from "@/lib/paystack";

const bodySchema = z.object({ listingId: z.string() });

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if ((session.user as any).role !== "SELLER") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const paymentsEnabled = await isPaymentsEnabled();
  if (!paymentsEnabled) {
    return NextResponse.json({ skip: true, message: "Payments not yet active" });
  }

  const body = await request.json();
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues }, { status: 400 });

  const userId = session.user.id as string;
  const { listingId } = parsed.data;

  const listing = await prisma.listing.findUnique({
    where: { id: listingId },
    select: { id: true, userId: true },
  });

  if (!listing || listing.userId !== userId) {
    return NextResponse.json({ error: "Listing not found" }, { status: 404 });
  }

  const feeStr = await getSetting("LISTING_FEE");
  const fee = parseFloat(feeStr);
  const reference = generateReference("LF");

  const db: any = prisma;
  await db.payment.create({
    data: {
      userId,
      type: "LISTING_FEE",
      amount: fee,
      listingId,
      paystackRef: reference,
    },
  });

  const result = await initializePayment({
    email: session.user.email as string,
    amount: fee,
    reference,
    metadata: { listingId, type: "LISTING_FEE" },
    callbackUrl: `${process.env.NEXTAUTH_URL}/dashboard/payments/verify`,
  });

  if (!result?.status) {
    return NextResponse.json({ error: "Failed to initialize payment" }, { status: 502 });
  }

  return NextResponse.json({
    authorizationUrl: result.data?.authorization_url,
    reference,
  });
}
