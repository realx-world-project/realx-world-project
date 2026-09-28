import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { sendEmail, professionalApprovedEmail, professionalRejectedEmail } from "@/lib/email";
import { sendSmsAsync } from "@/lib/sms";
import { smsTemplates } from "@/lib/sms-templates";

const bodySchema = z.object({ status: z.enum(["APPROVED", "REJECTED", "SUSPENDED"]) });

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== "ADMIN") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = params;
  const body = await request.json();
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues }, { status: 400 });

  const status = parsed.data.status;
  const isVerified = status === "APPROVED";
  const db: any = prisma;

  const updated = await db.professional.update({ where: { id }, data: { status, isVerified } });

  await prisma.auditLog.create({
    data: {
      userId: session.user.id as string,
      action: "PROFESSIONAL_STATUS_UPDATED",
      entity: "Professional",
      entityId: id,
      meta: { status },
    },
  });

  const prof = await db.professional.findUnique({
    where: { id },
    include: { user: { select: { email: true, name: true, phone: true } } },
  });

  if (prof?.user?.email) {
    if (status === "APPROVED") {
      sendEmail({
        to: prof.user.email,
        subject: "Your professional profile is approved — RealX World",
        html: professionalApprovedEmail(prof.user.name ?? ""),
      }).catch(console.error);
    } else if (status === "REJECTED") {
      sendEmail({
        to: prof.user.email,
        subject: "Update on your professional profile — RealX World",
        html: professionalRejectedEmail(prof.user.name ?? ""),
      }).catch(console.error);
    }
  }

  if (prof?.user?.phone) {
    if (status === "APPROVED") {
      sendSmsAsync({ to: prof.user.phone, message: smsTemplates.professionalApproved(prof.user.name ?? "") });
    } else if (status === "REJECTED") {
      sendSmsAsync({ to: prof.user.phone, message: smsTemplates.professionalRejected(prof.user.name ?? "") });
    }
  }

  return NextResponse.json(updated);
}
