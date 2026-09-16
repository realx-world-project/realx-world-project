import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

type Period = "7d" | "30d" | "90d" | "12m";

function getPeriodStart(period: Period): Date {
  const now = new Date();
  switch (period) {
    case "7d":
      return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    case "90d":
      return new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
    case "12m": {
      const d = new Date(now);
      d.setMonth(d.getMonth() - 12);
      return d;
    }
    case "30d":
    default:
      return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  }
}

function dayKey(date: Date): string {
  return new Date(date).toISOString().slice(0, 10);
}

function bucketByDay<T extends { createdAt: Date }>(
  rows: T[],
  start: Date,
  end: Date,
  valueOf: (row: T) => number
): { date: string; count: number }[] {
  const buckets = new Map<string, number>();

  const cursor = new Date(start);
  cursor.setHours(0, 0, 0, 0);
  const endDay = new Date(end);
  endDay.setHours(0, 0, 0, 0);
  while (cursor <= endDay) {
    buckets.set(dayKey(cursor), 0);
    cursor.setDate(cursor.getDate() + 1);
  }

  for (const row of rows) {
    const key = dayKey(row.createdAt);
    if (buckets.has(key)) {
      buckets.set(key, (buckets.get(key) ?? 0) + valueOf(row));
    }
  }

  return Array.from(buckets.entries()).map(([date, count]) => ({ date, count }));
}

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const periodParam = searchParams.get("period");
  const period: Period = ["7d", "30d", "90d", "12m"].includes(periodParam ?? "")
    ? (periodParam as Period)
    : "30d";

  const start = getPeriodStart(period);
  const now = new Date();
  const db: any = prisma;

  const [listings, users, payments, stateRows] = await Promise.all([
    prisma.listing.findMany({
      where: { createdAt: { gte: start } },
      select: { createdAt: true, type: true, category: true },
    }),
    prisma.user.findMany({
      where: { createdAt: { gte: start } },
      select: { createdAt: true },
    }),
    db.payment.findMany({
      where: { createdAt: { gte: start }, status: "SUCCESS" },
      select: { createdAt: true, amount: true },
    }),
    prisma.$queryRaw<{ state: string; count: number }[]>`
      SELECT l.state as state, COUNT(*)::int as count
      FROM locations l
      JOIN listings li ON li."locationId" = l.id
      WHERE li.status = 'PUBLISHED'
      GROUP BY l.state
      ORDER BY count DESC
      LIMIT 10
    `,
  ]);

  const listingsByDay = bucketByDay(listings, start, now, () => 1);
  const usersByDay = bucketByDay(users, start, now, () => 1);
  const revenueByDayRaw = bucketByDay(payments, start, now, (p: any) => p.amount);
  const revenueByDay = revenueByDayRaw.map((r) => ({ date: r.date, amount: r.count }));

  const typeCounts = new Map<string, number>();
  const categoryCounts = new Map<string, number>();
  for (const l of listings as any[]) {
    typeCounts.set(l.type, (typeCounts.get(l.type) ?? 0) + 1);
    categoryCounts.set(l.category, (categoryCounts.get(l.category) ?? 0) + 1);
  }

  const listingsByType = Array.from(typeCounts.entries()).map(([type, count]) => ({ type, count }));
  const listingsByCategory = Array.from(categoryCounts.entries()).map(([category, count]) => ({
    category,
    count,
  }));

  const listingsByState = (stateRows as any[]).map((r) => ({ state: r.state, count: Number(r.count) }));

  return NextResponse.json({
    listingsByDay,
    usersByDay,
    listingsByType,
    listingsByCategory,
    listingsByState,
    revenueByDay,
  });
}
