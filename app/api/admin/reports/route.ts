import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";

export async function GET(request: NextRequest) {
  const session = await requireRole(["ADMIN"]);

  if (session instanceof NextResponse) {
    return session;
  }

  const { searchParams } = new URL(request.url);
  const page = Math.max(1, Number(searchParams.get("page") ?? 1));
  const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit") ?? 20)));
  const skip = (page - 1) * limit;

  const where = { status: "PENDING" as const };

  try {
    await prisma.$connect();

    const [reports, total] = await Promise.all([
      prisma.report.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          reason: true,
          status: true,
          createdAt: true,
          listing: { select: { id: true, title: true } },
          user: { select: { email: true } },
        },
      }),
      prisma.report.count({ where }),
    ]);

    return NextResponse.json({ reports, total, page, totalPages: Math.ceil(total / limit) });
  } catch (err) {
    console.error("[admin/reports] error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
