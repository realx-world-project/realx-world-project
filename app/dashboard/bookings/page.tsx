import { Metadata } from "next";
import { redirect } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatNGN, formatBookingDay, bookingStatusColors } from "@/lib/bookings";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { GuestBookingCancel } from "@/components/bookings/GuestBookingCancel";

export const metadata: Metadata = {
  title: "My Bookings | RealX World",
  description: "Your short-term rental booking requests",
};

export default async function GuestBookingsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const bookings = await prisma.booking.findMany({
    where: { guestId: session.user.id as string },
    include: {
      listing: {
        select: {
          id: true,
          title: true,
          images: { where: { isPrimary: true }, take: 1, select: { url: true } },
          location: { select: { city: true, state: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">My Bookings</h1>
        <p className="text-muted-foreground text-sm mt-1">Your short-term rental booking requests</p>
      </div>

      {bookings.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">You haven&apos;t made any booking requests yet.</p>
            <Link href="/listings">
              <Button className="mt-4" variant="outline">Browse listings</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => {
            const img = booking.listing.images[0]?.url;
            const loc = booking.listing.location;
            return (
              <Card key={booking.id} className="overflow-hidden">
                <div className="flex gap-4 p-4">
                  {img && (
                    <Image
                      src={img}
                      alt={booking.listing.title}
                      width={96}
                      height={96}
                      className="h-24 w-24 rounded-lg object-cover flex-shrink-0"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <Link
                        href={`/listings/${booking.listing.id}`}
                        className="font-semibold hover:underline truncate"
                      >
                        {booking.listing.title}
                      </Link>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${bookingStatusColors[booking.status] ?? ""}`}
                      >
                        {booking.status}
                      </span>
                    </div>

                    <p className="text-sm text-muted-foreground mt-0.5">
                      {loc.city}, {loc.state}
                    </p>

                    <div className="mt-2 text-sm space-y-0.5">
                      <p>
                        <span className="text-muted-foreground">Check-in: </span>
                        {formatBookingDay(booking.checkIn)}
                      </p>
                      <p>
                        <span className="text-muted-foreground">Check-out: </span>
                        {formatBookingDay(booking.checkOut)}
                      </p>
                      <p>
                        <span className="text-muted-foreground">Duration: </span>
                        {booking.nights} night{booking.nights !== 1 ? "s" : ""}
                      </p>
                      <p className="font-medium">{formatNGN(booking.totalPrice)}</p>
                    </div>

                    {booking.guestNote && (
                      <p className="mt-2 text-xs text-muted-foreground italic">
                        Your note: {booking.guestNote}
                      </p>
                    )}
                    {booking.hostNote && (
                      <p className="mt-1 text-xs text-muted-foreground italic">
                        Host note: {booking.hostNote}
                      </p>
                    )}

                    {(booking.status === "PENDING" || booking.status === "CONFIRMED") && (
                      <GuestBookingCancel bookingId={booking.id} />
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
