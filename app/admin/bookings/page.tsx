import { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatNGN, formatBookingDay, bookingStatusColors } from "@/lib/bookings";
import { Card, CardContent } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Bookings | RealX Admin",
  description: "All short-term rental bookings",
};

const STATUSES = ["PENDING", "CONFIRMED", "CANCELLED", "COMPLETED"] as const;
const PAGE_SIZE = 100;

export default async function AdminBookingsPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") redirect("/dashboard");

  const [bookings, stats] = await Promise.all([
    prisma.booking.findMany({
      include: {
        listing: { select: { id: true, title: true } },
        guest: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
      take: PAGE_SIZE,
    }),
    prisma.booking.groupBy({
      by: ["status"],
      _count: { id: true },
      _sum: { totalPrice: true },
    }),
  ]);

  const statMap = Object.fromEntries(
    stats.map((s) => [s.status, { count: s._count.id, total: s._sum.totalPrice ?? 0 }])
  );
  const totalCount = stats.reduce((n, s) => n + s._count.id, 0);

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">All Bookings</h1>

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {STATUSES.map((status) => {
          const stat = statMap[status];
          return (
            <Card key={status}>
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground uppercase tracking-wide">{status}</p>
                <p className="text-2xl font-bold mt-1">{stat?.count ?? 0}</p>
                {stat && stat.total > 0 && (
                  <p className="text-xs text-muted-foreground mt-0.5">{formatNGN(stat.total)}</p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {totalCount > PAGE_SIZE && (
        <p className="text-xs text-muted-foreground">
          Showing the latest {PAGE_SIZE} of {totalCount} bookings.
        </p>
      )}

      {/* Bookings table */}
      <div className="rounded-xl border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-muted-foreground text-xs uppercase tracking-wide">
              <tr>
                <th className="px-4 py-3 text-left">Listing</th>
                <th className="px-4 py-3 text-left">Guest</th>
                <th className="px-4 py-3 text-left">Check-in</th>
                <th className="px-4 py-3 text-left">Check-out</th>
                <th className="px-4 py-3 text-right">Total</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Booked</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {bookings.map((b) => (
                <tr key={b.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3">
                    <Link
                      href={`/listings/${b.listing.id}`}
                      title={b.listing.title}
                      className="hover:underline font-medium"
                    >
                      {b.listing.title.length > 30 ? b.listing.title.slice(0, 30) + "…" : b.listing.title}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{b.guest.name ?? b.guest.email}</td>
                  <td className="px-4 py-3 whitespace-nowrap">{formatBookingDay(b.checkIn)}</td>
                  <td className="px-4 py-3 whitespace-nowrap">{formatBookingDay(b.checkOut)}</td>
                  <td className="px-4 py-3 text-right font-medium whitespace-nowrap">{formatNGN(b.totalPrice)}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${bookingStatusColors[b.status] ?? ""}`}>
                      {b.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground text-xs whitespace-nowrap">
                    {format(b.createdAt, "MMM d, yyyy")}
                  </td>
                </tr>
              ))}
              {bookings.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                    No bookings yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
