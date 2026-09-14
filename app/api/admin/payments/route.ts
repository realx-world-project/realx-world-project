import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type") ?? undefined;
  const status = searchParams.get("status") ?? undefined;
  const page = Math.max(1, Number(searchParams.get("page") ?? 1));
  const limit = 20;
  const skip = (page - 1) * limit;

  const where: any = {
    ...(type && type !== "all" && { type }),
    ...(status && status !== "all" && { status }),
  };

  const db: any = prisma;
  const [payments, total] = await Promise.all([
    db.payment.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { email: true, name: true } },
        listing: { select: { title: true } },
      },
    }),
    db.payment.count({ where }),
  ]);

  return NextResponse.json({ payments, total, page, totalPages: Math.ceil(total / limit) || 1 });
}
