import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

const addSchema = z.object({
  url: z.string().url(),
  publicId: z.string(),
  isPrimary: z.boolean().optional(),
});

const deleteSchema = z.object({ imageId: z.string() });

async function assertOwner(listingId: string, userId: string) {
  const db: any = prisma;
  const listing = await db.materialListing.findUnique({
    where: { id: listingId },
    include: { vendor: true },
  });
  if (!listing) return { error: "Not found", status: 404 } as const;
  if (listing.vendor.userId !== userId) return { error: "Forbidden", status: 403 } as const;
  return { listing } as const;
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = params;
  const userId = session.user.id as string;
  const check = await assertOwner(id, userId);
  if ("error" in check) return NextResponse.json({ error: check.error }, { status: check.status });

  const body = await request.json();
  const parsed = addSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues }, { status: 400 });

  const db: any = prisma;
  const image = await db.materialImage.create({
    data: {
      listingId: id,
      url: parsed.data.url,
      publicId: parsed.data.publicId,
      isPrimary: parsed.data.isPrimary ?? false,
    },
  });

  return NextResponse.json(image, { status: 201 });
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = params;
  const userId = session.user.id as string;
  const check = await assertOwner(id, userId);
  if ("error" in check) return NextResponse.json({ error: check.error }, { status: check.status });

  const body = await request.json();
  const parsed = deleteSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues }, { status: 400 });

  const db: any = prisma;
  const image = await db.materialImage.findUnique({ where: { id: parsed.data.imageId } });
  if (!image || image.listingId !== id) {
    return NextResponse.json({ error: "Image not found" }, { status: 404 });
  }

  await db.materialImage.delete({ where: { id: parsed.data.imageId } });

  return NextResponse.json({ success: true });
}
