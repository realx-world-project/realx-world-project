import Link from "next/link";
import { Metadata } from "next";
import { Bookmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ListingCard, type Listing } from "@/components/listings/ListingCard";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Saved Listings | RealX World",
  description: "Your saved property listings",
};

async function fetchSavedListings(): Promise<Listing[]> {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/api/user/saved-listings`,
      { cache: "no-store" }
    );
    if (!res.ok) throw new Error("API unavailable");
    const data = await res.json();
    return data.listings ?? [];
  } catch {
    return [];
  }
}

export default async function SavedListingsPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const listings = await fetchSavedListings();

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
