import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { verifyIdentity } from "@/lib/youverify";

const kycSchema = z.object({
  idType: z.enum(["NIN", "BVN", "DRIVERS_LICENSE", "PASSPORT"]),
  idNumber: z.string().min(1, "ID number is required"),
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  dateOfBirth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date of birth must be in YYYY-MM-DD format"),
});

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const db: any = prisma;
  const record = await db.kycVerification.findUnique({
    where: { userId: session.user.id as string },
  });

  return NextResponse.json(record ?? null);
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = session.user.id as string;
  const db: any = prisma;

  const existing = await db.kycVerification.findUnique({ where: { userId } });
  if (existing?.status === "VERIFIED") {
    return NextResponse.json({ error: "Identity already verified" }, { status: 400 });
  }

  const body = await request.json();
  const parsed = kycSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues }, { status: 400 });

  const { idType, idNumber, firstName, lastName, dateOfBirth } = parsed.data;

  const result = await verifyIdentity({ idType, idNumber, firstName, lastName, dateOfBirth });

  if (result.success) {
    await db.kycVerification.upsert({
      where: { userId },
      create: {
        userId,
        idType,
        idNumber,
        firstName,
        lastName,
        dateOfBirth,
        status: "VERIFIED",
        youverifyRef: result.reference,
        failureReason: null,
        verifiedAt: new Date(),
      },
      update: {
        idType,
        idNumber,
        firstName,
        lastName,
        dateOfBirth,
        status: "VERIFIED",
        youverifyRef: result.reference,
        failureReason: null,
        verifiedAt: new Date(),
      },
    });

    await db.user.update({ where: { id: userId }, data: { kycStatus: "VERIFIED" } });

    await prisma.auditLog.create({
      data: {
        userId,
        action: "KYC_VERIFIED",
        entity: "KycVerification",
        entityId: userId,
        meta: { idType },
      },
    });

    return NextResponse.json({ verified: true, message: "Identity verified successfully" });
  }

  await db.kycVerification.upsert({
    where: { userId },
    create: {
      userId,
      idType,
      idNumber,
      firstName,
      lastName,
      dateOfBirth,
      status: "FAILED",
      failureReason: result.failureReason,
    },
    update: {
      idType,
      idNumber,
      firstName,
      lastName,
      dateOfBirth,
      status: "FAILED",
      failureReason: result.failureReason,
    },
  });

  await db.user.update({ where: { id: userId }, data: { kycStatus: "FAILED" } });

  await prisma.auditLog.create({
    data: {
      userId,
      action: "KYC_FAILED",
      entity: "KycVerification",
      entityId: userId,
      meta: { idType, reason: result.failureReason ?? "" },
    },
  });

  return NextResponse.json(
    { verified: false, error: result.failureReason ?? "Verification failed" },
    { status: 400 }
  );
}
