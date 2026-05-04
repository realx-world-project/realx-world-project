import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";
import { moderateSchema } from "@/lib/validations/listing";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await requireRole(["ADMIN"]);

  if (session instanceof NextResponse) {
    return session;
  }

  const body = await request.json();
  const parsed = moderateSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues }, { status: 400 });
  }

  const { action, reason } = parsed.data;
  const listingId = params.id;
  const userId = session.user!.id as string;

  try {
    await prisma.$connect();

    const exists = await prisma.listing.findUnique({
      where: { id: listingId },
      select: { id: true },
    });

    if (!exists) {
      return NextResponse.json({ error: "Listing not found" }, { status: 404 });
    }

    const status = action === "APPROVE" ? "APPROVED" : "REJECTED";
    const auditAction = action === "APPROVE" ? "LISTING_APPROVED" : "LISTING_REJECTED";

    const listing = await prisma.$transaction(async (tx) => {
      const updated = await tx.listing.update({
        where: { id: listingId },
        data: { status },
        select: { id: true, status: true },
      });

      await tx.auditLog.create({
        data: {
          userId,
          action: auditAction,
          entity: "Listing",
          entityId: listingId,
          meta: { reason: reason ?? null },
        },
      });

      return updated;
    });

    return NextResponse.json({ id: listing.id, status: listing.status });
  } catch (err) {
    console.error("[moderate] error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
