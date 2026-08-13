import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== "ADMIN") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(request.url);
  const status = url.searchParams.get("status");
  const where: any = {};
  if (status) where.status = status;

  const db: any = prisma;
  const items = await db.professional.findMany({ where, include: { user: true } });
  return NextResponse.json({ items });
}
