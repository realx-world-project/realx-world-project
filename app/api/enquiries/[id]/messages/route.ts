import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { sendEmail } from "@/lib/email";

const bodySchema = z.object({
  message: z.string().min(1).max(2000),
});

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = session.user.id as string;
  const body = await request.json();
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }

  const db: any = prisma;

  const enquiry = await db.enquiry.findUnique({
    where: { id: params.id },
    include: {
      listing: { select: { id: true, title: true, userId: true, user: { select: { email: true } } } },
      buyer: { select: { id: true, name: true, email: true } },
    },
  });

  if (!enquiry) return NextResponse.json({ error: "Enquiry not found" }, { status: 404 });

  const isBuyer = enquiry.buyerId === userId;
  const isSeller = enquiry.listing.userId === userId;

  if (!isBuyer && !isSeller) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { message } = parsed.data;

  const created = await db.enquiryMessage.create({
    data: { enquiryId: enquiry.id, senderId: userId, message },
    include: { sender: { select: { id: true, name: true, role: true } } },
  });

  const base = process.env.NEXTAUTH_URL ?? "https://www.realxworld.net";
  const ctaUrl = `${base}/dashboard/enquiries/${enquiry.id}`;

  if (isBuyer) {
    await db.enquiry.update({ where: { id: enquiry.id }, data: { isReadBySeller: false } });

    if (enquiry.listing.user?.email) {
      sendEmail({
        to: enquiry.listing.user.email,
        subject: "New message on your listing enquiry — RealX World",
        html: `
          <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#F9F8F4;padding:40px 24px;">
            <div style="background:#0A0A0A;padding:24px;text-align:center;border-radius:8px 8px 0 0;">
              <h1 style="color:#D4AF37;margin:0;font-size:24px;">RealX World</h1>
            </div>
            <div style="background:#ffffff;padding:32px 24px;border-radius:0 0 8px 8px;border:1px solid #e5e7eb;">
              <h2 style="color:#0A0A0A;margin-bottom:16px;">New Message</h2>
              <p style="color:#374151;line-height:1.6;">
                You have a new message on your listing '<strong>${enquiry.listing.title}</strong>'.
              </p>
              <div style="text-align:center;margin:32px 0;">
                <a href="${ctaUrl}" style="background:#D4AF37;color:#0A0A0A;padding:14px 32px;border-radius:6px;font-weight:700;text-decoration:none;font-size:16px;display:inline-block;">
                  View Enquiry
                </a>
              </div>
            </div>
          </div>
        `,
      }).catch((err) => console.error("[messages POST] email failed:", err));
    }
  } else {
    await db.enquiry.update({
      where: { id: enquiry.id },
      data: { isReadByBuyer: false, sellerReply: message, repliedAt: new Date() },
    });

    if (enquiry.buyer?.email) {
      sendEmail({
        to: enquiry.buyer.email,
        subject: "The seller has replied to your enquiry — RealX World",
        html: `
          <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#F9F8F4;padding:40px 24px;">
            <div style="background:#0A0A0A;padding:24px;text-align:center;border-radius:8px 8px 0 0;">
              <h1 style="color:#D4AF37;margin:0;font-size:24px;">RealX World</h1>
            </div>
            <div style="background:#ffffff;padding:32px 24px;border-radius:0 0 8px 8px;border:1px solid #e5e7eb;">
              <h2 style="color:#0A0A0A;margin-bottom:16px;">Seller Replied</h2>
              <p style="color:#374151;line-height:1.6;">
                The seller has replied to your enquiry about '<strong>${enquiry.listing.title}</strong>'.
              </p>
              <div style="text-align:center;margin:32px 0;">
                <a href="${ctaUrl}" style="background:#D4AF37;color:#0A0A0A;padding:14px 32px;border-radius:6px;font-weight:700;text-decoration:none;font-size:16px;display:inline-block;">
                  View Enquiry
                </a>
              </div>
            </div>
          </div>
        `,
      }).catch((err) => console.error("[messages POST] email failed:", err));
    }
  }

  return NextResponse.json(created);
}
