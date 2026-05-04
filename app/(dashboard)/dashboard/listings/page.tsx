import { auth } from "@/lib/auth";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { Metadata } from "next";
import Link from "next/link";
import { format } from "date-fns";
import { Plus, Eye } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { type Listing } from "@/components/listings/ListingCard";
import { House } from "lucide-react";

interface SearchParams {
  status?: string;
  page?: string;
}

interface MyListingsPageProps {
  searchParams: Promise<SearchParams>;
}

export const metadata: Metadata = {
  title: "My Listings | RealX World",
  description: "Manage your property listings",
};

const formatPrice = (price: number) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(price);

const statusVariants: Record<string, "warning" | "default" | "success" | "destructive"> = {
  PENDING: "warning",
  APPROVED: "default",
  PUBLISHED: "success",
  REJECTED: "destructive",
};

function mapListing(raw: any): Listing {
  return {
    id: raw.id,
    title: raw.title,
    price: raw.price,
    type: raw.type,
    category: raw.category,
    status: raw.status,
    location: raw.location?.area || raw.location?.city || "",
    city: raw.location?.city || "",
    state: raw.location?.state || "",
    address: raw.location?.address,
    images: (raw.images ?? []).map((img: any) => img.url),
    createdAt: raw.createdAt,
  };
}

async function ListingsContent({ searchParams }: MyListingsPageProps) {
  const params = await searchParams;
  const statusFilter = params.status?.toUpperCase();
  const page = Math.max(1, Number(params.page ?? 1));

  const base = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const cookieStore = cookies();
  const cookieHeader = cookieStore.getAll().map((c) => `${c.name}=${c.value}`).join("; ");
  const opts = { headers: { Cookie: cookieHeader }, cache: "no-store" as const };

  let listings: Listing[] = [];
  let total = 0;
  let totalPages = 1;
  let pendingCount = 0;
  let publishedCount = 0;
  let rejectedCount = 0;

  try {
    const statusQuery = statusFilter ? `&status=${statusFilter}` : "";

    const [listingsRes, pendingRes, publishedRes, rejectedRes] = await Promise.all([
      fetch(`${base}/api/user/listings?page=${page}${statusQuery}`, opts),
      fetch(`${base}/api/user/listings?status=PENDING&limit=1`, opts),
      fetch(`${base}/api/user/listings?status=PUBLISHED&limit=1`, opts),
      fetch(`${base}/api/user/listings?status=REJECTED&limit=1`, opts),
    ]);

    if (listingsRes.ok) {
      const d = await listingsRes.json();
      listings = (d.listings ?? []).map(mapListing);
      total = d.total ?? 0;
      totalPages = d.totalPages ?? 1;
    }
    if (pendingRes.ok) pendingCount = (await pendingRes.json()).total ?? 0;
    if (publishedRes.ok) publishedCount = (await publishedRes.json()).total ?? 0;
    if (rejectedRes.ok) rejectedCount = (await rejectedRes.json()).total ?? 0;
  } catch {}

  const allCount = pendingCount + publishedCount + rejectedCount;
  const activeTab = statusFilter || "all";

  const tabItems = [
    { value: "all", label: "All", count: allCount, href: "/dashboard/listings" },
    { value: "PENDING", label: "Pending", count: pendingCount, href: "/dashboard/listings?status=PENDING" },
    { value: "PUBLISHED", label: "Published", count: publishedCount, href: "/dashboard/listings?status=PUBLISHED" },
    { value: "REJECTED", label: "Rejected", count: rejectedCount, href: "/dashboard/listings?status=REJECTED" },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Page Header */}
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold sm:text-3xl">My Listings</h1>
          <p className="mt-2 text-muted-foreground">Manage your property listings</p>
        </div>
        <Link href="/dashboard/listings/new">
          <Button className="w-full sm:w-auto">
            <Plus className="mr-2 h-4 w-4" />
            Add Listing
          </Button>
        </Link>
      </div>

      {/* URL-based tab navigation */}
      <div className="mb-6 inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground">
        {tabItems.map((tab) => (
          <Link
            key={tab.value}
            href={tab.href}
            className={cn(
              "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
              activeTab === tab.value
                ? "bg-background text-foreground shadow-sm"
                : "hover:bg-background/50"
            )}
          >
            {tab.label} ({tab.count})
          </Link>
        ))}
      </div>

      {/* Listings table */}
      <ListingsTable listings={listings} />

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-center gap-3">
          {page > 1 && (
            <Link
              href={`/dashboard/listings?${statusFilter ? `status=${statusFilter}&` : ""}page=${page - 1}`}
            >
              <Button variant="outline" size="sm">Previous</Button>
            </Link>
          )}
          <span className="text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </span>
          {page < totalPages && (
            <Link
              href={`/dashboard/listings?${statusFilter ? `status=${statusFilter}&` : ""}page=${page + 1}`}
            >
              <Button variant="outline" size="sm">Next</Button>
            </Link>
          )}
        </div>
      )}
    </div>
  );
}

