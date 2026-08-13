import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

const updateSchema = z.object({
  category: z.string().optional(),
  bio: z.string().min(20).optional(),
  company: z.string().optional(),
  experience: z.number().int().min(0).optional(),
  location: z.string().optional(),
  state: z.string().optional(),
  phone: z.string().optional(),
  website: z.string().url().optional(),
});

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params;
  const db: any = prisma;
  const prof = await db.professional.findUnique({ where: { id }, include: { user: { select: { name: true, email: true } }, credentials: true } });

  if (!prof || prof.status !== "APPROVED") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(prof);
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = params;
  const db: any = prisma;
  const prof = await db.professional.findUnique({ where: { id } });
  if (!prof) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (prof.userId !== (session.user.id as string)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await request.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues }, { status: 400 });

  const updated = await db.professional.update({ where: { id }, data: parsed.data, include: { credentials: true } });

  await prisma.auditLog.create({
    data: {
      userId: session.user.id as string,
      action: "PROFESSIONAL_UPDATED",
      entity: "Professional",
      entityId: id,
      meta: {},
    },
  });

  return NextResponse.json(updated);
}
