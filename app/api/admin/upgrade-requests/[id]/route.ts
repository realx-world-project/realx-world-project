import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { sendEmail, sellerUpgradeApprovedEmail, sellerUpgradeRejectedEmail } from "@/lib/email";

const bodySchema = z.discriminatedUnion("status", [
  z.object({ status: z.literal("APPROVED") }),
  z.object({ status: z.literal("REJECTED"), adminNote: z.string().optional() }),
]);

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = params;
  const body = await request.json();
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues }, { status: 400 });

  const db: any = prisma;
  const existing = await db.roleUpgradeRequest.findUnique({
    where: { id },
    include: { user: { select: { name: true, email: true } } },
  });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const adminId = session.user.id as string;
  const data = parsed.data;
  const applicantName = existing.user?.name ?? "there";

  let updated;

  if (data.status === "APPROVED") {
    [updated] = await db.$transaction([
      db.roleUpgradeRequest.update({
        where: { id },
        data: { status: "APPROVED", adminNote: null },
      }),
      db.user.update({
        where: { id: existing.userId },
        data: { role: existing.toRole },
      }),
    ]);

    await prisma.auditLog.create({
      data: {
        userId: adminId,
        action: "ROLE_UPGRADED",
        entity: "User",
        entityId: existing.userId,
        meta: { fromRole: existing.fromRole, toRole: existing.toRole },
      },
    });

    if (existing.user?.email) {
      sendEmail({
        to: existing.user.email,
        subject: "Your seller account has been activated",
        html: sellerUpgradeApprovedEmail(applicantName),
      }).catch(console.error);
    }
  } else {
    updated = await db.roleUpgradeRequest.update({
      where: { id },
      data: { status: "REJECTED", adminNote: data.adminNote ?? null },
    });

    await prisma.auditLog.create({
      data: {
        userId: adminId,
        action: "ROLE_UPGRADE_REJECTED",
        entity: "User",
        entityId: existing.userId,
        meta: { adminNote: data.adminNote ?? null },
      },
    });

    if (existing.user?.email) {
      sendEmail({
        to: existing.user.email,
        subject: "Update on your seller request",
        html: sellerUpgradeRejectedEmail(applicantName, data.adminNote),
      }).catch(console.error);
    }
  }

  return NextResponse.json(updated);
}