function ListingsTable({ listings }: { listings: Listing[] }) {
  if (listings.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <House className="h-16 w-16 text-muted-foreground" />
        <h3 className="mt-4 text-lg font-semibold">No listings found</h3>
        <p className="mt-2 text-center text-muted-foreground">
          Create your first listing to get started
        </p>
        <Link href="/dashboard/listings/new">
          <Button className="mt-4">
            <Plus className="mr-2 h-4 w-4" />
            Add Listing
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="rounded-lg border">
      {/* Desktop Table */}
      <div className="hidden overflow-x-auto md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {listings.map((listing) => (
              <TableRow key={listing.id}>
                <TableCell className="font-medium">{listing.title}</TableCell>
                <TableCell>
                  <Badge variant={statusVariants[listing.status]}>
                    {listing.status}
                  </Badge>
                </TableCell>
                <TableCell>{formatPrice(listing.price)}</TableCell>
                <TableCell>
                  {listing.createdAt
                    ? format(new Date(listing.createdAt), "MMM d, yyyy")
                    : "—"}
                </TableCell>
                <TableCell className="text-right">
                  <Link href={`/listings/${listing.id}`}>
                    <Button variant="ghost" size="sm">
                      <Eye className="mr-2 h-4 w-4" />
                      View
                    </Button>
                  </Link>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Mobile Cards */}
      <div className="space-y-4 p-4 md:hidden">
        {listings.map((listing) => (
          <div
            key={listing.id}
            className="flex items-center justify-between rounded-lg border p-4"
          >
            <div className="flex-1">
              <p className="font-medium">{listing.title}</p>
              <p className="text-sm text-muted-foreground">{formatPrice(listing.price)}</p>
              <div className="mt-2 flex items-center gap-2">
                <Badge variant={statusVariants[listing.status]}>{listing.status}</Badge>
                <span className="text-xs text-muted-foreground">
                  {listing.createdAt
                    ? format(new Date(listing.createdAt), "MMM d, yyyy")
                    : "—"}
                </span>
              </div>
            </div>
            <Link href={`/listings/${listing.id}`}>
              <Button variant="ghost" size="icon">
                <Eye className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}

function ListingsLoading() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex items-start justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-10 w-32" />
      </div>
      <Skeleton className="mb-6 h-10 w-72" />
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 5 }).map((_, i) => (
              <TableRow key={i}>
                <TableCell><Skeleton className="h-5 w-48" /></TableCell>
                <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                <TableCell className="text-right"><Skeleton className="ml-auto h-8 w-16" /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

export default async function MyListingsPage({ searchParams }: MyListingsPageProps) {
  const session = await auth();
  if (!session) redirect("/login");

  return (
    <Suspense fallback={<ListingsLoading />}>
      <ListingsContent searchParams={searchParams} />
    </Suspense>
  );
}
