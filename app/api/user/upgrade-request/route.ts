import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { sendEmail } from "@/lib/email";

const bodySchema = z.object({
  reason: z.string().min(50, "Please provide at least 50 characters"),
});

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const db: any = prisma;
  const request = await db.roleUpgradeRequest.findUnique({
    where: { userId: session.user.id as string },
  });

  return NextResponse.json(request ?? null);
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const role = (session.user as any).role;
  if (role !== "BUYER") {
    return NextResponse.json({ error: "You are already a Seller or Admin" }, { status: 400 });
  }

  const userId = session.user.id as string;
  const db: any = prisma;

  const existing = await db.roleUpgradeRequest.findUnique({ where: { userId } });
  if (existing?.status === "PENDING") {
    return NextResponse.json({ error: "You already have a pending upgrade request" }, { status: 400 });
  }

  const body = await request.json();
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid submission" }, { status: 400 });

  const upgradeRequest = await db.roleUpgradeRequest.upsert({
    where: { userId },
    create: {
      userId,
      fromRole: "BUYER",
      toRole: "SELLER",
      reason: parsed.data.reason,
      status: "PENDING",
    },
    update: {
      fromRole: "BUYER",
      toRole: "SELLER",
      reason: parsed.data.reason,
      status: "PENDING",
      adminNote: null,
    },
  });

  sendEmail({
    to: "info@realxworld.net",
    subject: `New Role Upgrade Request — ${session.user.email}`,
    html: `
      <h2>New Seller Upgrade Request</h2>
      <p><strong>Name:</strong> ${session.user.name ?? "Not provided"}</p>
      <p><strong>Email:</strong> ${session.user.email}</p>
      <h3>Reason:</h3>
      <p>${parsed.data.reason}</p>
    `,
  }).catch(console.error);

  return NextResponse.json({ success: true, request: upgradeRequest });
}
