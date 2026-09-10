import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

const updateSchema = z.object({
  businessName: z.string().min(2).optional(),
  description: z.string().min(20).optional(),
  phone: z.string().optional(),
  whatsapp: z.string().optional(),
  email: z.string().email().optional(),
  address: z.string().min(3).optional(),
  state: z.string().min(1).optional(),
});

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params;
  const db: any = prisma;

  const vendor = await db.materialVendor.findUnique({
    where: { id },
    include: {
      listings: {
        where: { status: "APPROVED" },
        include: { images: { where: { isPrimary: true }, take: 1 } },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!vendor || vendor.status !== "APPROVED") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(vendor);
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = params;
  const db: any = prisma;

  const vendor = await db.materialVendor.findUnique({ where: { id } });
  if (!vendor) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (vendor.userId !== (session.user.id as string)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues }, { status: 400 });

  const updated = await db.materialVendor.update({ where: { id }, data: parsed.data });

  await prisma.auditLog.create({
    data: {
      userId: session.user.id as string,
      action: "MATERIAL_VENDOR_UPDATED",
      entity: "MaterialVendor",
      entityId: id,
      meta: {},
    },
  });

  return NextResponse.json(updated);
}
