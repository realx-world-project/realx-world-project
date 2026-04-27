"use client";

import { Suspense, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import { House, MoreHorizontal, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table, TableBody, TableCell, TableHead,
  TableHeader, TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu, DropdownMenuContent,
  DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog, DialogContent, DialogHeader,
  DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Tabs, TabsList, TabsTrigger,
} from "@/components/ui/tabs";
import {
  Pagination, PaginationContent, PaginationItem,
  PaginationLink, PaginationNext, PaginationPrevious,
} from "@/components/ui/pagination";
import { useToast } from "@/components/ui/use-toast";
import { TableSkeleton } from "@/components/admin/TableSkeleton";

// ── Types ──────────────────────────────────────────────────────────────────

type ListingStatus = "PENDING" | "APPROVED" | "REJECTED" | "PUBLISHED";
type ListingCategory = "RESIDENTIAL" | "COMMERCIAL" | "LAND";

interface AdminListing {
  id: string;
  title: string;
  location: string;
  city: string;
  state: string;
  seller: { name: string; email: string };
  category: ListingCategory;
  price: number;
  status: ListingStatus;
  images: string[];
  createdAt: string;
}

// ── Mock data ──────────────────────────────────────────────────────────────

const mockListings: AdminListing[] = [
  { id: "1", title: "Luxury 4-Bedroom Detached House in Banana Island", location: "Banana Island", city: "Lagos", state: "Lagos", seller: { name: "John Doe", email: "john@example.com" }, category: "RESIDENTIAL", price: 250_000_000, status: "PENDING", images: [], createdAt: "2026-04-27T09:00:00Z" },
  { id: "2", title: "Modern 3-Bedroom Flat in Victoria Island", location: "Victoria Island", city: "Lagos", state: "Lagos", seller: { name: "Jane Smith", email: "jane@example.com" }, category: "RESIDENTIAL", price: 85_000_000, status: "PENDING", images: [], createdAt: "2026-04-26T14:00:00Z" },
  { id: "3", title: "Commercial Plot of Land in Lekki", location: "Lekki", city: "Lagos", state: "Lagos", seller: { name: "Mike Johnson", email: "mike@example.com" }, category: "LAND", price: 150_000_000, status: "APPROVED", images: [], createdAt: "2026-04-25T11:00:00Z" },
  { id: "4", title: "Office Space in Abuja Central", location: "Central Area", city: "Abuja", state: "FCT", seller: { name: "Amaka Osei", email: "amaka@example.com" }, category: "COMMERCIAL", price: 45_000_000, status: "APPROVED", images: [], createdAt: "2026-04-24T10:00:00Z" },
  { id: "5", title: "5 Bedroom Duplex in Asokoro", location: "Asokoro", city: "Abuja", state: "FCT", seller: { name: "Emeka Eze", email: "emeka@example.com" }, category: "RESIDENTIAL", price: 180_000_000, status: "REJECTED", images: [], createdAt: "2026-04-23T08:00:00Z" },
  { id: "6", title: "2 Bedroom Apartment in Ikeja GRA", location: "Ikeja GRA", city: "Ikeja", state: "Lagos", seller: { name: "Bola Ahmed", email: "bola@example.com" }, category: "RESIDENTIAL", price: 6_500_000, status: "PUBLISHED", images: [], createdAt: "2026-04-22T15:00:00Z" },
];

const statusVariants: Record<ListingStatus, "warning" | "default" | "success" | "destructive"> = {
  PENDING: "warning",
  APPROVED: "default",
  PUBLISHED: "success",
  REJECTED: "destructive",
};

const formatPrice = (n: number) =>
  new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(n);

// ── Reject Dialog ──────────────────────────────────────────────────────────

function RejectDialog({ listingId, open, onClose }: { listingId: string; open: boolean; onClose: () => void }) {
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (reason.trim().length < 10) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/listings/${listingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "REJECTED", reason }),
      });
      if (!res.ok) throw new Error();
      toast({ title: "Listing rejected", description: "The listing has been rejected." });
      onClose();
    } catch {
      toast({ title: "Error", description: "Failed to reject listing.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reject Listing</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 py-2">
          <label className="text-sm font-medium">Reason for rejection</label>
          <Textarea
            placeholder="Explain why this listing is being rejected (min 10 characters)…"
            rows={4}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
          <p className="text-xs text-muted-foreground">{reason.length} / 10 min characters</p>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button
            variant="destructive"
            disabled={reason.trim().length < 10 || loading}
            onClick={handleSubmit}
          >
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Reject
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── Action cell ────────────────────────────────────────────────────────────

function ListingActions({ listing }: { listing: AdminListing }) {
  const [rejectOpen, setRejectOpen] = useState(false);
  const [approving, setApproving] = useState(false);
  const { toast } = useToast();

  const quickApprove = async () => {
    setApproving(true);
    try {
      const res = await fetch(`/api/admin/listings/${listing.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "APPROVED" }),
      });
      if (!res.ok) throw new Error();
      toast({ title: "Approved", description: `"${listing.title}" has been approved.` });
    } catch {
      toast({ title: "Error", description: "Could not approve listing.", variant: "destructive" });
    } finally {
      setApproving(false);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            {approving ? <Loader2 className="h-4 w-4 animate-spin" /> : <MoreHorizontal className="h-4 w-4" />}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem asChild>
            <Link href={`/admin/listings/${listing.id}`}>Review</Link>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={quickApprove} disabled={approving}>
            Quick Approve
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setRejectOpen(true)} className="text-destructive">
            Reject…
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <RejectDialog
        listingId={listing.id}
        open={rejectOpen}
        onClose={() => setRejectOpen(false)}
      />
    </>
  );
}

// ── Filter bar ─────────────────────────────────────────────────────────────

function AdminListingFilters() {
  const router = useRouter();
  const sp = useSearchParams();
  const status = sp.get("status") ?? "all";
  const category = sp.get("category") ?? "all";

  const push = (newStatus: string, newCategory: string) => {
    const p = new URLSearchParams();
    if (newStatus !== "all") p.set("status", newStatus);
    if (newCategory !== "all") p.set("category", newCategory);
    router.push(`/admin/listings?${p.toString()}`);
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      <Tabs value={status} onValueChange={(v) => push(v, category)}>
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="PENDING">Pending</TabsTrigger>
          <TabsTrigger value="APPROVED">Approved</TabsTrigger>
          <TabsTrigger value="REJECTED">Rejected</TabsTrigger>
        </TabsList>
      </Tabs>
      <Select value={category} onValueChange={(v) => push(status, v)}>
        <SelectTrigger className="w-[160px]">
          <SelectValue placeholder="Category" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Categories</SelectItem>
          <SelectItem value="RESIDENTIAL">Residential</SelectItem>
          <SelectItem value="COMMERCIAL">Commercial</SelectItem>
          <SelectItem value="LAND">Land</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}

const LISTINGS_HEADERS = ["Listing", "Seller", "Category", "Price", "Status", "Date", "Actions"];

// ── Main page ──────────────────────────────────────────────────────────────

export default function AdminListingsPage() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const sp = useSearchParams();
  const statusFilter = sp.get("status") ?? "";
  const categoryFilter = sp.get("category") ?? "";
  const page = parseInt(sp.get("page") ?? "1");
  const PAGE_SIZE = 8;

  const filtered = mockListings.filter((l) => {
    if (statusFilter && l.status !== statusFilter) return false;
    if (categoryFilter && l.category !== categoryFilter) return false;
    return true;
  });
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE) || 1;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Listing Moderation</h1>
        <p className="mt-1 text-muted-foreground">Review and moderate property listings</p>
      </div>

      <Suspense>
        <AdminListingFilters />
      </Suspense>

      {!mounted ? (
        <TableSkeleton rows={6} headers={LISTINGS_HEADERS} />
      ) : paginated.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20">
          <House className="h-16 w-16 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold">No listings found</h3>
          <p className="mt-2 text-sm text-muted-foreground">Try a different filter</p>
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden rounded-lg border md:block">
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
                {paginated.map((listing) => (
                  <TableRow key={listing.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-[60px] w-[60px] flex-shrink-0 overflow-hidden rounded-md bg-muted">
                          {listing.images[0] ? (
                            <img src={listing.images[0]} alt="" className="h-full w-full object-cover" />
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
                      <p className="text-sm font-medium">{listing.seller.name}</p>
                      <p className="text-xs text-muted-foreground">{listing.seller.email}</p>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{listing.category}</Badge>
                    </TableCell>
                    <TableCell className="tabular-nums">{formatPrice(listing.price)}</TableCell>
                    <TableCell>
                      <Badge variant={statusVariants[listing.status]}>{listing.status}</Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {format(new Date(listing.createdAt), "MMM d, yyyy")}
                    </TableCell>
                    <TableCell className="text-right">
                      <ListingActions listing={listing} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Mobile cards */}
          <div className="space-y-3 md:hidden">
            {paginated.map((listing) => (
              <div key={listing.id} className="flex items-start justify-between rounded-lg border p-4">
                <div className="flex-1">
                  <p className="font-medium line-clamp-1">{listing.title}</p>
                  <p className="text-sm text-muted-foreground">{listing.city}, {listing.state}</p>
                  <p className="text-sm text-muted-foreground">{listing.seller.name}</p>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <Badge variant={statusVariants[listing.status]}>{listing.status}</Badge>
                    <Badge variant="outline">{listing.category}</Badge>
                    <span className="text-xs text-muted-foreground">{formatPrice(listing.price)}</span>
                  </div>
                </div>
                <ListingActions listing={listing} />
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious href={page > 1 ? `/admin/listings?page=${page - 1}` : "#"} aria-disabled={page <= 1} />
                </PaginationItem>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                  <PaginationItem key={n}>
                    <PaginationLink href={`/admin/listings?page=${n}`} isActive={n === page}>{n}</PaginationLink>
                  </PaginationItem>
                ))}
                <PaginationItem>
                  <PaginationNext href={page < totalPages ? `/admin/listings?page=${page + 1}` : "#"} aria-disabled={page >= totalPages} />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </>
      )}
    </div>
  );
}
