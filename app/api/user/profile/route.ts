import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

const updateProfileSchema = z.object({
  name: z.string().min(2),
  phone: z.string(),
});

export async function GET(_request: NextRequest) {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id as string },
    select: {
      name: true,
      phone: true,
      email: true,
      role: true,
      createdAt: true,
      isVerified: true,
    },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json({
    name: user.name ?? "",
    phone: user.phone ?? "",
    email: user.email,
    role: user.role,
    createdAt: user.createdAt.toISOString(),
    isVerified: user.isVerified,
  });
}

export async function PATCH(request: NextRequest) {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = updateProfileSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues }, { status: 400 });
  }

  console.log("[profile PATCH] session.user.id:", session.user.id, "type:", typeof session.user.id);
  const user = await prisma.user.update({
    where: { id: session.user.id as string },
    data: {
      name: parsed.data.name,
      phone: parsed.data.phone,
    },
  });

  await prisma.auditLog.create({
    data: {
      userId: session.user.id as string,
      action: "PROFILE_UPDATED",
      entity: "User",
      entityId: session.user.id as string,
      meta: {},
    },
  });

  return NextResponse.json({
    id: user.id,
    name: user.name,
    phone: user.phone,
  });
}
