import { Metadata } from "next";
import Link from "next/link";
import { UserCheck, TrendingUp, Heart, CheckCircle2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Our Service — RealX World",
  description:
    "Discover how RealX World delivers exceptional real estate service through trained professionals committed to exceeding client expectations.",
};

const pillars = [
  {
    icon: UserCheck,
    title: "Trained Professionals",
    body: "Our registered brokers are rigorously trained and self-motivated professionals who put the customer experience above all else, continuously raising the standard of real estate service.",
  },
  {
    icon: TrendingUp,
    title: "Exceeding Expectations",
    body: "We do not settle for meeting expectations — we exceed them. Every client interaction is an opportunity to demonstrate our unwavering commitment to quality service.",
  },
  {
    icon: Heart,
    title: "Customer First",
    body: "At Real-X, we know that without the customer we do not exist. Making your life easier and more rewarding is not just our goal — it is our reason for being.",
  },
];

export default function ServicePage() {
  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-black to-gray-900 py-16 sm:py-24">
        <div className="container mx-auto px-4 text-center">
          <h1 className="mb-4 text-3xl font-bold text-[#D4AF37] sm:text-5xl">
            Our Service
          </h1>
          <p className="mx-auto max-w-2xl text-base text-gray-300 sm:text-lg">
            Consistently exceeding expectations in every real estate transaction
          </p>
        </div>
      </section>

      {/* Mission */}
      <section className="py-12 sm:py-16">
        <div className="container mx-auto px-4">
          <p className="mx-auto max-w-3xl text-center text-lg text-gray-700">
            Our mission is to provide our growing clientele with a level of
            service that consistently exceeds expectations. Our registered
            brokers are trained and self-motivated professionals for whom the
            customer experience is the most important factor of business, and
            who continuously raise the standard by which service is defined. At
            Real-X, we know that without the customer we do not exist, and
            therefore we are resolute in our commitment to making the customer's
            life easier and more rewarding — that is our reason for being.
          </p>
        </div>
      </section>

      {/* Service Pillars */}
      <section className="bg-gray-50 py-12 sm:py-16">
        <div className="container mx-auto px-4">
          <div className="mb-10 text-center">
            <h2 className="text-2xl font-bold sm:text-3xl">
              What Sets Us Apart
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            {pillars.map((pillar) => {
              const Icon = pillar.icon;
              return (
                <Card
                  key={pillar.title}
                  className="border-t-2 border-[#D4AF37] shadow-sm"
                >
                  <CardContent className="pt-6 pb-6">
                    <Icon className="mb-4 h-8 w-8 text-[#D4AF37]" />
                    <h3 className="mb-2 text-lg font-semibold">
                      {pillar.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">{pillar.body}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Dark Banner */}
      <section className="bg-[#0A0A0A] py-12 sm:py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="mb-6 text-2xl font-bold text-[#D4AF37] sm:text-3xl">
            Our Commitment to You
          </h2>
          <p className="mx-auto max-w-3xl text-gray-300">
            We are resolute in our commitment to making the customer's life
            easier and more rewarding. Our brokers are held to the highest
            professional standards so that every transaction you make on RealX
            World is backed by expertise, trust, and genuine care.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="py-12 sm:py-16">
        <div className="container mx-auto px-4">
          <div className="rounded-2xl bg-[#0A0A0A] p-8 text-center sm:p-12">
            <CheckCircle2 className="mx-auto mb-4 h-12 w-12 text-[#D4AF37]" />
            <h2 className="mb-3 text-2xl font-bold text-white sm:text-3xl">
              Experience the RealX World difference
            </h2>
            <p className="mx-auto mb-8 max-w-xl text-gray-400">
              Connect with our trained professionals and discover a better way
              to buy, sell, and invest in Nigerian real estate.
            </p>
            <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Link
                href="/listings"
                className="inline-flex w-full items-center justify-center rounded-md bg-[#D4AF37] px-8 py-3 font-semibold text-black transition-colors hover:bg-[#B8961E] sm:w-auto"
              >
                Browse Listings
              </Link>
              <Link
                href="/register"
                className="inline-flex w-full items-center justify-center rounded-md border-2 border-white px-8 py-3 font-medium text-white transition-colors hover:bg-white hover:text-black sm:w-auto"
              >
                Register Today
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
