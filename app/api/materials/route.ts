import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

const createSchema = z.object({
  title: z.string().min(3),
  description: z.string().min(20),
  category: z.string(),
  price: z.coerce.number().positive(),
  unit: z.string().min(1),
  minOrder: z.coerce.number().int().min(1).default(1),
  state: z.string().min(1),
});

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");
  const state = searchParams.get("state");
  const search = searchParams.get("search");
  const page = Math.max(1, Number(searchParams.get("page") ?? 1));
  const take = 12;
  const skip = (page - 1) * take;

  const where: any = { status: "APPROVED" };
  if (category && category !== "all") where.category = category;
  if (state && state !== "all") where.state = state;
  if (search) {
    where.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
    ];
  }

  const db: any = prisma;
  const [total, listings] = await Promise.all([
    db.materialListing.count({ where }),
    db.materialListing.findMany({
      where,
      include: {
        vendor: { select: { businessName: true, state: true, isVerified: true } },
        images: { where: { isPrimary: true }, take: 1 },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take,
    }),
  ]);

  return NextResponse.json({ listings, total, page, totalPages: Math.ceil(total / take) || 1 });
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = session.user.id as string;
  const db: any = prisma;

  const vendor = await db.materialVendor.findUnique({ where: { userId } });
  if (!vendor) return NextResponse.json({ error: "Register as a vendor first" }, { status: 400 });
  if (vendor.status !== "APPROVED") {
    return NextResponse.json({ error: "Vendor account pending approval" }, { status: 400 });
  }

  const body = await request.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues }, { status: 400 });

  const listing = await db.materialListing.create({
    data: {
      vendorId: vendor.id,
      title: parsed.data.title,
      description: parsed.data.description,
      category: parsed.data.category,
      price: parsed.data.price,
      unit: parsed.data.unit,
      minOrder: parsed.data.minOrder,
      state: parsed.data.state,
    },
  });

  await prisma.auditLog.create({
    data: {
      userId,
      action: "MATERIAL_LISTING_CREATED",
      entity: "MaterialListing",
      entityId: listing.id,
      meta: {},
    },
  });

  return NextResponse.json(listing, { status: 201 });
}
