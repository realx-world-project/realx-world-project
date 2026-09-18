import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { sendEmail } from "@/lib/email";

const bodySchema = z.object({
  listingId: z.string().min(1),
  message: z.string().min(20, "Message must be at least 20 characters"),
});

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = session.user.id as string;
  const role = (session.user as any).role;
  const db: any = prisma;

  const where =
    role === "SELLER"
      ? { listing: { userId } }
      : { buyerId: userId };

  const enquiries = await db.enquiry.findMany({
    where,
    include: {
      listing: { select: { id: true, title: true, userId: true } },
      buyer: { select: { id: true, name: true, email: true } },
      messages: { orderBy: { createdAt: "asc" } },
    },
  });

  const withUnread = enquiries.map((e: any) => {
    const isSeller = e.listing.userId === userId;
    const unread = isSeller ? !e.isReadBySeller : !e.isReadByBuyer;
    const lastMessage = e.messages[e.messages.length - 1] ?? null;
    return { ...e, unread, lastMessageAt: lastMessage?.createdAt ?? e.createdAt };
  });

  withUnread.sort(
    (a: any, b: any) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime()
  );

  return NextResponse.json(withUnread);
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = session.user.id as string;
  const body = await request.json();
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }

  const { listingId, message } = parsed.data;
  const db: any = prisma;

  const listing = await db.listing.findUnique({
    where: { id: listingId },
    select: { id: true, title: true, status: true, userId: true, user: { select: { email: true, name: true } } },
  });

  if (!listing || listing.status !== "PUBLISHED") {
    return NextResponse.json({ error: "Listing not found" }, { status: 404 });
  }

  if (listing.userId === userId) {
    return NextResponse.json({ error: "You cannot enquire about your own listing" }, { status: 400 });
  }

  const existing = await db.enquiry.findFirst({
    where: { buyerId: userId, listingId },
  });

  if (existing) {
    return NextResponse.json(
      { error: "You already have an enquiry for this listing", enquiryId: existing.id },
      { status: 409 }
    );
  }

  const enquiry = await db.enquiry.create({
    data: {
      buyerId: userId,
      listingId,
      message,
      isPaid: true,
    },
  });

  await db.enquiryMessage.create({
    data: {
      enquiryId: enquiry.id,
      senderId: userId,
      message,
    },
  });

  if (listing.user?.email) {
    const buyerName = session.user.name ?? "A buyer";
    const base = process.env.NEXTAUTH_URL ?? "https://www.realxworld.net";
    sendEmail({
      to: listing.user.email,
      subject: "New enquiry on your listing — RealX World",
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#F9F8F4;padding:40px 24px;">
          <div style="background:#0A0A0A;padding:24px;text-align:center;border-radius:8px 8px 0 0;">
            <h1 style="color:#D4AF37;margin:0;font-size:24px;">RealX World</h1>
          </div>
          <div style="background:#ffffff;padding:32px 24px;border-radius:0 0 8px 8px;border:1px solid #e5e7eb;">
            <h2 style="color:#0A0A0A;margin-bottom:16px;">New Enquiry Received</h2>
            <p style="color:#374151;line-height:1.6;">
              ${buyerName} has sent an enquiry about your listing '<strong>${listing.title}</strong>'. Log in to view and reply.
            </p>
            <div style="text-align:center;margin:32px 0;">
              <a href="${base}/dashboard/enquiries/${enquiry.id}"
                 style="background:#D4AF37;color:#0A0A0A;padding:14px 32px;border-radius:6px;font-weight:700;text-decoration:none;font-size:16px;display:inline-block;">
                View Enquiry
              </a>
            </div>
          </div>
        </div>
      `,
    }).catch((err) => console.error("[enquiries POST] email failed:", err));
  }

  return NextResponse.json({ id: enquiry.id, enquiryId: enquiry.id });
}
