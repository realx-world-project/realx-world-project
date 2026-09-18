import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

const MAX_SAVED_SEARCHES = 20;

const bodySchema = z.object({
  name: z.string().min(2).max(50),
  query: z.string().optional(),
  filters: z.record(z.any()),
  href: z.string().min(1),
});

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = session.user.id as string;
  const db: any = prisma;

  const searches = await db.savedSearch.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(searches);
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = session.user.id as string;
  const body = await request.json();
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }

  const { name, query, filters, href } = parsed.data;
  const db: any = prisma;

  const existing = await db.savedSearch.findFirst({ where: { userId, href } });
  if (existing) {
    return NextResponse.json({ error: "Search already saved" }, { status: 400 });
  }

  const count = await db.savedSearch.count({ where: { userId } });
  if (count >= MAX_SAVED_SEARCHES) {
    return NextResponse.json({ error: "Maximum saved searches reached" }, { status: 400 });
  }

  const search = await db.savedSearch.create({
    data: { userId, name, query, filters, href },
  });

  return NextResponse.json(search);
}
