import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { sendEmail, vendorApprovedEmail, vendorRejectedEmail } from "@/lib/email";

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

  const status = parsed.data.status;
  const isVerified = status === "APPROVED";

  const db: any = prisma;
  const updated = await db.materialVendor.update({
    where: { id },
    data: { status, isVerified },
  });

  await prisma.auditLog.create({
    data: {
      userId: session.user.id as string,
      action: "MATERIAL_VENDOR_STATUS_UPDATED",
      entity: "MaterialVendor",
      entityId: id,
      meta: { status },
    },
  });

  const vendorWithUser = await db.materialVendor.findUnique({
    where: { id },
    include: { user: { select: { email: true } } },
  });

  if (vendorWithUser?.user?.email) {
    if (parsed.data.status === "APPROVED") {
      sendEmail({
        to: vendorWithUser.user.email,
        subject: "Your vendor account is approved — RealX World",
        html: vendorApprovedEmail(vendorWithUser.businessName),
      }).catch(console.error);
    } else if (parsed.data.status === "REJECTED") {
      sendEmail({
        to: vendorWithUser.user.email,
        subject: "Update on your vendor application — RealX World",
        html: vendorRejectedEmail(vendorWithUser.businessName),
      }).catch(console.error);
    }
  }

  return NextResponse.json(updated);
}
