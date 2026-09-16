import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import redis from "@/lib/redis";
import { auth } from "@/lib/auth";

const CACHE_TTL = 120; // 2 minutes
const CACHE_KEY = "admin:stats:v2";

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const cached = await redis.get(CACHE_KEY) as string | null;
  if (cached) {
    return NextResponse.json(cached);
  }

  try {
    await prisma.$connect();

    const [
      totalUsers,
      usersByRole,
      listingsByStatus,
      pendingReports,
      recentAuditLogs,
      listingsRaw,
      usersRaw,
      professionalsByStatus,
      materialListingsByStatus,
      savedListingsCount,
      kycByStatus,
      paymentsByStatusType,
      enquiriesCount,
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

      // Listings over time — last 12 months
      prisma.listing.findMany({
        where: {
          createdAt: {
            gte: new Date(new Date().setMonth(new Date().getMonth() - 12)),
          },
        },
        select: { createdAt: true, status: true, type: true, category: true },
      }),

      // Users over time — last 12 months
      prisma.user.findMany({
        where: {
          createdAt: {
            gte: new Date(new Date().setMonth(new Date().getMonth() - 12)),
          },
        },
        select: { createdAt: true, role: true },
      }),

      // Professionals count by status
      (prisma as any).professional.groupBy({
        by: ["status"],
        _count: { status: true },
      }),

      // Material listings count by status
      (prisma as any).materialListing.groupBy({
        by: ["status"],
        _count: { status: true },
      }),

      // Saved listings count
      prisma.savedListing.count(),

      // KYC stats
      (prisma as any).kycVerification.groupBy({
        by: ["status"],
        _count: { status: true },
      }),

      // Payments stats (total by status and type)
      (prisma as any).payment.groupBy({
        by: ["status", "type"],
        _count: { status: true },
        _sum: { amount: true },
      }),

      // Enquiries count
      (prisma as any).enquiry.count(),
    ]);

    const stats = {
      totalUsers,
      usersByRole: usersByRole.map((r: any) => ({ role: r.role, count: r._count.role })),
      listingsByStatus: listingsByStatus.map((l: any) => ({ status: l.status, count: l._count.status })),
      pendingReports,
      recentAuditLogs,
      listingsRaw,
      usersRaw,
      professionalsByStatus: professionalsByStatus.map((p: any) => ({
        status: p.status,
        count: p._count.status,
      })),
      materialListingsByStatus: materialListingsByStatus.map((m: any) => ({
        status: m.status,
        count: m._count.status,
      })),
      savedListingsCount,
      kycByStatus: kycByStatus.map((k: any) => ({ status: k.status, count: k._count.status })),
      paymentsByStatusType: paymentsByStatusType.map((p: any) => ({
        status: p.status,
        type: p.type,
        count: p._count.status,
        totalAmount: p._sum.amount ?? 0,
      })),
      enquiriesCount,
    };

    await redis.set(CACHE_KEY, stats, { ex: CACHE_TTL });

    return NextResponse.json(stats);
  } catch (err) {
    console.error("[admin/stats] error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
