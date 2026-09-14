import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = session.user.id as string;
  const { searchParams } = new URL(request.url);
  const page = Math.max(1, Number(searchParams.get("page") ?? 1));
  const limit = 10;
  const skip = (page - 1) * limit;

  const db: any = prisma;
  const [payments, total] = await Promise.all([
    db.payment.findMany({
      where: { userId },
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: { listing: { select: { title: true } } },
    }),
    db.payment.count({ where: { userId } }),
  ]);

  return NextResponse.json({ payments, total, page, totalPages: Math.ceil(total / limit) || 1 });
}
