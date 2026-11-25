import { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatNGN, formatBookingDay, bookingStatusColors } from "@/lib/bookings";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { HostBookingActions } from "@/components/bookings/HostBookingActions";

export const metadata: Metadata = {
  title: "Booking Requests | RealX World",
  description: "Manage booking requests for your listings",
};

export default async function HostBookingsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const role = session.user.role;
  if (role !== "SELLER" && role !== "ADMIN") redirect("/dashboard");

  const bookings = await prisma.booking.findMany({
    where: { listing: { userId: session.user.id as string } },
    include: {
      listing: { select: { id: true, title: true } },
      guest: { select: { id: true, name: true, email: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Booking Requests</h1>
        <p className="text-muted-foreground text-sm mt-1">Manage booking requests for your listings</p>
      </div>

      {bookings.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">No booking requests yet.</p>
            <Link href="/dashboard/listings">
              <Button className="mt-4" variant="outline">View my listings</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => (
            <Card key={booking.id} className="overflow-hidden">
              <div className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <Link
                      href={`/listings/${booking.listing.id}`}
                      className="font-semibold hover:underline"
                    >
                      {booking.listing.title}
                    </Link>
                    <p className="text-sm text-muted-foreground mt-0.5 break-words">
                      Guest: {booking.guest.name ?? booking.guest.email}
                    </p>
                  </div>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${bookingStatusColors[booking.status] ?? ""}`}
                  >
                    {booking.status}
                  </span>
                </div>

                <div className="text-sm grid grid-cols-2 gap-x-4 gap-y-1">
                  <p><span className="text-muted-foreground">Check-in: </span>{formatBookingDay(booking.checkIn)}</p>
                  <p><span className="text-muted-foreground">Check-out: </span>{formatBookingDay(booking.checkOut)}</p>
                  <p><span className="text-muted-foreground">Nights: </span>{booking.nights}</p>
                  <p className="font-medium">{formatNGN(booking.totalPrice)}</p>
                </div>

                {booking.guestNote && (
                  <p className="text-xs text-muted-foreground italic border-l-2 pl-2">
                    Guest note: {booking.guestNote}
                  </p>
                )}

                {booking.hostNote && (
                  <p className="text-xs text-muted-foreground italic">
                    Your note: {booking.hostNote}
                  </p>
                )}

                {(booking.status === "PENDING" || booking.status === "CONFIRMED") && (
                  <HostBookingActions bookingId={booking.id} status={booking.status} />
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
