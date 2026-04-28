import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await requireRole(["ADMIN"]);

  if (session instanceof NextResponse) {
    return session;
  }

  const record = await prisma.export.findUnique({
    where: { id: params.id },
    select: {
      id: true,
      type: true,
      status: true,
      fileUrl: true,
      createdAt: true,
      completedAt: true,
    },
  });

  if (!record) {
    return NextResponse.json({ error: "Export not found" }, { status: 404 });
  }

  return NextResponse.json(record);
}
