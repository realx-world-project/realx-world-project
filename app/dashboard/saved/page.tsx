import Link from "next/link";
import { Metadata } from "next";
import { Bookmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ListingCard, type Listing } from "@/components/listings/ListingCard";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Saved Listings | RealX World",
  description: "Your saved property listings",
};

async function getSavedListings(userId: string): Promise<Listing[]> {
  try {
    const saved = await prisma.savedListing.findMany({
      where: { userId },
      include: {
        listing: {
          include: {
            images: { where: { isPrimary: true }, take: 1 },
            location: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
    return saved
      .filter((s) => s.listing.status === "PUBLISHED")
      .map((s) => ({
        id: s.listing.id,
        title: s.listing.title,
        price: s.listing.price,
        type: s.listing.type,
        category: s.listing.category,
        status: s.listing.status,
        location: s.listing.location?.city ?? "",
        city: s.listing.location?.city ?? "",
        state: s.listing.location?.state ?? "",
        address: s.listing.location?.address ?? undefined,
        images: s.listing.images.map((img) => img.url),
        createdAt: s.listing.createdAt.toISOString(),
      }));
  } catch (err) {
    console.error("getSavedListings error:", err);
    return [];
  }
}

export default async function SavedListingsPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const userId = (session.user as any).id as string;
  const listings = await getSavedListings(userId);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold sm:text-3xl">Saved Listings</h1>
        <p className="mt-2 text-muted-foreground">
          Properties you've bookmarked for later
        </p>
      </div>

      {listings.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Bookmark className="h-16 w-16 text-muted-foreground/40" />
          <h2 className="mt-4 text-lg font-semibold">No saved listings yet</h2>
          <p className="mt-2 max-w-sm text-muted-foreground">
            Browse listings to save your favourites.
          </p>
          <Link href="/listings" className="mt-6">
            <Button>Browse Listings</Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {listings.map((listing) => (
            <ListingCard
              key={listing.id}
              listing={listing}
              isSaved
              isAuthenticated
            />
          ))}
        </div>
      )}
    </div>
  );
}
