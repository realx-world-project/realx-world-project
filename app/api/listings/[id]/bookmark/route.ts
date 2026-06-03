import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await requireRole(["ADMIN", "AGENT", "SELLER", "BUYER"]);

  console.log("[bookmark] session result:", JSON.stringify(session instanceof NextResponse ? "NextResponse-returned" : session?.user));

  if (session instanceof NextResponse) {
    console.log("[bookmark] auth failed — returning early");
    return session;
  }

  const userId = session.user!.id as string;
  const listingId = params.id;

  console.log("[bookmark] userId:", userId, "listingId:", listingId);

  try {
    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
      select: { id: true },
    });

    console.log("[bookmark] listing found:", !!listing);

    if (!listing) {
      return NextResponse.json({ error: "Listing not found" }, { status: 404 });
    }

    const existing = await prisma.savedListing.findFirst({
      where: { userId, listingId },
    });

    console.log("[bookmark] existing saved:", !!existing);

    if (existing) {
      await prisma.savedListing.delete({ where: { id: existing.id } });
      return NextResponse.json({ bookmarked: false });
    }

    await prisma.savedListing.create({ data: { userId, listingId } });
    return NextResponse.json({ bookmarked: true });

  } catch (err) {
    console.error("[bookmark] error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
