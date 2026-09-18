import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = session.user.id as string;
  const db: any = prisma;

  const enquiry = await db.enquiry.findUnique({
    where: { id: params.id },
    include: {
      listing: {
        select: {
          id: true,
          title: true,
          userId: true,
          images: { where: { isPrimary: true }, take: 1, select: { url: true } },
        },
      },
      buyer: { select: { id: true, name: true, email: true } },
      messages: {
        orderBy: { createdAt: "asc" },
        include: { sender: { select: { id: true, name: true, role: true } } },
      },
    },
  });

  if (!enquiry) return NextResponse.json({ error: "Enquiry not found" }, { status: 404 });

  const isBuyer = enquiry.buyerId === userId;
  const isSeller = enquiry.listing.userId === userId;

  if (!isBuyer && !isSeller) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await db.enquiryMessage.updateMany({
    where: { enquiryId: enquiry.id, senderId: { not: userId }, isRead: false },
    data: { isRead: true },
  });

  await db.enquiry.update({
    where: { id: enquiry.id },
    data: isSeller ? { isReadBySeller: true } : { isReadByBuyer: true },
  });

  return NextResponse.json(enquiry);
}
