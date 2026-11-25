import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const createSchema = z.object({
  listingId: z.string().min(1),
  checkIn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  checkOut: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  guestNote: z.string().max(1000).optional(),
});

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = session.user.id as string;
  const role = session.user.role;
  const { searchParams } = new URL(req.url);
  const view = searchParams.get("view"); // "guest" | "host"

  // Sellers default to the host view but can still request their own trips with ?view=guest
  if (view === "host" || (view !== "guest" && role === "SELLER")) {
    const bookings = await prisma.booking.findMany({
      where: { listing: { userId } },
      include: {
        listing: { select: { id: true, title: true } },
        guest: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(bookings);
  }

  const bookings = await prisma.booking.findMany({
    where: { guestId: userId },
    include: {
      listing: { select: { id: true, title: true } },
    },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(bookings);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const guestId = session.user.id as string;
  const body = await req.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues }, { status: 400 });

  const { listingId, checkIn, checkOut, guestNote } = parsed.data;

  const listing = await prisma.listing.findUnique({
    where: { id: listingId },
    select: { id: true, userId: true, type: true, price: true, status: true },
  });

  if (!listing || listing.status !== "PUBLISHED") {
    return NextResponse.json({ error: "Listing not found" }, { status: 404 });
  }
  if (listing.type !== "SHORT_TERM") {
    return NextResponse.json({ error: "This listing does not accept bookings" }, { status: 400 });
  }
  if (listing.userId === guestId) {
    return NextResponse.json({ error: "You cannot book your own listing" }, { status: 400 });
  }

  // YYYY-MM-DD parses as UTC midnight, matching the @db.Date values in blocked_dates
  const checkInDate = new Date(checkIn);
  const checkOutDate = new Date(checkOut);
  const today = new Date(new Date().toISOString().slice(0, 10));

  if (isNaN(checkInDate.getTime()) || isNaN(checkOutDate.getTime())) {
    return NextResponse.json({ error: "Invalid dates" }, { status: 400 });
  }
  if (checkInDate < today) {
    return NextResponse.json({ error: "Check-in cannot be in the past" }, { status: 400 });
  }
  if (checkInDate >= checkOutDate) {
    return NextResponse.json({ error: "Check-out must be after check-in" }, { status: 400 });
  }

  const nights = Math.round(
    (checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  // Conflict check and insert run in one serializable transaction so two
  // concurrent requests can't both book the same dates.
  let booking;
  try {
    booking = await prisma.$transaction(
      async (tx) => {
        const [conflict, blocked] = await Promise.all([
          tx.booking.findFirst({
            where: {
              listingId,
              status: { in: ["PENDING", "CONFIRMED"] },
              checkIn: { lt: checkOutDate },
              checkOut: { gt: checkInDate },
            },
            select: { id: true },
          }),
          tx.blockedDate.findFirst({
            where: { listingId, date: { gte: checkInDate, lt: checkOutDate } },
            select: { id: true },
          }),
        ]);

        if (conflict || blocked) return null;

        const created = await tx.booking.create({
          data: {
            listingId,
            guestId,
            checkIn: checkInDate,
            checkOut: checkOutDate,
            nights,
            totalPrice: listing.price * nights,
            guestNote: guestNote ?? null,
            status: "PENDING",
          },
        });

        await tx.auditLog.create({
          data: {
            userId: guestId,
            action: "BOOKING_CREATED",
            entity: "Booking",
            entityId: created.id,
            meta: { listingId, checkIn, checkOut, nights },
          },
        });

        return created;
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable }
    );
  } catch (err) {
    // P2034: serialization failure — another booking for these dates won the race
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2034") {
      booking = null;
    } else {
      throw err;
    }
  }

  if (!booking) {
    return NextResponse.json({ error: "These dates are not available" }, { status: 409 });
  }

  return NextResponse.json(booking, { status: 201 });
}
