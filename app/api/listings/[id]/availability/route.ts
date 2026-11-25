import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const listingId = params.id;

  const [blockedDates, bookings] = await Promise.all([
    prisma.blockedDate.findMany({
      where: { listingId },
      select: { date: true },
    }),
    prisma.booking.findMany({
      where: {
        listingId,
        status: { in: ["PENDING", "CONFIRMED"] },
      },
      select: { checkIn: true, checkOut: true },
    }),
  ]);

  return NextResponse.json({
    blockedDates: blockedDates.map((d) => d.date),
    bookings,
  });
}
