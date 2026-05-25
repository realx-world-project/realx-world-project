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
import { prisma } from "@/lib/prisma";


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

async function getListings(params: SearchParams): Promise<{
  listings: Listing[];
  total: number;
  page: number;
  totalPages: number;
}> {
  try {
    const page = Math.max(1, parseInt(params.page ?? "1", 10));
    const limit = 12;
    const skip = (page - 1) * limit;

    const where: any = { status: "PUBLISHED" };

    if (params.type && params.type !== "all") where.type = params.type;
    if (params.category && params.category !== "all") where.category = params.category;
    if (params.q) {
      where.OR = [
        { title: { contains: params.q, mode: "insensitive" } },
        { description: { contains: params.q, mode: "insensitive" } },
      ];
    }
    if (params.state && params.state !== "all") {
      where.location = { state: { contains: params.state, mode: "insensitive" } };
    }
    if (params.priceMin || params.priceMax) {
      where.price = {};
      if (params.priceMin) where.price.gte = Number(params.priceMin);
      if (params.priceMax) where.price.lte = Number(params.priceMax);
    }

    const [rows, total] = await Promise.all([
      prisma.listing.findMany({
        where,
        skip,
        take: limit,
        orderBy: { publishedAt: "desc" },
        include: {
          images: { where: { isPrimary: true }, take: 1 },
          location: true,
        },
      }),
      prisma.listing.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      listings: rows.map((l) => ({
        id: l.id,
        title: l.title,
        price: l.price,
        type: l.type,
        category: l.category,
        status: l.status,
        location: l.location?.city ?? "",
        city: l.location?.city ?? "",
        state: l.location?.state ?? "",
        address: l.location?.address ?? undefined,
        images: l.images.map((img) => img.url),
        createdAt: l.createdAt.toISOString(),
      })),
      total,
      totalPages,
      page,
    };
  } catch (err) {
    console.error("getListings error:", err);
    return { listings: [], total: 0, totalPages: 1, page: 1 };
  }
}

async function ListingsContent({ searchParams }: ListingsPageProps) {
  const params = await searchParams;
  const { listings, total, totalPages, page } = await getListings(params);

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
