import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole, getServerSession } from "@/lib/session";
import { listingSchema } from "@/lib/validations/listing";

const LISTING_SELECT = {
  id: true,
  title: true,
  price: true,
  type: true,
  category: true,
  status: true,
  publishedAt: true,
  createdAt: true,
  images: { select: { url: true, isPrimary: true, order: true } },
  location: { select: { state: true, city: true, area: true, address: true } },
};

export async function POST(request: NextRequest) {
  const session = await requireRole(["SELLER", "AGENT"]);

  if (session instanceof NextResponse) {
    return session;
  }

  const body = await request.json();
  const parsed = listingSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues }, { status: 400 });
  }

  const { title, description, price, type, category, location, images } = parsed.data;
  const userId = session.user!.id as string;

  const listing = await prisma.$transaction(async (tx) => {
    const loc = await tx.location.create({
      data: {
        state: location.state,
        city: location.city,
        area: location.area ?? "",
        address: location.address,
        lat: location.lat,
        lng: location.lng,
      },
    });

    const created = await tx.listing.create({
      data: {
        title,
        description,
        price,
        type,
        category,
        status: "PENDING",
        userId,
        locationId: loc.id,
      },
    });

    await tx.listingImage.createMany({
      data: images.map((img) => ({
        listingId: created.id,
        url: img.url,
        publicId: img.publicId,
        isPrimary: img.isPrimary,
        order: img.order,
      })),
    });

    await tx.auditLog.create({
      data: {
        userId,
        action: "LISTING_CREATED",
        entity: "Listing",
        entityId: created.id,
        meta: {},
      },
    });

    return created;
  });

  return NextResponse.json({ id: listing.id, status: listing.status }, { status: 201 });
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const page = Math.max(1, Number(searchParams.get("page") ?? 1));
  const limit = Math.min(50, Math.max(1, Number(searchParams.get("limit") ?? 20)));
  const skip = (page - 1) * limit;

  const session = await getServerSession();
  const isAuthenticated = !!session;

  const statusParam = searchParams.get("status");
  const where: Record<string, unknown> = isAuthenticated && statusParam
    ? { status: statusParam }
    : { status: "PUBLISHED" };

  const [listings, total] = await Promise.all([
    prisma.listing.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      select: LISTING_SELECT,
    }),
    prisma.listing.count({ where }),
  ]);

  return NextResponse.json({ listings, total, page, totalPages: Math.ceil(total / limit) });
}
