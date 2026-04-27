import { NextRequest, NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { registerSchema } from "@/lib/validations/auth";
import { rateLimitByIP } from "@/lib/rateLimit";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const parsed = registerSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues }, { status: 400 });
  }

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0] || request.headers.get("x-real-ip") || "unknown";
  const rateLimit = await rateLimitByIP(ip, 5, "1 h");

  if (!rateLimit.success) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const existingUser = await prisma.user.findUnique({
    where: { email: parsed.data.email },
  });

  if (existingUser) {
    return NextResponse.json({ error: "Email already registered" }, { status: 409 });
  }

  const passwordHash = await hash(parsed.data.password, 12);

  const user = await prisma.user.create({
    data: {
      name: parsed.data.name,
      email: parsed.data.email,
      phone: parsed.data.phone,
      passwordHash,
      role: parsed.data.role,
    },
  });

  await prisma.auditLog.create({
    data: {
      userId: user.id,
      action: "REGISTER",
      entity: "User",
      entityId: user.id,
      meta: {},
    },
  });

  return NextResponse.json({ id: user.id, email: user.email }, { status: 201 });
}