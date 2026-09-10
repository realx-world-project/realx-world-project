import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

const updateSchema = z.object({
  title: z.string().min(3).optional(),
  description: z.string().min(20).optional(),
  category: z.string().optional(),
  price: z.coerce.number().positive().optional(),
  unit: z.string().min(1).optional(),
  minOrder: z.coerce.number().int().min(1).optional(),
  state: z.string().min(1).optional(),
});

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params;
  const db: any = prisma;

  const listing = await db.materialListing.findUnique({
    where: { id },
    include: {
      vendor: true,
      images: { orderBy: { createdAt: "asc" } },
    },
  });

  if (!listing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json(listing);
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = params;
  const db: any = prisma;

  const listing = await db.materialListing.findUnique({ where: { id }, include: { vendor: true } });
  if (!listing) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (listing.vendor.userId !== (session.user.id as string)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues }, { status: 400 });

  const updated = await db.materialListing.update({
    where: { id },
    data: parsed.data,
    include: { images: true },
  });

  await prisma.auditLog.create({
    data: {
      userId: session.user.id as string,
      action: "MATERIAL_LISTING_UPDATED",
      entity: "MaterialListing",
      entityId: id,
      meta: {},
    },
  });

  return NextResponse.json(updated);
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = params;
  const db: any = prisma;

  const listing = await db.materialListing.findUnique({ where: { id }, include: { vendor: true } });
  if (!listing) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (listing.vendor.userId !== (session.user.id as string)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await db.materialListing.delete({ where: { id } });

  await prisma.auditLog.create({
    data: {
      userId: session.user.id as string,
      action: "MATERIAL_LISTING_DELETED",
      entity: "MaterialListing",
      entityId: id,
      meta: {},
    },
  });

  return NextResponse.json({ success: true });
}
