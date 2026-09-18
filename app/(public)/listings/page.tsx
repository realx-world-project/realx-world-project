import { Suspense } from "react";
import { Metadata } from "next";
import Link from "next/link";
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
import { cn } from "@/lib/utils";


export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Browse Properties | RealX World",
  description:
    "Find houses, land, and commercial properties for sale and rent in Nigeria",
};

interface SearchParams {
  q?: string;
  type?: string;
  listingGroup?: string;
  category?: string;
  state?: string;
  // SearchBar sends priceMin/priceMax in the URL
  priceMin?: string;
  priceMax?: string;
  page?: string;
}

const RENTAL_TYPES = ["SHORT_TERM", "MONTHLY", "ANNUAL", "LONG_TERM"];

const TYPE_LABELS: Record<string, string> = {
  SALE: "For Sale",
  SHORT_TERM: "Short-Term Rentals",
  MONTHLY: "Monthly Rentals",
  ANNUAL: "Annual Leases",
  LONG_TERM: "Long-Term Leases",
};

function buildListingsHref(
  params: SearchParams,
  overrides: { type?: string; listingGroup?: string }
): string {
  const newParams = new URLSearchParams();
  if (params.q) newParams.set("q", params.q);
  if (params.category && params.category !== "all") newParams.set("category", params.category);
  if (params.state && params.state !== "all") newParams.set("state", params.state);
  if (params.priceMin) newParams.set("priceMin", params.priceMin);
  if (params.priceMax) newParams.set("priceMax", params.priceMax);
  if (overrides.type) newParams.set("type", overrides.type);
  if (overrides.listingGroup) newParams.set("listingGroup", overrides.listingGroup);
  return `/listings?${newParams.toString()}`;
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

    if (params.type && params.type !== "all") {
      where.type = params.type;
    } else if (params.listingGroup === "RENT") {
      where.type = { in: RENTAL_TYPES };
    }
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
      listings: rows.map((l: any) => ({
        id: l.id,
        title: l.title,
        price: l.price,
        type: l.type as Listing["type"],
        category: l.category as Listing["category"],
        status: l.status as Listing["status"],
        location: l.location?.city ?? "",
        city: l.location?.city ?? "",
        state: l.location?.state ?? "",
        address: l.location?.address ?? undefined,
        images: l.images.map((img: any) => img.url),
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

  const currentType = params.type ?? "all";
  const isRentalGroup = params.listingGroup === "RENT";

  const heading =
    currentType !== "all" && TYPE_LABELS[currentType]
      ? TYPE_LABELS[currentType]
      : isRentalGroup
      ? "Rentals"
      : "Browse Properties";

  const subheading =
    currentType === "SALE"
      ? "Find properties available for purchase across Nigeria"
      : isRentalGroup || RENTAL_TYPES.includes(currentType)
      ? "Find rental properties available across Nigeria"
      : "Find your dream property in Nigeria";

  const primaryTabs = [
    {
      label: "All Properties",
      active: currentType === "all" && !isRentalGroup,
      href: buildListingsHref(params, {}),
    },
    {
      label: "For Sale",
      active: currentType === "SALE",
      href: buildListingsHref(params, { type: "SALE" }),
    },
    {
      label: "Rentals",
      active: isRentalGroup,
      href: buildListingsHref(params, { listingGroup: "RENT" }),
    },
  ];

  const rentalSubTabs = [
    { label: "All Rentals", value: "" },
    { label: "Short-Term", value: "SHORT_TERM" },
    { label: "Monthly", value: "MONTHLY" },
    { label: "Annual", value: "ANNUAL" },
    { label: "Long-Term", value: "LONG_TERM" },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold sm:text-3xl">{heading}</h1>
        <p className="mt-2 text-muted-foreground">{subheading}</p>
      </div>

      <div className="mb-6 flex gap-1 border-b border-gray-200">
        {primaryTabs.map((tab) => (
          <Link
            key={tab.label}
            href={tab.href}
            className={cn(
              "px-6 py-3 text-sm font-semibold transition-colors border-b-2 -mb-px",
              tab.active
                ? "border-[#D4AF37] text-[#D4AF37]"
                : "border-transparent text-gray-500 hover:text-gray-800 hover:border-gray-300"
            )}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      {isRentalGroup && (
        <div className="mb-6 flex flex-wrap gap-2">
          {rentalSubTabs.map((tab) => {
            const isActive = tab.value ? currentType === tab.value : currentType === "all";
            return (
              <Link
                key={tab.label}
                href={buildListingsHref(params, { listingGroup: "RENT", type: tab.value || undefined })}
                className={cn(
                  "rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-[#D4AF37] text-black"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                )}
              >
                {tab.label}
              </Link>
            );
          })}
        </div>
      )}

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
                  href={
                    page > 1
                      ? `/listings?page=${page - 1}${
                          currentType !== "all" ? `&type=${currentType}` : ""
                        }${isRentalGroup ? "&listingGroup=RENT" : ""}`
                      : "#"
                  }
                  aria-disabled={page <= 1}
                />
              </PaginationItem>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                <PaginationItem key={pageNum}>
                  <PaginationLink
                    href={`/listings?page=${pageNum}${
                      currentType !== "all" ? `&type=${currentType}` : ""
                    }${isRentalGroup ? "&listingGroup=RENT" : ""}`}
                    isActive={pageNum === page}
                  >
                    {pageNum}
                  </PaginationLink>
                </PaginationItem>
              ))}
              <PaginationItem>
                <PaginationNext
                  href={
                    page < totalPages
                      ? `/listings?page=${page + 1}${
                          currentType !== "all" ? `&type=${currentType}` : ""
                        }${isRentalGroup ? "&listingGroup=RENT" : ""}`
                      : "#"
                  }
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
