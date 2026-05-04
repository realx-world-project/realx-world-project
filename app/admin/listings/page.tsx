import { auth } from "@/lib/auth";
import { cookies } from "next/headers";
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
import { TableSkeleton } from "@/components/admin/TableSkeleton";
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

export const metadata: Metadata = {
  title: "Listing Moderation | RealX Admin",
};

interface SearchParams {
  status?: string;
  category?: string;
  page?: string;
}

interface AdminListingsPageProps {
  searchParams: Promise<SearchParams>;
}

const formatPrice = (n: number) =>
  new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(n);

function mapRow(raw: any): AdminListingRow {
  return {
    id: raw.id,
    title: raw.title,
    city: raw.location?.city || "",
    state: raw.location?.state || "",
    sellerName: raw.user?.name || "",
    sellerEmail: raw.user?.email || "",
    category: raw.category,
    price: raw.price,
    status: raw.status,
    imageUrl: raw.images?.[0]?.url ?? null,
    createdAt: raw.createdAt,
  };
}

const LISTINGS_HEADERS = ["Listing", "Seller", "Category", "Price", "Status", "Date", "Actions"];

export default async function AdminListingsPage({ searchParams }: AdminListingsPageProps) {
  const session = await auth();
  if (!session || (session.user as any).role !== "ADMIN") redirect("/login");

  const params = await searchParams;
  const statusFilter = params.status ?? "";
  const categoryFilter = params.category ?? "";
  const page = Math.max(1, Number(params.page ?? 1));

  const base = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL || "http://localhost:3000";
  const cookieStore = cookies();
  const cookieHeader = cookieStore.getAll().map((c) => `${c.name}=${c.value}`).join("; ");
  const opts = { headers: { Cookie: cookieHeader }, cache: "no-store" as const };

  let listings: AdminListingRow[] = [];
  let totalPages = 1;

  try {
    const qs = new URLSearchParams({ page: String(page) });
    if (statusFilter) qs.set("status", statusFilter);
    if (categoryFilter) qs.set("category", categoryFilter);

    const res = await fetch(`${base}/api/admin/listings?${qs}`, opts);
    if (res.ok) {
      const data = await res.json();
      listings = (data.listings ?? []).map(mapRow);
      totalPages = data.totalPages ?? 1;
    }
  } catch {}

  const pageHref = (n: number) => {
    const qs = new URLSearchParams({ page: String(n) });
    if (statusFilter) qs.set("status", statusFilter);
    if (categoryFilter) qs.set("category", categoryFilter);
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
                      {format(new Date(listing.createdAt), "MMM d, yyyy")}
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
