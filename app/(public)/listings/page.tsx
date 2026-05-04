import { Suspense } from "react";
import { Metadata } from "next";
import { ListingCard, type Listing } from "@/components/listings/ListingCard";
import { SearchBar } from "@/components/listings/SearchBar";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { House } from "lucide-react";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Browse Properties | RealX World",
  description:
    "Find houses, land, and commercial properties for sale and rent in Nigeria",
};

interface SearchParams {
  q?: string;
  type?: string;
  category?: string;
  state?: string;
  // SearchBar sends priceMin/priceMax in the URL
  priceMin?: string;
  priceMax?: string;
  page?: string;
}

interface ListingsPageProps {
  searchParams: Promise<SearchParams>;
}

function mapApiListing(raw: any): Listing {
  return {
    id: raw.id,
    title: raw.title,
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
  };
}

async function fetchListings(
  params: SearchParams
): Promise<{ listings: Listing[]; total: number; page: number; totalPages: number }> {
  try {
    const qs = new URLSearchParams();
    if (params.q) qs.set("q", params.q);
    if (params.type) qs.set("type", params.type);
    if (params.category) qs.set("category", params.category);
    if (params.state) qs.set("state", params.state);
    // Translate URL param names to API schema names
    if (params.priceMin) qs.set("minPrice", params.priceMin);
    if (params.priceMax) qs.set("maxPrice", params.priceMax);
    qs.set("page", params.page ?? "1");
    qs.set("limit", "12");

    const res = await fetch(`${BASE_URL}/api/listings/search?${qs.toString()}`, {
      cache: "no-store",
    });
    if (!res.ok) return { listings: [], total: 0, page: 1, totalPages: 1 };

    const data = await res.json();
    return {
      listings: (data.listings ?? []).map(mapApiListing),
      total: data.total ?? 0,
      page: data.page ?? 1,
      totalPages: data.totalPages ?? 1,
    };
  } catch {
    return { listings: [], total: 0, page: 1, totalPages: 1 };
  }
}

async function ListingsContent({ searchParams }: ListingsPageProps) {
  const params = await searchParams;
  const page = parseInt(params.page ?? "1", 10);
  const { listings, total, totalPages } = await fetchListings(params);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold sm:text-3xl">Browse Properties</h1>
        <p className="mt-2 text-muted-foreground">Find your dream property in Nigeria</p>
      </div>

      <div className="mb-8">
        <SearchBar />
      </div>

      <div className="mb-6">
        <p className="text-sm text-muted-foreground">
          {total} {total === 1 ? "property" : "properties"} found
        </p>
      </div>

      {listings.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {listings.map((listing) => (
            <ListingCard
              key={listing.id}
              listing={listing}
              isSaved={false}
              isAuthenticated={false}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16">
          <House className="h-16 w-16 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold">No listings found</h3>
          <p className="mt-2 text-center text-muted-foreground">
            Try adjusting your filters to find more properties
          </p>
        </div>
      )}

      {totalPages > 1 && (
        <div className="mt-8">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href={page > 1 ? `/listings?page=${page - 1}` : "#"}
                  aria-disabled={page <= 1}
                />
              </PaginationItem>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                <PaginationItem key={pageNum}>
                  <PaginationLink
                    href={`/listings?page=${pageNum}`}
                    isActive={pageNum === page}
                  >
                    {pageNum}
                  </PaginationLink>
                </PaginationItem>
              ))}
              <PaginationItem>
                <PaginationNext
                  href={page < totalPages ? `/listings?page=${page + 1}` : "#"}
                  aria-disabled={page >= totalPages}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
}

function ListingsLoading() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="mt-2 h-5 w-96" />
      </div>
      <div className="mb-8">
        <Skeleton className="h-12 w-full" />
      </div>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="space-y-3">
            <Skeleton className="h-[200px] w-full" />
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default async function ListingsPage({ searchParams }: ListingsPageProps) {
  return (
    <Suspense fallback={<ListingsLoading />}>
      <ListingsContent searchParams={searchParams} />
    </Suspense>
  );
}
