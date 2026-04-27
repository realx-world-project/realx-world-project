import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { compare, hash } from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";

const changePasswordSchema = z.object({
  currentPassword: z.string(),
  newPassword: z.string().min(8),
  confirmNewPassword: z.string(),
}).refine(data => data.newPassword === data.confirmNewPassword, {
  message: "Passwords do not match",
  path: ["confirmNewPassword"],
});

export async function POST(request: NextRequest) {
  const session = await requireRole(["ADMIN", "AGENT", "SELLER", "BUYER"]);

  if (session instanceof NextResponse) {
    return session;
  }

  const body = await request.json();
  const parsed = changePasswordSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user!.id },
  });

  if (!user || !user.passwordHash) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const isCurrentValid = await compare(parsed.data.currentPassword, user.passwordHash);
  if (!isCurrentValid) {
    return NextResponse.json({ error: "Current password is incorrect" }, { status: 400 });
  }

  const newPasswordHash = await hash(parsed.data.newPassword, 12);

  await prisma.user.update({
    where: { id: session.user!.id },
    data: { passwordHash: newPasswordHash },
  });

  await prisma.auditLog.create({
    data: {
      userId: session.user!.id as string,
      action: "PASSWORD_CHANGED",
      entity: "User",
      entityId: session.user!.id as string,
      meta: {},
    },
  });

  return NextResponse.json({ message: "Password updated successfully" }, { status: 200 });
}