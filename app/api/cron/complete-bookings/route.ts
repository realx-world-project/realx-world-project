import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Called by Vercel Cron daily. Marks bookings whose check-out date has
// passed and are still CONFIRMED as COMPLETED.
export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  // Without this guard, a missing env var would accept "Bearer undefined"
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();

  const { count } = await prisma.booking.updateMany({
    where: {
      status: "CONFIRMED",
      checkOut: { lte: now },
    },
    data: { status: "COMPLETED" },
  });

  return NextResponse.json({ completed: count, at: now.toISOString() });
}
