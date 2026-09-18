import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = session.user.id as string;
  const role = (session.user as any).role;
  const db: any = prisma;

  const count =
    role === "SELLER"
      ? await db.enquiry.count({ where: { listing: { userId }, isReadBySeller: false } })
      : await db.enquiry.count({ where: { buyerId: userId, isReadByBuyer: false } });

  return NextResponse.json({ count });
}
