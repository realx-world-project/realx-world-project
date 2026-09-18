import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = session.user.id as string;
  const db: any = prisma;

  const search = await db.savedSearch.findUnique({ where: { id: params.id } });
  if (!search || search.userId !== userId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await db.savedSearch.delete({ where: { id: params.id } });

  return NextResponse.json({ success: true });
}
