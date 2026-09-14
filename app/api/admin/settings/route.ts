import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

const SETTABLE_KEYS = ["LISTING_FEE", "ENQUIRY_FEE", "COMMISSION_RATE", "PAYMENTS_ENABLED"] as const;

const bodySchema = z.object({
  key: z.enum(SETTABLE_KEYS),
  value: z.string(),
});

export async function GET() {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db: any = prisma;
  const settings = await db.platformSettings.findMany({
    where: { key: { in: SETTABLE_KEYS as unknown as string[] } },
  });

  return NextResponse.json({ settings });
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues }, { status: 400 });

  const { key, value } = parsed.data;
  const adminId = session.user.id as string;

  const db: any = prisma;
  const setting = await db.platformSettings.upsert({
    where: { key },
    update: { value, updatedBy: adminId },
    create: { key, value, updatedBy: adminId },
  });

  await prisma.auditLog.create({
    data: {
      userId: adminId,
      action: "PLATFORM_SETTING_UPDATED",
      entity: "PlatformSettings",
      entityId: setting.id,
      meta: { key, value },
    },
  });

  return NextResponse.json(setting);
}
