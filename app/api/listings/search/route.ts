import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import redis from "@/lib/redis";
import { searchSchema } from "@/lib/validations/listing";

const CACHE_TTL = 300; // 5 minutes

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const raw = Object.fromEntries(searchParams.entries());

  const parsed = searchSchema.safeParse(raw);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues }, { status: 400 });
  }

  const { q, type, category, state, city, minPrice, maxPrice, page, limit } = parsed.data;

  const sortedParams = JSON.stringify(
    Object.fromEntries(Object.entries(parsed.data).sort(([a], [b]) => a.localeCompare(b)))
  );
  const cacheKey = `search:${sortedParams}`;

  const cached = await redis.get(cacheKey) as string | null;
  if (cached) {
    return NextResponse.json(cached);
  }

  const where: Record<string, unknown> = {
    status: "PUBLISHED",
    ...(type && { type }),
    ...(category && { category }),
    ...(state && { location: { state } }),
    ...(city && { location: { city } }),
    ...((minPrice !== undefined || maxPrice !== undefined) && {
      price: {
        ...(minPrice !== undefined && { gte: minPrice }),
        ...(maxPrice !== undefined && { lte: maxPrice }),
      },
    }),
    ...(q && {
      OR: [
        { title: { contains: q, mode: "insensitive" } },
        { description: { contains: q, mode: "insensitive" } },
      ],
    }),
  };

  const skip = (page - 1) * limit;

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
        publishedAt: true,
        createdAt: true,
        images: { select: { url: true, isPrimary: true, order: true } },
        location: { select: { state: true, city: true, area: true, address: true } },
      },
    }),
    prisma.listing.count({ where }),
  ]);

  const result = { listings, total, page, totalPages: Math.ceil(total / limit) };

  await redis.set(cacheKey, result, { ex: CACHE_TTL });

  return NextResponse.json(result);
}
