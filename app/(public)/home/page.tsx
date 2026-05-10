import { Suspense } from "react";
import { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Building2, Users, MapPin, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SearchBar } from "@/components/listings/SearchBar";
import { ListingCard, type Listing } from "@/components/listings/ListingCard";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "RealX World — Nigeria's Property Marketplace",
  description: "Browse and list verified properties across Nigeria",
};

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

function mapApiListing(raw: any): Listing {
  return {
    id: raw.id,
    title: raw.title,
    price: raw.price,
    type: raw.type,
    category: raw.category,
    status: raw.status,
    location: raw.location?.area || raw.location?.city || "",
    city: raw.location?.city ?? "",
    state: raw.location?.state ?? "",
    address: raw.location?.address,
    images: (raw.images ?? [])
      .sort((a: any, b: any) => a.order - b.order)
      .map((img: any) => img.url),
    createdAt: raw.createdAt,
  };
}

async function fetchRecentListings(): Promise<Listing[]> {
  try {
    const res = await fetch(`${BASE_URL}/api/listings?limit=6`, {
      cache: "no-store",
    });
    if (!res.ok) return [];
    const data = await res.json();
    return (data.listings ?? []).map(mapApiListing);
  } catch {
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
    listings = await fetchRecentListings();
  } catch {
    listings = [];
  }

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-blue-600 to-blue-800 py-16 text-white sm:py-24">
        <div className="container mx-auto px-4 text-center">
          <h1 className="mb-4 text-3xl font-bold sm:text-5xl">
            Find Your Perfect Property in Nigeria
          </h1>
          <p className="mx-auto mb-8 max-w-2xl text-base text-blue-100 sm:text-lg">
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
              className="inline-flex w-full items-center justify-center rounded-md bg-white px-6 py-3 font-medium text-blue-600 transition-colors hover:bg-blue-50 sm:w-auto"
            >
              Browse Listings
            </Link>
            <Link
              href="/register"
              className="inline-flex w-full items-center justify-center rounded-md border-2 border-white px-6 py-3 font-medium text-white transition-colors hover:bg-white hover:text-blue-600 sm:w-auto"
            >
              List Your Property
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Strip */}
      <section className="border-b bg-muted/30 py-10 sm:py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 gap-8 text-center sm:grid-cols-3">
            {stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <div key={stat.label} className="flex flex-col items-center gap-2">
                  <Icon className="h-8 w-8 text-blue-600" />
                  <p className="text-4xl font-bold text-blue-600">{stat.value}</p>
                  <p className="text-muted-foreground">{stat.label}</p>
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
            <Button asChild variant="outline" size="lg">
              <Link href="/listings">
                View All Listings
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-muted/30 py-12 sm:py-16">
        <div className="container mx-auto px-4">
          <div className="mb-10 text-center">
            <h2 className="text-2xl font-bold sm:text-3xl">How It Works</h2>
            <p className="mt-2 text-muted-foreground">
              List and sell your property in three simple steps
            </p>
          </div>
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
            {steps.map((step, i) => (
              <Card key={i} className="text-center">
                <CardContent className="pt-8 pb-8">
                  <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 text-xl font-bold text-white">
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
          <div className="rounded-2xl bg-gradient-to-r from-blue-600 to-blue-700 p-8 text-center text-white sm:p-12">
            <CheckCircle2 className="mx-auto mb-4 h-12 w-12 text-white/80" />
            <h2 className="mb-3 text-2xl font-bold sm:text-3xl">
              Ready to list your property?
            </h2>
            <p className="mx-auto mb-8 max-w-xl text-blue-100">
              Join thousands of sellers and agents on RealX World. Get your
              property in front of qualified buyers today.
            </p>
            <Button asChild size="lg" variant="secondary" className="w-full sm:w-auto">
              <Link href="/register">Get Started for Free</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
