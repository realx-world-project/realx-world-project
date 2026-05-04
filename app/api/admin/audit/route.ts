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
  const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit") ?? 50)));
  const skip = (page - 1) * limit;

  const userId = searchParams.get("userId") ?? undefined;
  const action = searchParams.get("action") ?? undefined;
  const entity = searchParams.get("entity") ?? undefined;
  const startDate = searchParams.get("startDate") ?? undefined;
  const endDate = searchParams.get("endDate") ?? undefined;

  const where: Record<string, unknown> = {
    ...(userId && { userId }),
    ...(action && { action }),
    ...(entity && { entity }),
    ...((startDate || endDate) && {
      createdAt: {
        ...(startDate && { gte: new Date(startDate) }),
        ...(endDate && { lte: new Date(endDate) }),
      },
    }),
  };

  try {
    await prisma.$connect();

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        skip,
        take: limit,
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
      prisma.auditLog.count({ where }),
    ]);

    return NextResponse.json({ logs, total, page, totalPages: Math.ceil(total / limit) });
  } catch (err) {
    console.error("[admin/audit] error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
