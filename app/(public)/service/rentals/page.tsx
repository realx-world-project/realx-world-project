import { Metadata } from "next";
import Link from "next/link";
import { Search, Calendar, Bell } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Rentals — RealX World",
  description:
    "Find, manage, and track your rental properties with ease using RealX World's guided search and rent management tools.",
};

const cards = [
  {
    icon: Search,
    title: "Free Property Search",
    body: "Browse our listings freely from the comfort of your home and find the perfect rental property at your own pace.",
  },
  {
    icon: Calendar,
    title: "Guided Tour Booking",
    body: "Opt for our guided tour service and have reservations booked ahead of time for a seamless viewing experience.",
  },
  {
    icon: Bell,
    title: "Automated Rent Reminders",
    body: "Never miss a payment — our system tracks due dates and sends automated reminders to keep everything on schedule.",
  },
];

export default function RentalsPage() {
  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-black to-gray-900 py-16 sm:py-24">
        <div className="container mx-auto px-4 text-center">
          <h1 className="mb-4 text-3xl font-bold text-[#D4AF37] sm:text-5xl">
            Rentals
          </h1>
          <p className="mx-auto max-w-2xl text-base text-gray-300 sm:text-lg">
            Find, manage, and track your rental properties with ease
          </p>
        </div>
      </section>

      {/* Section 1 */}
      <section className="py-12 sm:py-16">
        <div className="container mx-auto px-4">
          <h2 className="mb-6 text-center text-2xl font-bold sm:text-3xl">
            Property Search &amp; Guided Tours
          </h2>
          <p className="mx-auto max-w-3xl text-center text-lg text-gray-700">
            With regard to property management, the Real-X open market system
            gives the client the opportunity to surf freely within the listings
            for a proper choice from the comfort of their homes. We equally
            support a guided tour system. Should the client opt for the guided
            tour option, reservations are booked ahead of time.
          </p>
        </div>
      </section>

      {/* Section 2 */}
      <section className="bg-gray-50 py-12 sm:py-16">
        <div className="container mx-auto px-4">
          <h2 className="mb-6 text-center text-2xl font-bold sm:text-3xl">
            Rent Management
          </h2>
          <p className="mx-auto mb-10 max-w-3xl text-center text-gray-700">
            Real-X Rentals offers the wonderful opportunity of rent management —
            an accounting system that helps to determine when rents are due and
            sends automated reminders to concerned clients. It equally keeps an
            up-to-date report of payment history and due dates. Service is
            provided according to the clients&apos; specific needs.
          </p>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            {cards.map((card) => {
              const Icon = card.icon;
              return (
                <Card
                  key={card.title}
                  className="border-t-2 border-[#D4AF37] shadow-sm"
                >
                  <CardContent className="pt-6 pb-6">
                    <Icon className="mb-4 h-8 w-8 text-[#D4AF37]" />
                    <h3 className="mb-2 text-lg font-semibold">{card.title}</h3>
                    <p className="text-sm text-muted-foreground">{card.body}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Back link */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          <Link
            href="/service"
            className="text-sm font-medium text-[#D4AF37] hover:underline"
          >
            ← Back to Services
          </Link>
        </div>
      </section>
    </div>
  );
}
