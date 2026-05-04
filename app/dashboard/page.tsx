import { auth } from "@/lib/auth";
import { cookies } from "next/headers";
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

function mapListing(raw: any): Listing {
  return {
    id: raw.id,
    title: raw.title,
    price: raw.price,
    type: raw.type,
    category: raw.category,
    status: raw.status,
    location: raw.location?.area || raw.location?.city || "",
    city: raw.location?.city || "",
    state: raw.location?.state || "",
    address: raw.location?.address,
    images: (raw.images ?? []).map((img: any) => img.url),
    createdAt: raw.createdAt,
  };
}

export default async function DashboardPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const role = (session.user as any).role as string;
  const name = session.user.name ?? "User";
  const isSellerOrAgent = role === "SELLER" || role === "AGENT";

  const base = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const cookieStore = cookies();
  const cookieHeader = cookieStore.getAll().map((c) => `${c.name}=${c.value}`).join("; ");
  const opts = { headers: { Cookie: cookieHeader }, cache: "no-store" as const };

  let pendingCount = 0;
  let publishedCount = 0;
  let rejectedCount = 0;
  let savedCount = 0;
  let recentListings: Listing[] = [];

  try {
    const fetches = await Promise.all([
      isSellerOrAgent ? fetch(`${base}/api/user/listings?status=PENDING&limit=1`, opts) : null,
      isSellerOrAgent ? fetch(`${base}/api/user/listings?status=PUBLISHED&limit=1`, opts) : null,
      isSellerOrAgent ? fetch(`${base}/api/user/listings?status=REJECTED&limit=1`, opts) : null,
      fetch(`${base}/api/user/saved-listings`, opts),
      isSellerOrAgent ? fetch(`${base}/api/user/listings?limit=3`, opts) : null,
    ]);

    const [pendingRes, publishedRes, rejectedRes, savedRes, recentRes] = fetches;

    if (pendingRes?.ok) pendingCount = (await pendingRes.json()).total ?? 0;
    if (publishedRes?.ok) publishedCount = (await publishedRes.json()).total ?? 0;
    if (rejectedRes?.ok) rejectedCount = (await rejectedRes.json()).total ?? 0;
    if (savedRes?.ok) savedCount = (await savedRes.json()).savedListings?.length ?? 0;
    if (recentRes?.ok) recentListings = ((await recentRes.json()).listings ?? []).map(mapListing);
  } catch {}

  const tipText =
    role === "BUYER"
      ? `You have ${savedCount} saved ${savedCount === 1 ? "property" : "properties"}.`
      : isSellerOrAgent
      ? `${pendingCount} pending · ${publishedCount} published · ${rejectedCount} rejected`
      : "Welcome to your dashboard.";

  const quickCards = isSellerOrAgent ? sellerCards : buyerCards;

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

      {/* Recent Listings — sellers/agents only */}
      {isSellerOrAgent && (
        <section>
          <h2 className="mb-4 text-lg font-semibold">Recent Listings</h2>
          {recentListings.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No listings yet.{" "}
              <Link href="/dashboard/listings/new" className="text-blue-600 underline">
                Create your first one.
              </Link>
            </p>
          ) : (
            <div className="-mx-1 flex gap-4 overflow-x-auto px-1 pb-4">
              {recentListings.map((listing) => (
                <div key={listing.id} className="w-[280px] flex-shrink-0">
                  <ListingCard listing={listing} />
                </div>
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
}
