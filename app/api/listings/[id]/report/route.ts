import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";
import { rateLimitByIP } from "@/lib/rateLimit";
import { reportSchema } from "@/lib/validations/listing";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await requireRole(["ADMIN", "AGENT", "SELLER", "BUYER"]);

  if (session instanceof NextResponse) {
    return session;
  }

  const userId = session.user!.id as string;
  const rateLimit = await rateLimitByIP(`report:${userId}`, 3, "24 h");

  if (!rateLimit.success) {
    return NextResponse.json({ error: "Report limit reached" }, { status: 429 });
  }

  const body = await request.json();
  const parsed = reportSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues }, { status: 400 });
  }

  const listingId = params.id;

  const listing = await prisma.listing.findUnique({
    where: { id: listingId },
    select: { id: true },
  });

  if (!listing) {
    return NextResponse.json({ error: "Listing not found" }, { status: 404 });
  }

  await prisma.$transaction(async (tx) => {
    await tx.report.create({
      data: {
        userId,
        listingId,
        reason: parsed.data.reason,
        status: "PENDING",
      },
    });

    await tx.auditLog.create({
      data: {
        userId,
        action: "LISTING_REPORTED",
        entity: "Listing",
        entityId: listingId,
        meta: { reason: parsed.data.reason },
      },
    });
  });

  return NextResponse.json({ message: "Report submitted" }, { status: 201 });
}
