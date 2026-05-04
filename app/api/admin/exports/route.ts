import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";
import { rateLimitByIP } from "@/lib/rateLimit";
import { generateExport } from "@/lib/jobs/exportJob";

const exportSchema = z.object({
  type: z.enum(["LISTINGS_CSV", "LISTINGS_EXCEL", "USERS_CSV"]),
});

export async function GET(_request: NextRequest) {
  const session = await requireRole(["ADMIN"]);
  if (session instanceof NextResponse) return session;

  const userId = session.user!.id as string;

  const exports = await prisma.export.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 10,
    select: {
      id: true,
      type: true,
      status: true,
      fileUrl: true,
      createdAt: true,
      completedAt: true,
    },
  });

  return NextResponse.json({ exports });
}

export async function POST(request: NextRequest) {
  const session = await requireRole(["ADMIN"]);
  if (session instanceof NextResponse) return session;

  const adminId = session.user!.id as string;
  const rateLimit = await rateLimitByIP(`export:${adminId}`, 3, "1 h");

  if (!rateLimit.success) {
    return NextResponse.json({ error: "Export limit reached. Max 3 per hour." }, { status: 429 });
  }

  const body = await request.json();
  const parsed = exportSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues }, { status: 400 });
  }

  const record = await prisma.export.create({
    data: {
      userId: adminId,
      type: parsed.data.type,
      status: "PENDING",
    },
  });

  // Fire-and-forget: do not await
  generateExport(record.id, parsed.data.type, adminId);

  return NextResponse.json({ exportId: record.id, status: "PENDING" }, { status: 202 });
}
