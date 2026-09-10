import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

const bodySchema = z.discriminatedUnion("status", [
  z.object({ status: z.literal("VERIFIED") }),
  z.object({ status: z.literal("FAILED"), failureReason: z.string().min(1) }),
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
  const record = await db.kycVerification.findUnique({ where: { id } });
  if (!record) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const data = parsed.data;
  const isVerified = data.status === "VERIFIED";
  const failureReason = data.status === "FAILED" ? data.failureReason : null;

  const updated = await db.kycVerification.update({
    where: { id },
    data: {
      status: data.status,
      failureReason,
      verifiedAt: isVerified ? new Date() : null,
    },
  });

  await db.user.update({
    where: { id: record.userId },
    data: { kycStatus: data.status },
  });

  await prisma.auditLog.create({
    data: {
      userId: session.user.id as string,
      action: "KYC_STATUS_OVERRIDDEN",
      entity: "KycVerification",
      entityId: id,
      meta: isVerified ? { status: "VERIFIED" } : { status: "FAILED", failureReason },
    },
  });

  return NextResponse.json(updated);
}
