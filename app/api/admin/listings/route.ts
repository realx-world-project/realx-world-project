import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";

export async function GET(request: NextRequest) {
  const session = await requireRole(["ADMIN"]);
  if (session instanceof NextResponse) return session;

  const { searchParams } = new URL(request.url);
  const page = Math.max(1, Number(searchParams.get("page") ?? 1));
  const limit = Math.min(50, Math.max(1, Number(searchParams.get("limit") ?? 20)));
  const skip = (page - 1) * limit;
  const status = searchParams.get("status") ?? undefined;
  const category = searchParams.get("category") ?? undefined;

  const where: Record<string, unknown> = {
    ...(status && { status: status as any }),
    ...(category && { category: category as any }),
  };

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
        createdAt: true,
        images: {
          select: { url: true, isPrimary: true },
          orderBy: { order: "asc" },
          take: 1,
        },
        location: { select: { state: true, city: true, area: true } },
        user: { select: { name: true, email: true } },
      },
    }),
    prisma.listing.count({ where }),
  ]);

  return NextResponse.json({ listings, total, page, totalPages: Math.ceil(total / limit) });
}
