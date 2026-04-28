import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "@/lib/session";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const listing = await prisma.listing.findUnique({
    where: { id: params.id },
    select: {
      id: true,
      title: true,
      description: true,
      price: true,
      type: true,
      category: true,
      status: true,
      publishedAt: true,
      createdAt: true,
      updatedAt: true,
      userId: true,
      images: {
        select: { id: true, url: true, publicId: true, isPrimary: true, order: true },
      },
      location: {
        select: { state: true, city: true, area: true, address: true, lat: true, lng: true },
      },
      user: { select: { name: true } },
    },
  });

  if (!listing) {
    return NextResponse.json({ error: "Listing not found" }, { status: 404 });
  }

  if (listing.status === "PUBLISHED") {
    return NextResponse.json(listing);
  }

  const session = await getServerSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const role = (session.user as any).role;
  const userId = session.user!.id as string;

  if (role !== "ADMIN" && listing.userId !== userId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return NextResponse.json(listing);
}
