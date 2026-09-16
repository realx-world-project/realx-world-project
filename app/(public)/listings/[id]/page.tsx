import { Metadata } from "next";
import { MapPin, Calendar, User, ArrowLeft } from "lucide-react";
import { format } from "date-fns";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ImageGallery } from "@/components/listings/ImageGallery";
import { BookmarkToggle } from "@/components/listings/BookmarkToggle";
import { ReportDialog } from "@/components/listings/ReportDialog";
import { EnquiryButton } from "@/components/listings/EnquiryButton";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { Listing } from "@/components/listings/ListingCard";

export const dynamic = "force-dynamic";

interface ListingDetailPageProps {
  params: Promise<{ id: string }>;
}

const formatPrice = (price: number) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(price);

const typeClasses: Record<string, string> = {
  SALE: "bg-[#D4AF37] text-black border-transparent font-semibold",
  SHORT_TERM: "bg-blue-600 text-white border-transparent",
  MONTHLY: "bg-blue-600 text-white border-transparent",
  ANNUAL: "bg-blue-600 text-white border-transparent",
  LONG_TERM: "bg-blue-600 text-white border-transparent",
};

const typeLabels: Record<string, string> = {
  SALE: "For Sale",
  SHORT_TERM: "Short-Term Rental",
  MONTHLY: "Monthly Rental",
  ANNUAL: "Annual Lease",
  LONG_TERM: "Long-Term Lease",
};

function mapPrismaListing(raw: any): Listing {
  return {
    id: raw.id,
    title: raw.title,
    description: raw.description,
    price: raw.price,
    type: raw.type,
    leaseDuration: raw.leaseDuration ?? undefined,
    category: raw.category,
    status: raw.status,
    location: raw.location?.area || raw.location?.city || "",
    city: raw.location?.city ?? "",
    state: raw.location?.state ?? "",
    address: raw.location?.address,
    images: (raw.images ?? []).map((img: any) => img.url),
    createdAt: raw.createdAt?.toISOString(),
    phone: raw.user?.phone ?? undefined,
    sellerEmail: raw.user?.email ?? undefined,
    seller: raw.user?.name ? { name: raw.user.name, role: raw.user.role ?? "SELLER" } : undefined,
  };
}

async function getListing(id: string): Promise<Listing | null> {
  try {
    const raw = await prisma.listing.findUnique({
      where: { id },
      include: {
        images: {
          orderBy: { order: "asc" },
        },
        location: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            createdAt: true,
            phone: true,
          },
        },
      },
    });
    if (!raw) return null;
    return mapPrismaListing(raw);
  } catch (err) {
    console.error("getListing error:", err);
    return null;
  }
}

export async function generateMetadata({
  params,
}: ListingDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const listing = await getListing(id);

  if (!listing) {
    return { title: "Property Not Found | RealX World" };
  }

  const description = listing.description
    ? listing.description.slice(0, 160).replace(/\n/g, " ")
    : `${typeLabels[listing.type] ?? listing.type} — ${listing.category.toLowerCase()} property in ${listing.city}, ${listing.state}`;

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
  const [listing, session] = await Promise.all([getListing(id), auth()]);

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
                <Badge className={typeClasses[listing.type]}>{typeLabels[listing.type] ?? listing.type}</Badge>
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
              {listing.leaseDuration && (
                <span className="ml-1 text-lg font-normal text-muted-foreground">
                  / {listing.leaseDuration}
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
                {listing.leaseDuration && (
                  <span className="ml-1 text-sm font-normal text-muted-foreground">
                    / {listing.leaseDuration}
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

            <EnquiryButton
              listingId={listing.id}
              sellerPhone={listing.phone}
              sellerEmail={listing.sellerEmail}
              paymentsEnabled={false}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
