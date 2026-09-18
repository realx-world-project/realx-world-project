import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const record = await prisma.export.findUnique({
    where: { id: params.id },
    select: {
      id: true,
      type: true,
      status: true,
      fileUrl: true,
      fileSize: true,
      createdAt: true,
      completedAt: true,
    },
  });

  if (!record) {
    return NextResponse.json({ error: "Export not found" }, { status: 404 });
  }

  return NextResponse.json(record);
}
