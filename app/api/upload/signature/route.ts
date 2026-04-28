import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import { requireRole } from "@/lib/session";
import { rateLimitByIP } from "@/lib/rateLimit";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request: NextRequest) {
  const session = await requireRole(["SELLER", "AGENT", "ADMIN"]);

  if (session instanceof NextResponse) {
    return session;
  }

  const userId = session.user!.id as string;
  const rateLimit = await rateLimitByIP(`upload:${userId}`, 20, "1 h");

  if (!rateLimit.success) {
    return NextResponse.json({ error: "Upload limit reached" }, { status: 429 });
  }

  const folder = `realxworld/listings/${userId}`;
  const timestamp = Math.round(Date.now() / 1000);

  const signature = cloudinary.utils.api_sign_request(
    { folder, timestamp },
    process.env.CLOUDINARY_API_SECRET as string
  );

  return NextResponse.json({
    signature,
    timestamp,
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    folder,
  });
}
