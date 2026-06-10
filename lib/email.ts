import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) {
  return resend.emails.send({
    from: "RealX World <no-reply@realxworld.net>",
    to,
    subject,
    html,
  });
}

export function verificationEmail(verifyUrl: string): string {
  return `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#F9F8F4;padding:40px 24px;">
      <div style="background:#0A0A0A;padding:24px;text-align:center;border-radius:8px 8px 0 0;">
        <h1 style="color:#D4AF37;margin:0;font-size:24px;">RealX World</h1>
      </div>
      <div style="background:#ffffff;padding:32px 24px;border-radius:0 0 8px 8px;border:1px solid #e5e7eb;">
        <h2 style="color:#0A0A0A;margin-bottom:16px;">Verify Your Email Address</h2>
        <p style="color:#374151;line-height:1.6;">
          Thank you for registering on RealX World. Please click the button
          below to verify your email address. This link expires in 24 hours.
        </p>
        <div style="text-align:center;margin:32px 0;">
          <a href="${verifyUrl}"
             style="background:#D4AF37;color:#0A0A0A;padding:14px 32px;
                    border-radius:6px;font-weight:700;text-decoration:none;
                    font-size:16px;display:inline-block;">
            Verify Email Address
          </a>
        </div>
        <p style="color:#6b7280;font-size:13px;">
          If you did not create an account on RealX World,
          you can safely ignore this email.
        </p>
        <p style="color:#6b7280;font-size:13px;">
          Or copy this link: ${verifyUrl}
        </p>
      </div>
    </div>
  `;
}

export function welcomeEmail(name: string, role: string): string {
  const roleDisplay = {
    BUYER: "Property Buyer",
    SELLER: "Property Seller",
    AGENT: "Real Estate Agent",
    ADMIN: "Administrator",
  }[role] ?? role;

  const roleMessage =
    {
      BUYER:
        "You can now browse thousands of verified property listings across Nigeria, save your favourites, and connect with trusted agents and sellers.",
      SELLER:
        "You can now list your properties for sale or rent, manage your listings, and connect with serious buyers across Nigeria.",
      AGENT:
        "You can now list properties on behalf of your clients, manage multiple listings, and grow your real estate business on RealX World.",
      ADMIN: "You have full administrative access to the RealX World platform.",
    }[role] ?? "";

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to RealX World</title>
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

          <!-- Welcome Banner -->
          <tr>
            <td style="background-color:#D4AF37;padding:20px 40px;text-align:center;">
              <p style="margin:0;color:#0A0A0A;font-size:14px;font-weight:700;letter-spacing:2px;text-transform:uppercase;">
                Welcome to RealX World
              </p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="background-color:#ffffff;padding:40px;">

              <h2 style="margin:0 0 16px 0;color:#0A0A0A;font-size:24px;font-weight:700;">
                Hello, ${name}! 👋
              </h2>

              <p style="margin:0 0 24px 0;color:#4A5568;font-size:16px;line-height:1.7;">
                Your account has been successfully created on <strong>RealX World</strong> — Nigeria's premier real estate exchange platform.
              </p>

              <!-- Role Badge -->
              <table cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
                <tr>
                  <td style="background-color:#0A0A0A;color:#D4AF37;padding:8px 20px;border-radius:50px;font-size:13px;font-weight:700;letter-spacing:1px;text-transform:uppercase;">
                    ${roleDisplay}
                  </td>
                </tr>
              </table>

              <p style="margin:0 0 32px 0;color:#4A5568;font-size:16px;line-height:1.7;">
                ${roleMessage}
              </p>

              <!-- Divider -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:32px;">
                <tr>
                  <td style="border-top:2px solid #D4AF37;"></td>
                </tr>
              </table>

              <!-- Account Details -->
              <h3 style="margin:0 0 16px 0;color:#0A0A0A;font-size:16px;font-weight:700;">
                Your Account Details
              </h3>
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:32px;background-color:#F9F8F4;border-radius:8px;">
                <tr>
                  <td style="padding:16px 20px;border-bottom:1px solid #E5E1D8;">
                    <span style="color:#6B7280;font-size:13px;">Name</span><br>
                    <span style="color:#0A0A0A;font-size:15px;font-weight:600;">${name}</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding:16px 20px;">
                    <span style="color:#6B7280;font-size:13px;">Account Type</span><br>
                    <span style="color:#0A0A0A;font-size:15px;font-weight:600;">${roleDisplay}</span>
                  </td>
                </tr>
              </table>

              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:32px;">
                <tr>
                  <td align="center">
                    <a href="https://www.realxworld.net/dashboard"
                       style="display:inline-block;background-color:#D4AF37;color:#0A0A0A;padding:16px 40px;border-radius:8px;font-size:16px;font-weight:700;text-decoration:none;letter-spacing:0.5px;">
                      Go to My Dashboard →
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin:0;color:#6B7280;font-size:14px;line-height:1.6;">
                If you have any questions or need help getting started, reply to this email or contact us at
                <a href="mailto:support@realxworld.net" style="color:#D4AF37;text-decoration:none;">support@realxworld.net</a>
              </p>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color:#0A0A0A;padding:24px 40px;text-align:center;border-radius:0 0 12px 12px;">
              <p style="margin:0 0 8px 0;color:#D4AF37;font-size:13px;font-weight:700;letter-spacing:1px;">
                REALX WORLD
              </p>
              <p style="margin:0 0 8px 0;color:#6B7280;font-size:12px;">
                Nigeria's Limitless Real Estate Exchange
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
