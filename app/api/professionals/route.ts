import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

const createSchema = z.object({
  category: z.string(),
  bio: z.string().min(20),
  company: z.string().optional(),
  experience: z.number().int().min(0),
  location: z.string(),
  state: z.string(),
  phone: z.string(),
  website: z.string().url().optional(),
});

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const category = url.searchParams.get("category") as string | null;
  const state = url.searchParams.get("state") as string | null;
  const search = url.searchParams.get("search") as string | null;
  const page = parseInt(url.searchParams.get("page") ?? "1", 10) || 1;
  const take = 12;
  const skip = (page - 1) * take;

  const where: any = { status: "APPROVED" };

  if (category) where.category = category;
  if (state) where.state = state;
  if (search) {
    where.OR = [
      { bio: { contains: search, mode: "insensitive" } },
      { company: { contains: search, mode: "insensitive" } },
      { user: { name: { contains: search, mode: "insensitive" } } },
    ];
  }

  const db: any = prisma;
  const [total, items] = await Promise.all([
    db.professional.count({ where }),
    db.professional.findMany({
      where,
      include: { user: { select: { name: true, email: true } }, credentials: true },
      orderBy: { createdAt: "desc" },
      skip,
      take,
    }),
  ]);

  return NextResponse.json({ items, total, page, perPage: take });
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues }, { status: 400 });

  try {
    const db: any = prisma;
    const existing = await db.professional.findUnique({ where: { userId: session.user.id as string } });
    if (existing) return NextResponse.json({ error: "Profile already exists" }, { status: 409 });

    const prof = await db.professional.create({
      data: {
        userId: session.user.id as string,
        category: parsed.data.category as any,
        bio: parsed.data.bio,
        company: parsed.data.company,
        experience: parsed.data.experience,
        location: parsed.data.location,
        state: parsed.data.state,
        phone: parsed.data.phone,
        website: parsed.data.website,
      },
      include: { user: { select: { name: true, email: true } }, credentials: true },
    });

    await prisma.auditLog.create({
      data: {
        userId: session.user.id as string,
        action: "PROFESSIONAL_CREATED",
        entity: "Professional",
        entityId: prof.id,
        meta: {},
      },
    });

    return NextResponse.json(prof, { status: 201 });
  } catch (err) {
    console.error("[professionals POST]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
