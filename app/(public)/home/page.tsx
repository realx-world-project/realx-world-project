import { Suspense } from "react";
import { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Building2, Users, MapPin, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SearchBar } from "@/components/listings/SearchBar";
import { ListingCard, type Listing } from "@/components/listings/ListingCard";

export const metadata: Metadata = {
  title: "RealX World — Nigeria's Property Marketplace",
  description:
    "Browse and list verified properties across Nigeria",
};

const mockListings: Listing[] = [
  {
    id: "h1",
    title: "3 Bedroom Flat in Lekki",
    price: 15_000_000,
    type: "SALE",
    category: "RESIDENTIAL",
    status: "PUBLISHED",
    location: "Lekki",
    city: "Lekki",
    state: "Lagos",
    images: [],
    seller: { name: "John Doe", role: "AGENT" },
  },
  {
    id: "h2",
    title: "Luxury 4-Bedroom Detached House in Banana Island",
    price: 250_000_000,
    type: "SALE",
    category: "RESIDENTIAL",
    status: "PUBLISHED",
    location: "Banana Island, Ikoyi",
    city: "Lagos",
    state: "Lagos",
    images: [],
    seller: { name: "Jane Smith", role: "AGENT" },
  },
  {
    id: "h3",
    title: "Modern 3-Bedroom Flat in Victoria Island",
    price: 85_000_000,
    type: "RENT",
    category: "RESIDENTIAL",
    status: "PUBLISHED",
    location: "Victoria Island",
    city: "Lagos",
    state: "Lagos",
    images: [],
  },
  {
    id: "h4",
    title: "Commercial Plot of Land in Lekki",
    price: 150_000_000,
    type: "SALE",
    category: "LAND",
    status: "PUBLISHED",
    location: "Lekki Peninsula",
    city: "Lagos",
    state: "Lagos",
    images: [],
  },
  {
    id: "h5",
    title: "5 Bedroom Duplex in Asokoro",
    price: 180_000_000,
    type: "SALE",
    category: "RESIDENTIAL",
    status: "PUBLISHED",
    location: "Asokoro",
    city: "Abuja",
    state: "FCT",
    images: [],
  },
  {
    id: "h6",
    title: "2 Bedroom Apartment in Ikeja GRA",
    price: 6_500_000,
    type: "RENT",
    category: "RESIDENTIAL",
    status: "PUBLISHED",
    location: "Ikeja GRA",
    city: "Ikeja",
    state: "Lagos",
    images: [],
  },
];

const stats = [
  { icon: Building2, value: "500+", label: "Listings" },
  { icon: Users, value: "200+", label: "Agents" },
  { icon: MapPin, value: "36", label: "States Covered" },
];

const steps = [
  {
    number: "01",
    title: "List Your Property",
    description:
      "Create a detailed listing with photos, price, and location in minutes.",
  },
  {
    number: "02",
    title: "Get Verified",
    description:
      "Our team reviews your listing to ensure accuracy and trustworthiness.",
  },
  {
    number: "03",
    title: "Connect with Buyers",
    description:
      "Receive inquiries directly from interested buyers and agents.",
  },
];

export default function HomePage() {
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
            <Suspense>
              <SearchBar />
            </Suspense>
          </div>

          <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            {/* Plain Links — shadcn Button inherits theme bg-background which
                clashes with the blue hero, making text invisible on the default state. */}
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
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {mockListings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
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
