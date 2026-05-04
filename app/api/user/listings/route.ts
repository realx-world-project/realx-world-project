import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";

export async function GET(request: NextRequest) {
  const session = await requireRole(["ADMIN", "AGENT", "SELLER", "BUYER"]);

  if (session instanceof NextResponse) {
    return session;
  }

  const userId = session.user!.id as string;
  const { searchParams } = new URL(request.url);
  const page = Math.max(1, Number(searchParams.get("page") ?? 1));
  const limit = Math.min(50, Math.max(1, Number(searchParams.get("limit") ?? 20)));
  const skip = (page - 1) * limit;
  const statusParam = searchParams.get("status");

  const where = {
    userId,
    ...(statusParam && { status: statusParam as any }),
  };

  try {
    await prisma.$connect();

    const [listings, total] = await Promise.all([
      prisma.listing.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
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
      }),
      prisma.listing.count({ where }),
    ]);

    return NextResponse.json({ listings, total, page, totalPages: Math.ceil(total / limit) });
  } catch (err) {
    console.error("[user/listings GET] error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
