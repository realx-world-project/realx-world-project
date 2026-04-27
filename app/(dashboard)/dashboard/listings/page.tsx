import { Suspense } from "react";
import { Metadata } from "next";
import Link from "next/link";
import { format } from "date-fns";
import { Plus, Eye, MoreHorizontal } from "lucide-react";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Listing } from "@/components/listings/ListingCard";
import { House } from "lucide-react";

// Mock data for user's listings
const mockUserListings: Listing[] = [
  {
    id: "1",
    title: "Luxury 4-Bedroom Detached House in Banana Island",
    price: 250000000,
    type: "SALE",
    category: "RESIDENTIAL",
    status: "PUBLISHED",
    location: "Banana Island, Ikoyi",
    city: "Lagos",
    state: "Lagos",
    images: ["/placeholder.jpg"],
    createdAt: "2024-01-15T10:00:00Z",
  },
  {
    id: "2",
    title: "Modern 3-Bedroom Flat in Victoria Island",
    price: 85000000,
    type: "RENT",
    category: "RESIDENTIAL",
    status: "PENDING",
    location: "Victoria Island",
    city: "Lagos",
    state: "Lagos",
    images: [],
    createdAt: "2024-01-14T10:00:00Z",
  },
  {
    id: "3",
    title: "Commercial Plot of Land in Lekki",
    price: 150000000,
    type: "SALE",
    category: "LAND",
    status: "REJECTED",
    location: "Lekki Peninsula",
    city: "Lagos",
    state: "Lagos",
    images: [],
    createdAt: "2024-01-13T10:00:00Z",
  },
];

interface SearchParams {
  status?: string;
}

interface MyListingsPageProps {
  searchParams: Promise<SearchParams>;
}

export const metadata: Metadata = {
  title: "My Listings | Relex World",
  description: "Manage your property listings",
};

// Format price as Nigerian Naira
const formatPrice = (price: number): string => {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(price);
};

// Status badge variants
const statusVariants = {
  PENDING: "warning" as const,
  APPROVED: "default" as const,
  PUBLISHED: "success" as const,
  REJECTED: "destructive" as const,
};

async function fetchUserListings() {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/listings/user`,
      { cache: "no-store" }
    );

    if (!response.ok) {
      throw new Error("API unavailable");
    }

    return await response.json();
  } catch (error) {
    console.error("Failed to fetch user listings:", error);
    return { listings: [], total: 0 };
  }
}

async function ListingsContent({ searchParams }: MyListingsPageProps) {
  const params = await searchParams;
  const statusFilter = params.status;

  const data = await fetchUserListings();
  const listings: Listing[] = data.listings?.length > 0 ? data.listings : mockUserListings;

  // Filter by status if provided
  const filteredListings = statusFilter
    ? listings.filter((l) => l.status === statusFilter)
    : listings;

  // Group listings by status
  const pendingListings = listings.filter((l) => l.status === "PENDING");
  const publishedListings = listings.filter((l) => l.status === "PUBLISHED");
  const rejectedListings = listings.filter((l) => l.status === "REJECTED");

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Page Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">My Listings</h1>
          <p className="mt-2 text-muted-foreground">
            Manage your property listings
          </p>
        </div>
        <Link href="/dashboard/listings/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Listing
          </Button>
        </Link>
      </div>

      {/* Tabs */}
      <Tabs defaultValue={statusFilter || "all"} className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">
            All ({listings.length})
          </TabsTrigger>
          <TabsTrigger value="PENDING">
            Pending ({pendingListings.length})
          </TabsTrigger>
          <TabsTrigger value="PUBLISHED">
            Published ({publishedListings.length})
          </TabsTrigger>
          <TabsTrigger value="REJECTED">
            Rejected ({rejectedListings.length})
          </TabsTrigger>
        </TabsList>

        {/* All Listings */}
        <TabsContent value="all" className="space-y-4">
          <ListingsTable listings={listings} />
        </TabsContent>

        {/* Pending Listings */}
        <TabsContent value="PENDING" className="space-y-4">
          <ListingsTable listings={pendingListings} />
        </TabsContent>

        {/* Published Listings */}
        <TabsContent value="PUBLISHED" className="space-y-4">
          <ListingsTable listings={publishedListings} />
        </TabsContent>

        {/* Rejected Listings */}
        <TabsContent value="REJECTED" className="space-y-4">
          <ListingsTable listings={rejectedListings} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function ListingsTable({ listings }: { listings: Listing[] }) {
  if (listings.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <House className="h-16 w-16 text-muted-foreground" />
        <h3 className="mt-4 text-lg font-semibold">
          You haven't listed any properties yet
        </h3>
        <p className="mt-2 text-center text-muted-foreground">
          Start by creating your first listing
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
                <TableCell className="font-medium">
                  {listing.title}
                </TableCell>
                <TableCell>
                  <Badge variant={statusVariants[listing.status]}>
                    {listing.status}
                  </Badge>
                </TableCell>
                <TableCell>{formatPrice(listing.price)}</TableCell>
                <TableCell>
                  {listing.createdAt
                    ? format(new Date(listing.createdAt), "MMM d, yyyy")
                    : "-"}
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
      <div className="space-y-4 md:hidden">
        {listings.map((listing) => (
          <div
            key={listing.id}
            className="flex items-center justify-between rounded-lg border p-4"
          >
            <div className="flex-1">
              <p className="font-medium">{listing.title}</p>
              <p className="text-sm text-muted-foreground">
                {formatPrice(listing.price)}
              </p>
              <div className="mt-2 flex items-center gap-2">
                <Badge variant={statusVariants[listing.status]}>
                  {listing.status}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {listing.createdAt
                    ? format(new Date(listing.createdAt), "MMM d, yyyy")
                    : "-"}
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
    <div className="space-y-4">
      <Skeleton className="h-10 w-48" />
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
                <TableCell><Skeleton className="h-8 w-16" /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

export default async function MyListingsPage({ searchParams }: MyListingsPageProps) {
  return (
    <Suspense fallback={<ListingsLoading />}>
      <ListingsContent searchParams={searchParams} />
    </Suspense>
  );
}