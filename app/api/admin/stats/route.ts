import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import redis from "@/lib/redis";
import { requireRole } from "@/lib/session";

const CACHE_TTL = 120; // 2 minutes
const CACHE_KEY = "admin:stats";

export async function GET(request: NextRequest) {
  const session = await requireRole(["ADMIN"]);

  if (session instanceof NextResponse) {
    return session;
  }

  const cached = await redis.get<string>(CACHE_KEY);
  if (cached) {
    return NextResponse.json(cached);
  }

  const [
    totalUsers,
    usersByRole,
    listingsByStatus,
    pendingReports,
    recentAuditLogs,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.groupBy({ by: ["role"], _count: { role: true } }),
    prisma.listing.groupBy({ by: ["status"], _count: { status: true } }),
    prisma.report.count({ where: { status: "PENDING" } }),
    prisma.auditLog.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        action: true,
        entity: true,
        entityId: true,
        meta: true,
        createdAt: true,
        user: { select: { email: true } },
      },
    }),
  ]);

  const stats = {
    totalUsers,
    usersByRole: usersByRole.map((r) => ({ role: r.role, count: r._count.role })),
    listingsByStatus: listingsByStatus.map((l) => ({ status: l.status, count: l._count.status })),
    pendingReports,
    recentAuditLogs,
  };

  await redis.set(CACHE_KEY, stats, { ex: CACHE_TTL });

  return NextResponse.json(stats);
}
