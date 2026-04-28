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
import type { Listing } from "@/components/listings/ListingCard";

interface ListingDetailPageProps {
  params: Promise<{ id: string }>;
}

const mockListing: Listing = {
  id: "mock-1",
  title: "Luxury 4-Bedroom Detached House in Banana Island",
  description: `This stunning luxury detached house is located in the prestigious Banana Island, Ikoyi, Lagos.

The property features:
- 4 spacious bedrooms with en-suite bathrooms
- Modern fully fitted kitchen with island counter
- Large living and dining areas
- Private swimming pool
- 24/7 security and gated estate
- Ample parking space
- Well-manicured gardens

Perfect for families looking for premium living in Lagos's most exclusive neighborhood.`,
  price: 250_000_000,
  type: "SALE",
  category: "RESIDENTIAL",
  status: "PUBLISHED",
  location: "Banana Island, Ikoyi",
  city: "Lagos",
  state: "Lagos",
  address: "Plot 123, Banana Island Road, Ikoyi",
  images: ["/placeholder.jpg"],
  createdAt: "2024-01-15T10:00:00Z",
  seller: { name: "John Doe", role: "AGENT" },
  phone: "+234 800 123 4567",
};

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

async function fetchListing(id: string): Promise<Listing | null> {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/api/listings/${id}`,
      { cache: "no-store" }
    );
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: ListingDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const listing = await fetchListing(id);
  const data = listing ?? (id === "mock-1" ? mockListing : null);

  if (!data) {
    return { title: "Property Not Found | RealX World" };
  }

  const description = data.description
    ? data.description.slice(0, 160).replace(/\n/g, " ")
    : `${data.type === "RENT" ? "For Rent" : "For Sale"} — ${data.category.toLowerCase()} property in ${data.city}, ${data.state}`;

  return {
    title: `${data.title} | RealX World`,
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

export default async function ListingDetailPage({ params }: ListingDetailPageProps) {
  const { id } = await params;
  const listing = await fetchListing(id);

  // Use mock only for the designated mock id; otherwise show not-found
  const data: Listing | null = listing ?? (id === "mock-1" ? mockListing : null);

  if (!data) return <NotFound />;

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
          <ImageGallery images={data.images} title={data.title} />

          <div className="mt-8 space-y-6">
            {/* Badges + title */}
            <div>
              <div className="mb-3 flex flex-wrap gap-2">
                <Badge className={typeClasses[data.type]}>{data.type}</Badge>
                <Badge variant="outline">{data.category}</Badge>
              </div>
              <h1 className="text-2xl font-bold sm:text-3xl">{data.title}</h1>
              <div className="mt-2 flex items-center gap-1 text-muted-foreground">
                <MapPin className="h-4 w-4 flex-shrink-0" />
                <span>{data.address ?? `${data.location}, ${data.city}, ${data.state}`}</span>
              </div>
            </div>

            {/* Price */}
            <p className="text-2xl font-bold text-primary sm:text-3xl">
              {formatPrice(data.price)}
              {data.type === "RENT" && (
                <span className="ml-1 text-lg font-normal text-muted-foreground">/year</span>
              )}
            </p>

            <Separator />

            {/* Description */}
            <div>
              <h2 className="mb-3 text-xl font-semibold">Description</h2>
              <div className="whitespace-pre-wrap text-muted-foreground leading-relaxed">
                {data.description}
              </div>
            </div>

            <Separator />

            {/* Listed by */}
            <div>
              <h2 className="mb-3 text-xl font-semibold">Listed By</h2>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                  <User className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="font-medium">{data.seller?.name ?? "Unknown"}</p>
                  <p className="text-sm text-muted-foreground capitalize">
                    {data.seller?.role?.toLowerCase() ?? "seller"}
                  </p>
                </div>
              </div>
            </div>

            {/* Date */}
            {data.createdAt && (
              <>
                <Separator />
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>Listed on {format(new Date(data.createdAt), "MMMM d, yyyy")}</span>
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
                {formatPrice(data.price)}
                {data.type === "RENT" && (
                  <span className="ml-1 text-sm font-normal text-muted-foreground">/yr</span>
                )}
              </p>
              <Separator className="mt-3" />
            </div>

            <BookmarkToggle listingId={data.id} showLabel />

            <ReportDialog listingId={data.id} listingTitle={data.title} />

            {data.phone ? (
              <Button className="w-full" size="lg">
                <Phone className="mr-2 h-4 w-4" />
                {data.phone}
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
