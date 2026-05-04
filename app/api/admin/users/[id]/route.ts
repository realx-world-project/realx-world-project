import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";

const userActionSchema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("SUSPEND") }),
  z.object({ action: z.literal("UNSUSPEND") }),
  z.object({
    action: z.literal("CHANGE_ROLE"),
    role: z.enum(["ADMIN", "AGENT", "SELLER", "BUYER"]),
  }),
]);

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await requireRole(["ADMIN"]);

  if (session instanceof NextResponse) {
    return session;
  }

  const body = await request.json();
  const parsed = userActionSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues }, { status: 400 });
  }

  const targetId = params.id;
  const adminId = session.user!.id as string;

  try {
    await prisma.$connect();

    const target = await prisma.user.findUnique({
      where: { id: targetId },
      select: { id: true },
    });

    if (!target) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { action } = parsed.data;

    let updateData: Record<string, unknown>;
    if (action === "SUSPEND") {
      updateData = { isActive: false };
    } else if (action === "UNSUSPEND") {
      updateData = { isActive: true };
    } else {
      updateData = { role: parsed.data.role };
    }

    const user = await prisma.$transaction(async (tx) => {
      const updated = await tx.user.update({
        where: { id: targetId },
        data: updateData,
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          role: true,
          isVerified: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      await tx.auditLog.create({
        data: {
          userId: adminId,
          action,
          entity: "User",
          entityId: targetId,
          meta: action === "CHANGE_ROLE" ? { role: parsed.data.role } : {},
        },
      });

      return updated;
    });

    return NextResponse.json(user);
  } catch (err) {
    console.error("[admin/users PATCH] error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
