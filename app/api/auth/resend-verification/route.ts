import { NextResponse } from "next/server";
import crypto from "crypto";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendEmail, verificationEmail } from "@/lib/email";

export async function POST() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  if (user.isVerified) {
    return NextResponse.json({ error: "Already verified" }, { status: 400 });
  }

  const token = crypto.randomBytes(32).toString("hex");
  const expiry = new Date(Date.now() + 24 * 60 * 60 * 1000);

  await prisma.user.update({
    where: { id: user.id },
    data: { emailVerifyToken: token, emailVerifyExpiry: expiry },
  });

  const verifyUrl = `${process.env.NEXTAUTH_URL}/verify-email?token=${token}`;

  sendEmail({
    to: user.email,
    subject: "Verify your RealX World email address",
    html: verificationEmail(verifyUrl),
  }).catch(console.error);

  return NextResponse.json({ message: "Verification email sent" });
}
