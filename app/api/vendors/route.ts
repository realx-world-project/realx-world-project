import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

const createSchema = z.object({
  businessName: z.string().min(2),
  description: z.string().min(20),
  phone: z.string(),
  whatsapp: z.string().optional(),
  email: z.string().email().optional(),
  address: z.string().min(3),
  state: z.string().min(1),
});

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const state = searchParams.get("state");
  const search = searchParams.get("search");
  const page = Math.max(1, Number(searchParams.get("page") ?? 1));
  const take = 12;
  const skip = (page - 1) * take;

  const where: any = { status: "APPROVED" };
  if (state && state !== "all") where.state = state;
  if (search) {
    where.OR = [
      { businessName: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
    ];
  }

  const db: any = prisma;
  const [total, vendors] = await Promise.all([
    db.materialVendor.count({ where }),
    db.materialVendor.findMany({
      where,
      include: { _count: { select: { listings: { where: { status: "APPROVED" } } } } },
      orderBy: { createdAt: "desc" },
      skip,
      take,
    }),
  ]);

  return NextResponse.json({ vendors, total, page, totalPages: Math.ceil(total / take) || 1 });
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = session.user.id as string;
  const db: any = prisma;

  const existing = await db.materialVendor.findUnique({ where: { userId } });
  if (existing) return NextResponse.json({ error: "Vendor profile already exists" }, { status: 409 });

  const body = await request.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues }, { status: 400 });

  const vendor = await db.materialVendor.create({
    data: {
      userId,
      businessName: parsed.data.businessName,
      description: parsed.data.description,
      phone: parsed.data.phone,
      whatsapp: parsed.data.whatsapp,
      email: parsed.data.email,
      address: parsed.data.address,
      state: parsed.data.state,
    },
  });

  await prisma.auditLog.create({
    data: {
      userId,
      action: "MATERIAL_VENDOR_CREATED",
      entity: "MaterialVendor",
      entityId: vendor.id,
      meta: {},
    },
  });

  return NextResponse.json(vendor, { status: 201 });
}
