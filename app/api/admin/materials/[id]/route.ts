import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { sendEmail, materialListingApprovedEmail, materialListingRejectedEmail } from "@/lib/email";

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

  const db2: any = prisma;
  const materialWithVendor = await db2.materialListing.findUnique({
    where: { id },
    include: { vendor: { include: { user: { select: { email: true } } } } },
  });

  if (materialWithVendor?.vendor?.user?.email) {
    if (parsed.data.status === "APPROVED") {
      sendEmail({
        to: materialWithVendor.vendor.user.email,
        subject: "Your material listing is approved — RealX World",
        html: materialListingApprovedEmail(materialWithVendor.title),
      }).catch(console.error);
    } else if (parsed.data.status === "REJECTED") {
      sendEmail({
        to: materialWithVendor.vendor.user.email,
        subject: "Update on your material listing — RealX World",
        html: materialListingRejectedEmail(materialWithVendor.title),
      }).catch(console.error);
    }
  }

  return NextResponse.json(updated);
}
