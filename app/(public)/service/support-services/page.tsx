import { Metadata } from "next";
import Link from "next/link";
import { Clock, TrendingUp, FileText } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Support Services — RealX World",
  description:
    "24/7 after-sales support to help RealX World clients navigate investment, divestment, and reinvestment opportunities.",
};

const cards = [
  {
    icon: Clock,
    title: "24/7 Availability",
    body: "Our complete services are available around the clock, ensuring you always have access to the support you need.",
  },
  {
    icon: TrendingUp,
    title: "Investment Guidance",
    body: "We help clients understand investment, divestment, and reinvestment possibilities arising from prior transactions.",
  },
  {
    icon: FileText,
    title: "Transaction History",
    body: "We maintain a reliable footprint of an unbroken trail of transaction history for every client.",
  },
];

export default function SupportServicesPage() {
  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-black to-gray-900 py-16 sm:py-24">
        <div className="container mx-auto px-4 text-center">
          <h1 className="mb-4 text-3xl font-bold text-[#D4AF37] sm:text-5xl">
            Support Services
          </h1>
          <p className="mx-auto max-w-2xl text-base text-gray-300 sm:text-lg">
            Always available, always dependable
          </p>
        </div>
      </section>

      {/* Section 1 */}
      <section className="py-12 sm:py-16">
        <div className="container mx-auto px-4">
          <h2 className="mb-6 text-center text-2xl font-bold sm:text-3xl">
            After-Sales Support
          </h2>
          <p className="mx-auto max-w-3xl text-center text-lg text-gray-700">
            We provide a system of after-sales support services to enable the
            client to understand the possibilities of investment, divestment,
            and reinvestment available with the opportunities provided by prior
            investments already made, helping them make correct choices and move
            on to what is next, while leaving a reliable footprint of an
            unbroken trail of transaction history. We avail our complete
            services to all our customers 24 hours a day.
          </p>
        </div>
      </section>

      {/* Section 2 */}
      <section className="bg-gray-50 py-12 sm:py-16">
        <div className="container mx-auto px-4">
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
