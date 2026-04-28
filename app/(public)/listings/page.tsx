import { Suspense } from "react";
import { Metadata } from "next";
import { ListingCard, Listing } from "@/components/listings/ListingCard";
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

// Mock data for listings (when API is unavailable)
const mockListings: Listing[] = [
  {
    id: "1",
    title: "3 Bedroom Flat in Lekki",
    price: 15000000,
    type: "SALE",
    category: "RESIDENTIAL",
    status: "PUBLISHED",
    location: "Lekki",
    city: "Lekki",
    state: "Lagos",
    images: [],
  },
  {
    id: "2",
    title: "Luxury 4-Bedroom Detached House in Banana Island",
    price: 250000000,
    type: "SALE",
    category: "RESIDENTIAL",
    status: "PUBLISHED",
    location: "Banana Island, Ikoyi",
    city: "Lagos",
    state: "Lagos",
    images: ["/placeholder.jpg"],
    seller: { name: "John Doe", role: "AGENT" },
  },
  {
    id: "3",
    title: "Modern 3-Bedroom Flat in Victoria Island",
    price: 85000000,
    type: "RENT",
    category: "RESIDENTIAL",
    status: "PUBLISHED",
    location: "Victoria Island",
    city: "Lagos",
    state: "Lagos",
    images: [],
    seller: { name: "Jane Smith", role: "SELLER" },
  },
  {
    id: "4",
    title: "Commercial Plot of Land in Lekki",
    price: 150000000,
    type: "SALE",
    category: "LAND",
    status: "PUBLISHED",
    location: "Lekki Peninsula",
    city: "Lagos",
    state: "Lagos",
    images: [],
    seller: { name: "Mike Johnson", role: "AGENT" },
  },
  {
    id: "5",
    title: "2 Bedroom Apartment in Ikeja GRA",
    price: 6500000,
    type: "RENT",
    category: "RESIDENTIAL",
    status: "PUBLISHED",
    location: "Ikeja GRA",
    city: "Ikeja",
    state: "Lagos",
    images: [],
    seller: { name: "Amaka Osei", role: "SELLER" },
  },
  {
    id: "6",
    title: "5 Bedroom Duplex in Asokoro",
    price: 180000000,
    type: "SALE",
    category: "RESIDENTIAL",
    status: "PUBLISHED",
    location: "Asokoro",
    city: "Abuja",
    state: "FCT",
    images: [],
    seller: { name: "Emeka Eze", role: "AGENT" },
  },
];

interface SearchParams {
  q?: string;
  type?: string;
  category?: string;
  state?: string;
  priceMin?: string;
  priceMax?: string;
  page?: string;
}

interface ListingsPageProps {
  searchParams: Promise<SearchParams>;
}

export const metadata: Metadata = {
  title: "Browse Properties | RealX World",
  description:
    "Find houses, land, and commercial properties for sale and rent in Nigeria",
};

async function fetchListings(params: SearchParams) {
  try {
    const searchParams = new URLSearchParams();
    
    if (params.q) searchParams.set("q", params.q);
    if (params.type) searchParams.set("type", params.type);
    if (params.category) searchParams.set("category", params.category);
    if (params.state) searchParams.set("state", params.state);
    if (params.priceMin) searchParams.set("priceMin", params.priceMin);
    if (params.priceMax) searchParams.set("priceMax", params.priceMax);
    searchParams.set("page", params.page || "1");
    searchParams.set("limit", "12");

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/listings/search?${searchParams.toString()}`,
      { cache: "no-store" }
    );

    if (!response.ok) {
      throw new Error("API unavailable");
    }

    return await response.json();
  } catch (error) {
    console.error("Failed to fetch listings:", error);
    return { listings: [], total: 0, page: 1, totalPages: 1 };
  }
}

async function ListingsContent({ searchParams }: ListingsPageProps) {
  const params = await searchParams;
  const page = parseInt(params.page || "1");
  
  const data = await fetchListings(params);
  const listings: Listing[] = data.listings?.length > 0 ? data.listings : mockListings;
  const totalPages = data.totalPages || 1;
  const total = data.total || listings.length;

  // Filter mock data based on search params
  let filteredListings = listings;
  if (data.listings?.length === 0) {
    filteredListings = mockListings.filter((listing) => {
      if (params.type && listing.type !== params.type) return false;
      if (params.category && listing.category !== params.category) return false;
      if (params.state && listing.state !== params.state) return false;
      if (params.q) {
        const query = params.q.toLowerCase();
        if (!listing.title.toLowerCase().includes(query) && 
            !listing.location.toLowerCase().includes(query)) {
          return false;
        }
      }
      if (params.priceMin && listing.price < parseInt(params.priceMin)) return false;
      if (params.priceMax && listing.price > parseInt(params.priceMax)) return false;
      return true;
    });
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Page Title */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold sm:text-3xl">Browse Properties</h1>
        <p className="mt-2 text-muted-foreground">
          Find your dream property in Nigeria
        </p>
      </div>

      {/* Search Bar */}
      <div className="mb-8">
        <SearchBar />
      </div>

      {/* Results Count */}
      <div className="mb-6">
        <p className="text-sm text-muted-foreground">
          {filteredListings.length} {filteredListings.length === 1 ? "property" : "properties"} found
        </p>
      </div>

      {/* Listings Grid */}
      {filteredListings.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredListings.map((listing) => (
            <ListingCard
              key={listing.id}
              listing={listing}
              isSaved={false}
              isAuthenticated={false}
            />
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="flex flex-col items-center justify-center py-16">
          <House className="h-16 w-16 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold">No listings found</h3>
          <p className="mt-2 text-center text-muted-foreground">
            Try adjusting your filters to find more properties
          </p>
        </div>
      )}

      {/* Pagination */}
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