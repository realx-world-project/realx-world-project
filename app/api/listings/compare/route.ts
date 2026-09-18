import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const idsParam = searchParams.get("ids") ?? "";

  const ids = idsParam
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 3);

  if (ids.length === 0) {
    return NextResponse.json([]);
  }

  const rows = await prisma.listing.findMany({
    where: { id: { in: ids }, status: "PUBLISHED" },
    select: {
      id: true,
      title: true,
      price: true,
      type: true,
      category: true,
      status: true,
      leaseDuration: true,
      createdAt: true,
      location: { select: { city: true, state: true, address: true } },
      images: { where: { isPrimary: true }, take: 1, select: { url: true } },
    },
  });

  const byId = new Map(rows.map((r: any) => [r.id, r]));
  const ordered = ids.map((id) => byId.get(id)).filter(Boolean) as typeof rows;

  const listings = ordered.map((l: any) => ({
    id: l.id,
    title: l.title,
    price: l.price,
    type: l.type,
    category: l.category,
    status: l.status,
    leaseDuration: l.leaseDuration,
    location: l.location,
    images: l.images.map((img: any) => img.url),
    createdAt: l.createdAt,
  }));

  return NextResponse.json(listings);
}
