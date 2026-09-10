import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const db: any = prisma;
  const user = await db.user.findUnique({
    where: { id: session.user.id as string },
    select: { kycStatus: true },
  });

  return NextResponse.json({ kycStatus: user?.kycStatus ?? "NOT_SUBMITTED" });
}
