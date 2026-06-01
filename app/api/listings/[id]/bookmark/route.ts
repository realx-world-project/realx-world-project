import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await requireRole(["ADMIN", "AGENT", "SELLER", "BUYER"]);

  if (session instanceof NextResponse) {
    return session;
  }

  const userId = session.user!.id as string;
  const listingId = params.id;

  try {
    await prisma.$connect();

    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
      select: { id: true },
    });

    if (!listing) {
      return NextResponse.json({ error: "Listing not found" }, { status: 404 });
    }

    const existing = await prisma.savedListing.findFirst({
      where: { userId, listingId },
    });

    if (existing) {
      await prisma.savedListing.delete({ where: { id: existing.id } });
      return NextResponse.json({ bookmarked: false });
    }

    await prisma.savedListing.create({ data: { userId, listingId } });
    return NextResponse.json({ bookmarked: true });
  } catch (err) {
    console.error("[bookmark] error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
