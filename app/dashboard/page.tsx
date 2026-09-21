import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { ListingCard, type Listing } from "@/components/listings/ListingCard";
import {
  Search, Bookmark, Plus, List, User, ArrowRight,
  CheckCircle2, Clock, XCircle, MessageSquare, TrendingUp, AlertTriangle,
} from "lucide-react";
import React from "react";
import { prisma } from "@/lib/prisma";
import { cn } from "@/lib/utils";

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
    type: raw.type as Listing["type"],
    category: raw.category as Listing["category"],
    status: raw.status as Listing["status"],
    location: raw.location?.city ?? "",
    city: raw.location?.city ?? "",
    state: raw.location?.state ?? "",
    address: raw.location?.address ?? undefined,
    images: (raw.images ?? []).map((img: any) => img.url),
    createdAt: raw.createdAt instanceof Date ? raw.createdAt.toISOString() : raw.createdAt,
  };
}

function getRoleBadgeClass(role: string): string {
  switch (role) {
    case "SELLER": return "bg-[#D4AF37] text-black font-semibold border-transparent";
    case "ADMIN":  return "bg-red-900 text-white border-transparent";
    default:       return "bg-gray-800 text-white border-transparent";
  }
}

function StatCard({
  icon: Icon,
  iconColor,
  borderColor,
  value,
  valueClassName,
  label,
  href,
  badge,
}: {
  icon: React.ComponentType<{ className?: string }>;
  iconColor: string;
  borderColor: string;
  value: React.ReactNode;
  valueClassName?: string;
  label: string;
  href?: string;
  badge?: React.ReactNode;
}) {
  const content = (
    <Card
      className={cn(
        "border-l-4 transition-shadow hover:shadow-md hover:border-[#D4AF37]",
        borderColor,
        href && "cursor-pointer"
      )}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <Icon className={cn("h-5 w-5", iconColor)} />
          {badge}
        </div>
        <p className={cn("mt-2 text-2xl font-bold", valueClassName)}>{value}</p>
        <p className="text-xs text-muted-foreground">{label}</p>
      </CardContent>
    </Card>
  );

  return href ? <Link href={href}>{content}</Link> : content;
}

