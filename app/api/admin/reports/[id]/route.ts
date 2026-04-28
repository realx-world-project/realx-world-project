import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";

const reviewReportSchema = z.object({
  action: z.enum(["MARK_REVIEWED"]),
  rejectListing: z.boolean().optional(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await requireRole(["ADMIN"]);

  if (session instanceof NextResponse) {
    return session;
  }

  const body = await request.json();
  const parsed = reviewReportSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues }, { status: 400 });
  }

  const reportId = params.id;
  const adminId = session.user!.id as string;
  const { rejectListing } = parsed.data;

  const existing = await prisma.report.findUnique({
    where: { id: reportId },
    select: { id: true, listingId: true },
  });

  if (!existing) {
    return NextResponse.json({ error: "Report not found" }, { status: 404 });
  }

  const report = await prisma.$transaction(async (tx) => {
    const updated = await tx.report.update({
      where: { id: reportId },
      data: { status: "REVIEWED" },
      select: {
        id: true,
        reason: true,
        status: true,
        createdAt: true,
        listing: { select: { id: true, title: true } },
        user: { select: { email: true } },
      },
    });

    if (rejectListing) {
      await tx.listing.update({
        where: { id: existing.listingId },
        data: { status: "REJECTED" },
      });
    }

    await tx.auditLog.create({
      data: {
        userId: adminId,
        action: "REPORT_REVIEWED",
        entity: "Report",
        entityId: reportId,
        meta: { rejectListing: rejectListing ?? false },
      },
    });

    return updated;
  });

  return NextResponse.json(report);
}
