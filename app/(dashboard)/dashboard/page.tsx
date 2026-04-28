import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ListingCard, type Listing } from "@/components/listings/ListingCard";
import { Search, Bookmark, Plus, List, User, ArrowRight } from "lucide-react";
import React from "react";

type QuickCard = {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  href: string;
};

const buyerCards: QuickCard[] = [
  { icon: Search, label: "Browse Listings", href: "/listings" },
  { icon: Bookmark, label: "Saved Listings", href: "/dashboard/saved" },
];

const sellerCards: QuickCard[] = [
  { icon: Plus, label: "Add Listing", href: "/dashboard/listings/new" },
  { icon: List, label: "My Listings", href: "/dashboard/listings" },
  { icon: Bookmark, label: "Saved Listings", href: "/dashboard/saved" },
  { icon: User, label: "Profile", href: "/dashboard/profile" },
];

const mockRecentListings: Listing[] = [
  {
    id: "r1",
    title: "3 Bedroom Flat in Lekki",
    price: 15_000_000,
    type: "SALE",
    category: "RESIDENTIAL",
    status: "PUBLISHED",
    location: "Lekki",
    city: "Lekki",
    state: "Lagos",
    images: [],
  },
  {
    id: "r2",
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
  {
    id: "r3",
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
];

export default async function DashboardPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const role = (session.user as any).role as string;
  const name = session.user.name ?? "User";

  let pendingCount = 0;
  try {
    // API not live — pending count stays 0
  } catch {}

  const tipText =
    role === "BUYER"
      ? "Browse the latest listings or check your saved properties."
      : role === "SELLER"
      ? `You have ${pendingCount} pending listings awaiting approval.`
      : role === "AGENT"
      ? "Manage your listings and track performance."
      : "Welcome to your dashboard.";

  const isSellerOrAgent = role === "SELLER" || role === "AGENT";
  const quickCards = isSellerOrAgent ? sellerCards : buyerCards;

  let recentListings: Listing[] = [];
  try {
    // API not live — recent listings stay empty
  } catch {}
  const displayListings =
    recentListings.length > 0 ? recentListings : mockRecentListings;

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white">
        <div className="mb-2 flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-bold">Welcome back, {name}</h1>
          <Badge className="border-white/30 bg-white/20 text-white">{role}</Badge>
        </div>
        <p className="text-sm text-blue-100">{tipText}</p>
      </div>

      {/* Quick Actions */}
      <section>
        <h2 className="mb-4 text-lg font-semibold">Quick Actions</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {quickCards.map((card) => {
            const Icon = card.icon;
            return (
              <Link key={card.href} href={card.href}>
                <Card className="group cursor-pointer transition-shadow hover:shadow-md">
                  <CardContent className="flex items-center justify-between p-5">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50">
                        <Icon className="h-5 w-5 text-blue-600" />
                      </div>
                      <span className="font-medium">{card.label}</span>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground transition-colors group-hover:text-blue-600" />
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Recent Activity */}
      <section>
        <h2 className="mb-4 text-lg font-semibold">Recent Listings</h2>
        <div className="-mx-1 flex gap-4 overflow-x-auto px-1 pb-4">
          {displayListings.slice(0, 3).map((listing) => (
            <div key={listing.id} className="w-[280px] flex-shrink-0">
              <ListingCard listing={listing} />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