export default async function DashboardPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const role = (session.user as any).role as string;
  const name = session.user.name ?? "User";
  const userId = (session.user as any).id as string;
  const isSeller = role === "SELLER";

  let pendingCount = 0;
  let publishedCount = 0;
  let rejectedCount = 0;
  let savedCount = 0;
  let enquiriesReceived = 0;
  let unreadEnquiries = 0;
  let totalSaves = 0;
  let totalRevenue = 0;
  let paymentsCount = 0;
  let kycStatus = "NOT_SUBMITTED";
  let recentListings: Listing[] = [];

  try {
    if (isSeller) {
      const [pending, published, rejected, recent] = await Promise.all([
        prisma.listing.count({ where: { userId, status: "PENDING" } }),
        prisma.listing.count({ where: { userId, status: "PUBLISHED" } }),
        prisma.listing.count({ where: { userId, status: "REJECTED" } }),
        prisma.listing.findMany({
          where: { userId },
          take: 3,
          orderBy: { createdAt: "desc" },
          include: {
            images: { where: { isPrimary: true }, take: 1 },
            location: true,
          },
        }),
      ]);
      pendingCount = pending;
      publishedCount = published;
      rejectedCount = rejected;
      recentListings = recent.map(mapListing);

      const [enquiriesTotal, enquiriesUnread, saves, paymentsAgg, userRecord] = await Promise.all([
        prisma.enquiry.count({ where: { listing: { userId } } }),
        prisma.enquiry.count({ where: { listing: { userId }, isReadBySeller: false } }),
        prisma.savedListing.count({ where: { listing: { userId } } }),
        prisma.payment.aggregate({
          where: { userId, type: "LISTING_FEE", status: "SUCCESS" },
          _sum: { amount: true },
          _count: true,
        }),
        prisma.user.findUnique({ where: { id: userId }, select: { kycStatus: true } }),
      ]);
      enquiriesReceived = enquiriesTotal;
      unreadEnquiries = enquiriesUnread;
      totalSaves = saves;
      totalRevenue = paymentsAgg._sum.amount ?? 0;
      paymentsCount = paymentsAgg._count;
      kycStatus = (userRecord as any)?.kycStatus ?? "NOT_SUBMITTED";
    }

    savedCount = await prisma.savedListing.count({ where: { userId } });
  } catch {}

  const tipText =
    role === "BUYER"
      ? `You have ${savedCount} saved ${savedCount === 1 ? "property" : "properties"}.`
      : isSeller
      ? publishedCount === 0 && pendingCount === 0
        ? "You have no listings yet. Create your first listing to get started."
        : unreadEnquiries > 0
        ? `You have ${unreadEnquiries} new ${unreadEnquiries === 1 ? "enquiry" : "enquiries"} waiting for your response.`
        : `${publishedCount} live · ${pendingCount} pending · ${rejectedCount} rejected`
      : "Welcome to your dashboard.";

  const quickCards = isSeller ? sellerCards : buyerCards;

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="rounded-xl bg-black p-6 text-white">
        <div className="mb-2 flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-bold">Welcome back, {name}</h1>
          <Badge className={getRoleBadgeClass(role)}>{role}</Badge>
        </div>
        <p className="text-sm text-gray-400">{tipText}</p>
      </div>

      {/* KYC reminder — unverified sellers */}
      {role === "SELLER" && kycStatus !== "VERIFIED" && (
        <Alert className="border-amber-400 bg-amber-50">
          <AlertTriangle className="h-4 w-4 text-amber-600" />
          <AlertTitle className="text-amber-800">Identity Verification Required</AlertTitle>
          <AlertDescription className="text-amber-700">
            You need to verify your identity before you can list properties.
            <Link href="/dashboard/kyc" className="ml-1 font-semibold underline">
              Verify now →
            </Link>
          </AlertDescription>
        </Alert>
      )}

      {/* Performance Stats — sellers only */}
      {isSeller && (
        <section>
          <h2 className="mb-4 text-lg font-semibold">Performance</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            <StatCard
              icon={CheckCircle2}
              iconColor="text-green-600"
              borderColor="border-l-green-500"
              value={publishedCount}
              label="Live Listings"
              href="/dashboard/listings?status=PUBLISHED"
            />
            <StatCard
              icon={Clock}
              iconColor="text-amber-600"
              borderColor="border-l-amber-500"
              value={pendingCount}
              label="Pending Review"
              href="/dashboard/listings?status=PENDING"
            />
            <StatCard
              icon={XCircle}
              iconColor="text-red-600"
              borderColor="border-l-red-500"
              value={rejectedCount}
              label="Rejected"
              href="/dashboard/listings?status=REJECTED"
            />
            <StatCard
              icon={MessageSquare}
              iconColor="text-blue-600"
              borderColor="border-l-blue-500"
              value={enquiriesReceived}
              label="Total Enquiries"
              href="/dashboard/enquiries"
              badge={
                unreadEnquiries > 0 ? (
                  <Badge className="bg-[#D4AF37] text-black hover:bg-[#D4AF37]">
                    {unreadEnquiries} new
                  </Badge>
                ) : undefined
              }
            />
            <StatCard
              icon={Bookmark}
              iconColor="text-purple-600"
              borderColor="border-l-purple-500"
              value={totalSaves}
              label="Times Saved"
            />
            <StatCard
              icon={TrendingUp}
              iconColor="text-[#D4AF37]"
              borderColor="border-l-[#D4AF37]"
              value={
                publishedCount > 0
                  ? `${publishedCount} active • ${enquiriesReceived} enquiries • ${totalSaves} saves`
                  : "No active listings yet"
              }
              valueClassName="text-sm font-semibold leading-snug"
              label="Performance"
              href="/dashboard/listings"
            />
          </div>
        </section>
      )}

      {/* Quick Actions */}
      <section>
        <h2 className="mb-4 text-lg font-semibold">Quick Actions</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {quickCards.map((card) => {
            const Icon = card.icon;
            return (
              <Link key={card.href} href={card.href}>
                <Card className="group cursor-pointer border-l-4 border-l-[#D4AF37] transition-shadow hover:shadow-md hover:border-[#D4AF37]">
                  <CardContent className="flex items-center justify-between p-5">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#F9F8F4]">
                        <Icon className="h-5 w-5 text-[#D4AF37]" />
                      </div>
                      <span className="font-medium">{card.label}</span>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground transition-colors group-hover:text-[#D4AF37]" />
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Recent Listings — sellers only */}
      {isSeller && (
        <section>
          <h2 className="mb-4 text-lg font-semibold">Recent Listings</h2>
          {recentListings.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No listings yet.{" "}
              <Link href="/dashboard/listings/new" className="text-[#D4AF37] hover:text-[#B8961E] underline">
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
