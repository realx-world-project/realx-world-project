import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { verifyPayment } from "@/lib/paystack";

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const reference = searchParams.get("reference");
  if (!reference) return NextResponse.json({ error: "Missing reference" }, { status: 400 });

  const db: any = prisma;
  const payment = await db.payment.findUnique({ where: { paystackRef: reference } });

  if (!payment) return NextResponse.json({ error: "Payment not found" }, { status: 404 });

  if (payment.status === "SUCCESS") {
    return NextResponse.json({ status: "already_verified", verified: true, type: payment.type });
  }

  const result = await verifyPayment(reference);

  if (result?.data?.status === "success") {
    await db.payment.update({
      where: { id: payment.id },
      data: { status: "SUCCESS", paystackData: result },
    });

    if (payment.type === "ENQUIRY_FEE") {
      await db.enquiry.updateMany({
        where: { paymentId: payment.id },
        data: { isPaid: true },
      });

      const listing = await db.listing.findUnique({
        where: { id: payment.listingId },
        include: { user: { select: { name: true, phone: true, email: true } } },
      });

      return NextResponse.json({
        verified: true,
        type: payment.type,
        seller: listing?.user
          ? { name: listing.user.name, phone: listing.user.phone, email: listing.user.email }
          : null,
      });
    }

    // LISTING_FEE: no further action needed — listing was already created.
    // The gate will check for a successful payment before publishing.
    return NextResponse.json({ verified: true, type: payment.type });
  }

  await db.payment.update({
    where: { id: payment.id },
    data: { status: "FAILED" },
  });

  return NextResponse.json({ verified: false, message: "Payment verification failed" });
}
