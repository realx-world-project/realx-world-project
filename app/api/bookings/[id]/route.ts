import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const patchSchema = z.object({
  action: z.enum(["CONFIRM", "CANCEL"]),
  hostNote: z.string().max(1000).optional(),
});

const TRANSITIONS = {
  CONFIRM: { from: ["PENDING"], to: "CONFIRMED", audit: "BOOKING_CONFIRMED" },
  CANCEL: { from: ["PENDING", "CONFIRMED"], to: "CANCELLED", audit: "BOOKING_CANCELLED" },
} as const;

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = session.user.id as string;

  const body = await req.json();
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues }, { status: 400 });

  const { action, hostNote } = parsed.data;

  const booking = await prisma.booking.findUnique({
    where: { id: params.id },
    include: { listing: { select: { userId: true } } },
  });

  if (!booking) return NextResponse.json({ error: "Booking not found" }, { status: 404 });

  const isHost = booking.listing.userId === userId;
  const isGuest = booking.guestId === userId;

  if (!isHost && !isGuest) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  if (action === "CONFIRM" && !isHost) {
    return NextResponse.json({ error: "Only the host can confirm a booking" }, { status: 403 });
  }
  if (hostNote !== undefined && !isHost) {
    return NextResponse.json({ error: "Only the host can add a host note" }, { status: 403 });
  }

  const transition = TRANSITIONS[action];

  // Conditional update: only applies if the status hasn't changed since we read it,
  // so a guest cancelling and a host confirming at the same time can't both win.
  const updated = await prisma.$transaction(async (tx) => {
    const { count } = await tx.booking.updateMany({
      where: { id: booking.id, status: { in: [...transition.from] } },
      data: {
        status: transition.to,
        cancelledBy: action === "CANCEL" ? userId : null,
        ...(hostNote !== undefined && { hostNote }),
      },
    });
    if (count === 0) return null;

    await tx.auditLog.create({
      data: {
        userId,
        action: transition.audit,
        entity: "Booking",
        entityId: booking.id,
        meta: { from: booking.status, to: transition.to },
      },
    });

    return tx.booking.findUnique({ where: { id: booking.id } });
  });

  if (!updated) {
    return NextResponse.json(
      { error: `Booking cannot be ${action === "CONFIRM" ? "confirmed" : "cancelled"} from its current status` },
      { status: 409 }
    );
  }

  return NextResponse.json(updated);
}
