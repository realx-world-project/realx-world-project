import { Suspense } from "react";
import { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Building2, Users, MapPin, CheckCircle2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { SearchBar } from "@/components/listings/SearchBar";
import { ListingCard, type Listing } from "@/components/listings/ListingCard";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "RealX World — Nigeria's Property Marketplace",
  description: "Browse and list verified properties across Nigeria",
};

async function getRecentListings(): Promise<Listing[]> {
  try {
    const rows = await prisma.listing.findMany({
      where: { status: "PUBLISHED" },
      take: 6,
      orderBy: { publishedAt: "desc" },
      include: {
        images: { where: { isPrimary: true }, take: 1 },
        location: true,
      },
    });
    return rows.map((l) => ({
      id: l.id,
      title: l.title,
      price: l.price,
      type: l.type,
      category: l.category,
      status: l.status,
      location: l.location?.city ?? "",
      city: l.location?.city ?? "",
      state: l.location?.state ?? "",
      address: l.location?.address ?? undefined,
      images: l.images.map((img) => img.url),
      createdAt: l.createdAt.toISOString(),
    }));
  } catch (err) {
    console.error("getRecentListings error:", err);
    return [];
  }
}

const stats = [
  { icon: Building2, value: "500+", label: "Listings" },
  { icon: Users, value: "200+", label: "Agents" },
  { icon: MapPin, value: "36", label: "States Covered" },
];

const steps = [
  {
    number: "01",
    title: "List Your Property",
    description: "Create a detailed listing with photos, price, and location in minutes.",
  },
  {
    number: "02",
    title: "Get Verified",
    description: "Our team reviews your listing to ensure accuracy and trustworthiness.",
  },
  {
    number: "03",
    title: "Connect with Buyers",
    description: "Receive inquiries directly from interested buyers and agents.",
  },
];

function SearchBarFallback() {
  return (
    <div className="h-12 w-full animate-pulse rounded-lg bg-gray-200" />
  );
}

export default async function HomePage() {
  let listings: Listing[] = [];
  try {
    listings = await getRecentListings();
  } catch (e) {
    console.error("HomePage error:", e);
    listings = [];
  }

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-black to-gray-900 py-16 sm:py-24">
        <div className="container mx-auto px-4 text-center">
          <h1 className="mb-4 text-3xl font-bold text-[#D4AF37] sm:text-5xl">
            Find Your Perfect Property in Nigeria
          </h1>
          <p className="mx-auto mb-8 max-w-2xl text-base text-gray-300 sm:text-lg">
            Browse verified listings from trusted agents and sellers
          </p>

          <div className="mx-auto mb-8 max-w-2xl rounded-xl bg-white p-3 shadow-lg">
            <Suspense fallback={<SearchBarFallback />}>
              <SearchBar />
            </Suspense>
          </div>

          <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link
              href="/listings"
              className="inline-flex w-full items-center justify-center rounded-md bg-[#D4AF37] px-6 py-3 font-semibold text-black transition-colors hover:bg-[#B8961E] sm:w-auto"
            >
              Browse Listings
            </Link>
            <Link
              href="/register"
              className="inline-flex w-full items-center justify-center rounded-md border-2 border-white px-6 py-3 font-medium text-white transition-colors hover:bg-white hover:text-black sm:w-auto"
            >
              List Your Property
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Strip */}
      <section className="border-b bg-[#0A0A0A] py-10 sm:py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 gap-8 text-center sm:grid-cols-3">
            {stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <div key={stat.label} className="flex flex-col items-center gap-2">
                  <Icon className="h-8 w-8 text-[#D4AF37]" />
                  <p className="text-4xl font-bold text-[#D4AF37]">{stat.value}</p>
                  <p className="text-gray-300">{stat.label}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Recent Listings */}
      <section className="py-12 sm:py-16">
        <div className="container mx-auto px-4">
          <div className="mb-8 flex items-center justify-between">
            <h2 className="text-2xl font-bold sm:text-3xl">Recent Listings</h2>
          </div>

          {listings.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {listings.map((listing) => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </div>
          ) : (
            <p className="py-8 text-center text-muted-foreground">
              No listings available yet. Check back soon.
            </p>
          )}

          <div className="mt-10 text-center">
            <Link
              href="/listings"
              className="inline-flex items-center gap-2 px-6 py-3 border-2 border-[#D4AF37] text-[#D4AF37] font-semibold rounded-lg hover:bg-[#D4AF37] hover:text-black transition-all duration-200"
            >
              <span>View All Listings</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-gray-50 py-12 sm:py-16">
        <div className="container mx-auto px-4">
          <div className="mb-10 text-center">
            <h2 className="text-2xl font-bold sm:text-3xl">How It Works</h2>
            <p className="mt-2 text-muted-foreground">
              List and sell your property in three simple steps
            </p>
          </div>
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
            {steps.map((step, i) => (
              <Card key={i} className="text-center border-t-2 border-[#D4AF37] shadow-sm">
                <CardContent className="pt-8 pb-8">
                  <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#D4AF37] text-xl font-bold text-black">
                    {step.number}
                  </div>
                  <h3 className="mb-2 text-lg font-semibold">{step.title}</h3>
                  <p className="text-sm text-muted-foreground">{step.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-12 sm:py-16">
        <div className="container mx-auto px-4">
          <div className="rounded-2xl bg-[#0A0A0A] p-8 text-center sm:p-12">
            <CheckCircle2 className="mx-auto mb-4 h-12 w-12 text-[#D4AF37]" />
            <h2 className="mb-3 text-2xl font-bold text-white sm:text-3xl">
              Ready to list your property?
            </h2>
            <p className="mx-auto mb-8 max-w-xl text-gray-400">
              Join thousands of sellers and agents on RealX World. Get your
              property in front of qualified buyers today.
            </p>
            <Link
              href="/register"
              className="inline-flex items-center justify-center rounded-md bg-[#D4AF37] hover:bg-[#B8961E] px-8 py-3 font-semibold text-black transition-colors"
            >
              Get Started for Free
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
