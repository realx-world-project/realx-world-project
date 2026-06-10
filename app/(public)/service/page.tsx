import { Metadata } from "next";
import Link from "next/link";
import {
  BarChart2,
  FolderOpen,
  Headphones,
  GraduationCap,
  Home,
  Globe,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Our Service — RealX World",
  description:
    "Discover how RealX World delivers exceptional real estate service through trained professionals committed to exceeding client expectations.",
};

const services = [
  {
    icon: BarChart2,
    title: "Consultancy",
    desc: "Data-driven real estate advice and professional guidance across land acquisition, development, and investment.",
    href: "/service/consultancy",
  },
  {
    icon: FolderOpen,
    title: "Property & Project Management",
    desc: "Full-cycle project management from initiation to post-implementation, handled by experienced professionals.",
    href: "/service/property-management",
  },
  {
    icon: Headphones,
    title: "Support Services",
    desc: "24/7 after-sales support to help clients navigate investment, divestment, and reinvestment opportunities.",
    href: "/service/support-services",
  },
  {
    icon: GraduationCap,
    title: "Corporate Training",
    desc: "Tailored training programmes for client staff on Real-X World products, services, and software.",
    href: "/service/corporate-training",
  },
  {
    icon: Home,
    title: "Rentals",
    desc: "Guided property search, rent management, and automated payment reminders — all from the comfort of your home.",
    href: "/service/rentals",
  },
  {
    icon: Globe,
    title: "Open Market",
    desc: "A near-perfect open market for genuine real estate transactions with limitless opportunities across the globe.",
    href: "/service/open-market",
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
            therefore we are resolute in our commitment to making the
            customer&apos;s life easier and more rewarding — that is our reason
            for being.
          </p>
        </div>
      </section>

      {/* Service Cards */}
      <section className="bg-gray-50 py-12 sm:py-16">
        <div className="container mx-auto px-4">
          <div className="mb-10 text-center">
            <h2 className="text-2xl font-bold sm:text-3xl">What We Offer</h2>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((svc) => {
              const Icon = svc.icon;
              return (
                <Link key={svc.href} href={svc.href} className="group block">
                  <Card className="h-full border-t-2 border-[#D4AF37] shadow-sm transition-shadow group-hover:shadow-md">
                    <CardContent className="flex h-full flex-col pt-6 pb-6">
                      <Icon className="mb-4 h-8 w-8 text-[#D4AF37]" />
                      <h3 className="mb-2 text-lg font-semibold">{svc.title}</h3>
                      <p className="flex-1 text-sm text-muted-foreground">
                        {svc.desc}
                      </p>
                      <div className="mt-4 flex items-center gap-1 text-sm font-medium text-[#D4AF37]">
                        Learn more <ArrowRight className="h-4 w-4" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
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
            We are resolute in our commitment to making the customer&apos;s
            life easier and more rewarding. Our brokers are held to the highest
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
