import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { sendEmail, joinUsConfirmationEmail } from "@/lib/email";

const bodySchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  email: z.string().email("Enter a valid email address"),
  phone: z.string().min(1, "Phone number is required"),
  occupation: z.string().optional(),
  experience: z.union([z.string(), z.number()]).optional(),
  state: z.string().optional(),
  area: z.string().optional(),
  memberships: z.string().optional(),
  background: z.string().min(100, "Professional background must be at least 100 characters"),
  howHeard: z.string().optional(),
  consent: z.literal(true, {
    errorMap: () => ({ message: "Consent is required" }),
  }),
});

export async function POST(request: NextRequest) {
  const body = await request.json();
  const parsed = bodySchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid submission" }, { status: 400 });
  }

  const {
    fullName,
    email,
    phone,
    occupation,
    experience,
    state,
    area,
    memberships,
    background,
    howHeard,
  } = parsed.data;

  const adminHtml = `
    <h2>New Application from ${fullName}</h2>
    <p><strong>Email:</strong> ${email}</p>
    <p><strong>Phone:</strong> ${phone}</p>
    <p><strong>Occupation:</strong> ${occupation ?? "Not provided"}</p>
    <p><strong>Experience:</strong> ${experience ?? "Not provided"} years</p>
    <p><strong>State:</strong> ${state ?? "Not provided"}</p>
    <p><strong>Area:</strong> ${area ?? "Not provided"}</p>
    <p><strong>Memberships:</strong> ${memberships || "Not provided"}</p>
    <p><strong>How they heard about us:</strong> ${howHeard ?? "Not provided"}</p>
    <h3>Professional Background:</h3>
    <p>${background}</p>
  `;

  try {
    await sendEmail({
      to: "info@realxworld.net",
      subject: `New Join Us Application — ${fullName}`,
      html: adminHtml,
    });

    sendEmail({
      to: email,
      subject: "We received your application — RealX World",
      html: joinUsConfirmationEmail(fullName),
    }).catch(console.error);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[join-us] error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
