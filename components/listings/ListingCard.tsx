"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MapPin, Bookmark, Home } from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface Listing {
  id: string;
  title: string;
  description?: string;
  price: number;
  type: "SALE" | "RENT";
  category: "RESIDENTIAL" | "COMMERCIAL" | "LAND";
  status: "PENDING" | "APPROVED" | "PUBLISHED" | "REJECTED";
  location: string;
  city: string;
  state: string;
  address?: string;
  images: string[];
  createdAt?: string;
  phone?: string;
  seller?: {
    name: string;
    role: string;
  };
}

export interface ListingCardProps {
  listing: Listing;
  isSaved?: boolean;
  onBookmarkToggle?: (listingId: string) => void;
  isAuthenticated?: boolean;
}

const formatPrice = (price: number): string =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(price);

const statusOverlayClasses = {
  PENDING: "bg-yellow-500 text-white",
  APPROVED: "bg-blue-600 text-white",
  REJECTED: "bg-red-600 text-white",
} as const;

const typeClasses = {
  SALE: "bg-blue-600 hover:bg-blue-700 text-white border-transparent",
  RENT: "bg-green-600 hover:bg-green-700 text-white border-transparent",
} as const;

export function ListingCard({
  listing,
  isSaved = false,
  onBookmarkToggle,
  isAuthenticated = false,
}: ListingCardProps) {
  const router = useRouter();
  const primaryImage = listing.images?.[0] ?? null;

  const handleBookmarkClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }
    onBookmarkToggle?.(listing.id);
  };

  return (
    <Link href={`/listings/${listing.id}`} className="block">
      <Card className="group overflow-hidden rounded-xl shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-0.5">
        {/* Image */}
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted">
          {primaryImage ? (
            <Image
              src={primaryImage}
              alt={listing.title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-muted">
              <Home className="h-12 w-12 text-muted-foreground/50" />
              <span className="text-xs text-muted-foreground">No image</span>
            </div>
          )}

          {/* Status badge — top-right, only if not PUBLISHED */}
          {listing.status !== "PUBLISHED" && (
            <span
              className={cn(
                "absolute right-2 top-2 rounded-full px-2.5 py-0.5 text-xs font-semibold",
                statusOverlayClasses[listing.status as keyof typeof statusOverlayClasses]
              )}
            >
              {listing.status}
            </span>
          )}

          {/* Bookmark button */}
          {isAuthenticated && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-2 top-2 h-8 w-8 rounded-full bg-white/90 hover:bg-white"
              onClick={handleBookmarkClick}
              aria-label={isSaved ? "Remove bookmark" : "Save listing"}
            >
              <Bookmark
                className={cn(
                  "h-4 w-4",
                  isSaved ? "fill-primary text-primary" : "text-muted-foreground"
                )}
              />
            </Button>
          )}
        </div>

        {/* Body */}
        <CardContent className="p-4">
          <p className="mb-1 text-xl font-bold text-primary">
            {formatPrice(listing.price)}
            {listing.type === "RENT" && (
              <span className="ml-1 text-sm font-normal text-muted-foreground">/yr</span>
            )}
          </p>
          <h3 className="mb-2 line-clamp-2 text-base font-medium leading-snug">
            {listing.title}
          </h3>
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
            <span className="truncate">
              {listing.city}, {listing.state}
            </span>
          </div>
        </CardContent>

        {/* Footer */}
        <CardFooter className="flex gap-2 border-t p-4 pt-3">
          <Badge className={typeClasses[listing.type]}>{listing.type}</Badge>
          <Badge variant="outline" className="text-muted-foreground">
            {listing.category}
          </Badge>
        </CardFooter>
      </Card>
    </Link>
  );
}
