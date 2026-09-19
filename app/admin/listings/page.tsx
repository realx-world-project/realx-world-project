import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { Metadata } from "next";
import { format } from "date-fns";
import { House } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead,
  TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Pagination, PaginationContent, PaginationItem,
  PaginationLink, PaginationNext, PaginationPrevious,
} from "@/components/ui/pagination";
import {
  AdminListingFilters,
  ListingActionsCell,
  listingStatusVariants,
  type AdminListingRow,
} from "./listing-client";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Listing Moderation | RealX Admin",
};

const PAGE_SIZE = 20;
const VALID_STATUSES = ["PENDING", "APPROVED", "REJECTED", "PUBLISHED"];
const VALID_CATEGORIES = ["RESIDENTIAL", "COMMERCIAL", "LAND"];

interface SearchParams {
  status?: string;
  category?: string;
  q?: string;
  page?: string;
}

interface AdminListingsPageProps {
  searchParams: Promise<SearchParams>;
}

const formatPrice = (n: number) =>
  new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(n);

function safeFormat(date: string | Date | null | undefined, fmt: string): string {
  try {
    if (!date) return "—";
    const d = new Date(date);
    if (isNaN(d.getTime())) return "—";
    return format(d, fmt);
  } catch {
    return "—";
  }
}

// Converts a raw Prisma row into the plain-string AdminListingRow shape
// listing-client.tsx expects — every enum and date is explicitly stringified
// here so nothing but plain serializable data crosses to the client component.
function serializeListing(l: any): AdminListingRow {
  return {
    id: l.id,
    title: l.title,
    city: l.location?.city ?? "",
    state: l.location?.state ?? "",
    sellerName: l.user?.name ?? "Unknown",
    sellerEmail: l.user?.email ?? "—",
    category: String(l.category),
    price: l.price,
    status: String(l.status),
    imageUrl: l.images?.[0]?.url ?? null,
    createdAt: l.createdAt instanceof Date ? l.createdAt.toISOString() : String(l.createdAt ?? ""),
  };
}

export default async function AdminListingsPage({ searchParams }: AdminListingsPageProps) {
  const session = await auth();
  if (!session || (session.user as any).role !== "ADMIN") redirect("/login");

  const params = await searchParams;
  const statusFilter = VALID_STATUSES.includes(params.status ?? "") ? params.status! : "";
  const categoryFilter = VALID_CATEGORIES.includes(params.category ?? "") ? params.category! : "";
  const search = params.q?.trim() ?? "";
  const page = Math.max(1, Number(params.page ?? 1));

  const whereClause: Record<string, unknown> = {
    ...(statusFilter && { status: statusFilter }),
    ...(categoryFilter && { category: categoryFilter }),
    ...(search && { title: { contains: search, mode: "insensitive" } }),
  };

  let listings: AdminListingRow[] = [];
  let totalPages = 1;

  try {
    const db: any = prisma;
    const [rows, total] = await Promise.all([
      db.listing.findMany({
        where: whereClause,
        skip: (page - 1) * PAGE_SIZE,
        take: PAGE_SIZE,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          title: true,
          price: true,
          type: true,
          category: true,
          status: true,
          createdAt: true,
          images: {
            where: { isPrimary: true },
            take: 1,
            select: { url: true },
          },
          location: {
            select: { state: true, city: true, area: true },
          },
          user: {
            select: { name: true, email: true },
          },
        },
      }),
      db.listing.count({ where: whereClause }),
    ]);

    listings = rows.map(serializeListing);
    totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  } catch (err) {
    console.error("[admin/listings] render error:", err);
    throw err; // re-throw so the error boundary still catches it
  }

  const pageHref = (n: number) => {
    const qs = new URLSearchParams({ page: String(n) });
    if (statusFilter) qs.set("status", statusFilter);
    if (categoryFilter) qs.set("category", categoryFilter);
    if (search) qs.set("q", search);
    return `/admin/listings?${qs}`;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold sm:text-3xl">Listing Moderation</h1>
        <p className="mt-1 text-muted-foreground">Review and moderate property listings</p>
      </div>

      <Suspense>
        <AdminListingFilters />
      </Suspense>

      {listings.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20">
          <House className="h-16 w-16 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold">No listings found</h3>
          <p className="mt-2 text-sm text-muted-foreground">Try a different filter</p>
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden overflow-x-auto rounded-lg border md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Listing</TableHead>
                  <TableHead>Seller</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {listings.map((listing) => (
                  <TableRow key={listing.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-[60px] w-[60px] flex-shrink-0 overflow-hidden rounded-md bg-muted">
                          {listing.imageUrl ? (
                            <img src={listing.imageUrl} alt="" className="h-full w-full object-cover" />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center">
                              <House className="h-5 w-5 text-muted-foreground" />
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="line-clamp-1 font-medium">{listing.title}</p>
                          <p className="text-sm text-muted-foreground">{listing.city}, {listing.state}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm font-medium">{listing.sellerName}</p>
                      <p className="text-xs text-muted-foreground">{listing.sellerEmail}</p>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{listing.category}</Badge>
                    </TableCell>
                    <TableCell className="tabular-nums">{formatPrice(listing.price)}</TableCell>
                    <TableCell>
                      <Badge variant={listingStatusVariants[listing.status] ?? "default"}>
                        {listing.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {safeFormat(listing.createdAt, "MMM d, yyyy")}
                    </TableCell>
                    <TableCell className="text-right">
                      <ListingActionsCell listing={listing} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Mobile cards */}
          <div className="space-y-3 md:hidden">
            {listings.map((listing) => (
              <div key={listing.id} className="flex items-start justify-between rounded-lg border p-4">
                <div className="flex-1">
                  <p className="line-clamp-1 font-medium">{listing.title}</p>
                  <p className="text-sm text-muted-foreground">{listing.city}, {listing.state}</p>
                  <p className="text-sm text-muted-foreground">{listing.sellerName}</p>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <Badge variant={listingStatusVariants[listing.status] ?? "default"}>{listing.status}</Badge>
                    <Badge variant="outline">{listing.category}</Badge>
                    <span className="text-xs text-muted-foreground">{formatPrice(listing.price)}</span>
                  </div>
                </div>
                <ListingActionsCell listing={listing} />
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href={page > 1 ? pageHref(page - 1) : "#"}
                    aria-disabled={page <= 1}
                  />
                </PaginationItem>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                  <PaginationItem key={n}>
                    <PaginationLink href={pageHref(n)} isActive={n === page}>{n}</PaginationLink>
                  </PaginationItem>
                ))}
                <PaginationItem>
                  <PaginationNext
                    href={page < totalPages ? pageHref(page + 1) : "#"}
                    aria-disabled={page >= totalPages}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </>
      )}
    </div>
  );
}
