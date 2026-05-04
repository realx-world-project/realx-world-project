import { Metadata } from "next";
import { MapPin, Calendar, User, Phone, ArrowLeft } from "lucide-react";
import { format } from "date-fns";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ImageGallery } from "@/components/listings/ImageGallery";
import { BookmarkToggle } from "@/components/listings/BookmarkToggle";
import { ReportDialog } from "@/components/listings/ReportDialog";
import { auth } from "@/lib/auth";
import type { Listing } from "@/components/listings/ListingCard";

export const dynamic = "force-dynamic";

interface ListingDetailPageProps {
  params: Promise<{ id: string }>;
}

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

const formatPrice = (price: number) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(price);

const typeClasses = {
  SALE: "bg-blue-600 text-white border-transparent",
  RENT: "bg-green-600 text-white border-transparent",
} as const;

function mapApiListing(raw: any): Listing {
  return {
    id: raw.id,
    title: raw.title,
    description: raw.description,
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
    seller: raw.user?.name ? { name: raw.user.name, role: "AGENT" } : undefined,
  };
}

async function fetchListing(id: string): Promise<Listing | null> {
  try {
    const res = await fetch(`${BASE_URL}/api/listings/${id}`, {
      cache: "no-store",
    });
    if (!res.ok) return null;
    const raw = await res.json();
    return mapApiListing(raw);
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: ListingDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const listing = await fetchListing(id);

  if (!listing) {
    return { title: "Property Not Found | RealX World" };
  }

  const description = listing.description
    ? listing.description.slice(0, 160).replace(/\n/g, " ")
    : `${listing.type === "RENT" ? "For Rent" : "For Sale"} — ${listing.category.toLowerCase()} property in ${listing.city}, ${listing.state}`;

  return {
    title: `${listing.title} | RealX World`,
    description,
  };
}

function NotFound() {
  return (
    <div className="container mx-auto flex flex-col items-center justify-center px-4 py-24 text-center">
      <h1 className="text-4xl font-bold">Property Not Found</h1>
      <p className="mt-4 text-muted-foreground">
        This listing may have been removed or is temporarily unavailable.
      </p>
      <Link href="/listings" className="mt-8">
        <Button>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Listings
        </Button>
      </Link>
    </div>
  );
}

export default async function ListingDetailPage({
  params,
}: ListingDetailPageProps) {
  const { id } = await params;
  const [listing, session] = await Promise.all([fetchListing(id), auth()]);

  if (!listing) return <NotFound />;

  const isAuthenticated = !!session?.user;

  return (
    <div className="container mx-auto px-4 py-8">
      <Link
        href="/listings"
        className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Listings
      </Link>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Main content */}
        <div className="lg:col-span-2">
          <ImageGallery images={listing.images} title={listing.title} />

          <div className="mt-8 space-y-6">
            {/* Badges + title */}
            <div>
              <div className="mb-3 flex flex-wrap gap-2">
                <Badge className={typeClasses[listing.type]}>{listing.type}</Badge>
                <Badge variant="outline">{listing.category}</Badge>
              </div>
              <h1 className="text-2xl font-bold sm:text-3xl">{listing.title}</h1>
              <div className="mt-2 flex items-center gap-1 text-muted-foreground">
                <MapPin className="h-4 w-4 flex-shrink-0" />
                <span>
                  {listing.address ??
                    `${listing.location}, ${listing.city}, ${listing.state}`}
                </span>
              </div>
            </div>

            {/* Price */}
            <p className="text-2xl font-bold text-primary sm:text-3xl">
              {formatPrice(listing.price)}
              {listing.type === "RENT" && (
                <span className="ml-1 text-lg font-normal text-muted-foreground">
                  /year
                </span>
              )}
            </p>

            <Separator />

            {/* Description */}
            {listing.description && (
              <div>
                <h2 className="mb-3 text-xl font-semibold">Description</h2>
                <div className="whitespace-pre-wrap leading-relaxed text-muted-foreground">
                  {listing.description}
                </div>
              </div>
            )}

            <Separator />

            {/* Listed by */}
            <div>
              <h2 className="mb-3 text-xl font-semibold">Listed By</h2>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                  <User className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="font-medium">{listing.seller?.name ?? "Unknown"}</p>
                  <p className="text-sm capitalize text-muted-foreground">
                    {listing.seller?.role?.toLowerCase() ?? "seller"}
                  </p>
                </div>
              </div>
            </div>

            {/* Date */}
            {listing.createdAt && (
              <>
                <Separator />
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>
                    Listed on {format(new Date(listing.createdAt), "MMMM d, yyyy")}
                  </span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="sticky top-8 space-y-3 rounded-xl border bg-card p-6 shadow-sm">
            {/* Price (mobile) */}
            <div className="lg:hidden">
              <p className="text-2xl font-bold text-primary">
                {formatPrice(listing.price)}
                {listing.type === "RENT" && (
                  <span className="ml-1 text-sm font-normal text-muted-foreground">
                    /yr
                  </span>
                )}
              </p>
              <Separator className="mt-3" />
            </div>

            <BookmarkToggle
              listingId={listing.id}
              isSaved={false}
              showLabel
            />

            <ReportDialog listingId={listing.id} listingTitle={listing.title} />

            {listing.phone ? (
              <Button className="w-full" size="lg">
                <Phone className="mr-2 h-4 w-4" />
                {listing.phone}
              </Button>
            ) : (
              <div className="rounded-lg bg-muted p-3 text-center text-sm text-muted-foreground">
                Contact info not available
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
