import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

const bodySchema = z.object({ status: z.enum(["APPROVED", "REJECTED", "SUSPENDED"]) });

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = params;
  const body = await request.json();
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues }, { status: 400 });

  const db: any = prisma;
  const updated = await db.materialListing.update({
    where: { id },
    data: { status: parsed.data.status },
  });

  await prisma.auditLog.create({
    data: {
      userId: session.user.id as string,
      action: "MATERIAL_LISTING_STATUS_UPDATED",
      entity: "MaterialListing",
      entityId: id,
      meta: { status: parsed.data.status },
    },
  });

  return NextResponse.json(updated);
}
