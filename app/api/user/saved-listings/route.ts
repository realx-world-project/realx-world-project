import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";

export async function GET(request: NextRequest) {
  const session = await requireRole(["ADMIN", "AGENT", "SELLER", "BUYER"]);

  if (session instanceof NextResponse) {
    return session;
  }

  const userId = session.user!.id as string;

  const saved = await prisma.savedListing.findMany({
    where: {
      userId,
      listing: { status: "PUBLISHED" },
    },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      createdAt: true,
      listing: {
        select: {
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
        },
      },
    },
  });

  return NextResponse.json({ savedListings: saved });
}
