import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";
import { rateLimitByIP } from "@/lib/rateLimit";

const schema = z.object({
  email: z.string().email(),
});

function passwordResetEmail(resetUrl: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset your RealX World password</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f4f4;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f4;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

          <!-- Header -->
          <tr>
            <td style="background-color:#0A0A0A;padding:32px 40px;text-align:center;border-radius:12px 12px 0 0;">
              <h1 style="margin:0;font-size:28px;font-weight:900;letter-spacing:2px;">
                <span style="color:#D4AF37;">REAL</span><span style="color:#ffffff;">X</span>
                <span style="color:#D4AF37;font-size:16px;font-weight:400;letter-spacing:1px;display:block;margin-top:4px;">...LIMITLESS REAL ESTATE EXCHANGE.</span>
              </h1>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="background-color:#ffffff;padding:40px;">
              <h2 style="margin:0 0 16px 0;color:#0A0A0A;font-size:22px;font-weight:700;">
                Password Reset Request
              </h2>
              <p style="margin:0 0 24px 0;color:#4A5568;font-size:16px;line-height:1.7;">
                You requested a password reset for your RealX World account. Click the button below to set a new password. This link expires in <strong>1 hour</strong>.
              </p>

              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:32px;">
                <tr>
                  <td align="center">
                    <a href="${resetUrl}"
                       style="display:inline-block;background-color:#D4AF37;color:#0A0A0A;padding:16px 40px;border-radius:8px;font-size:16px;font-weight:700;text-decoration:none;letter-spacing:0.5px;">
                      Reset Password
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin:0 0 16px 0;color:#6B7280;font-size:14px;line-height:1.6;">
                Or copy and paste this link into your browser:
              </p>
              <p style="margin:0 0 32px 0;word-break:break-all;">
                <a href="${resetUrl}" style="color:#D4AF37;font-size:13px;text-decoration:none;">${resetUrl}</a>
              </p>

              <!-- Divider -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
                <tr>
                  <td style="border-top:1px solid #E5E7EB;"></td>
                </tr>
              </table>

              <p style="margin:0;color:#9CA3AF;font-size:13px;line-height:1.6;">
                If you did not request this, please ignore this email. Your password will not be changed.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color:#0A0A0A;padding:24px 40px;text-align:center;border-radius:0 0 12px 12px;">
              <p style="margin:0 0 8px 0;color:#D4AF37;font-size:13px;font-weight:700;letter-spacing:1px;">
                REALX WORLD
              </p>
              <p style="margin:0;color:#4A5568;font-size:12px;">
                © 2025 RealX World. All rights reserved.
              </p>
              <p style="margin:8px 0 0 0;">
                <a href="https://www.realxworld.net" style="color:#D4AF37;font-size:12px;text-decoration:none;">www.realxworld.net</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const parsed = schema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid email" }, { status: 400 });
  }

  const { email } = parsed.data;

  // Rate limit per email — 3 requests per hour
  const rateLimit = await rateLimitByIP(`forgot-password:${email}`, 3, "1 h");
  if (!rateLimit.success) {
    // Still return 200 to not reveal rate-limit status to potential attackers
    return NextResponse.json({ message: "If an account exists for this email, you will receive a password reset link shortly." });
  }

  try {
    const user = await prisma.user.findUnique({ where: { email } });

    // Always return 200 — never reveal whether the email exists
    if (!user) {
      return NextResponse.json({ message: "If an account exists for this email, you will receive a password reset link shortly." });
    }

    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await prisma.passwordResetToken.create({
      data: { token, email, expiresAt },
    });

    const resetUrl = `https://www.realxworld.net/reset-password?token=${token}`;

    sendEmail({
      to: email,
      subject: "Reset your RealX World password",
      html: passwordResetEmail(resetUrl),
    }).catch(console.error);

    return NextResponse.json({ message: "If an account exists for this email, you will receive a password reset link shortly." });
  } catch (err) {
    console.error("[forgot-password] error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
