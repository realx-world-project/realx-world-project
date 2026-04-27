"use client";

import { useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import {
  ArrowLeft, MapPin, Calendar, User,
  Loader2, CheckCircle, XCircle,
} from "lucide-react";
import { ImageGallery } from "@/components/listings/ImageGallery";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Dialog, DialogContent, DialogHeader,
  DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { useParams } from "next/navigation";

// ── Types ──────────────────────────────────────────────────────────────────

interface AdminListingDetail {
  id: string;
  title: string;
  description: string;
  price: number;
  type: "SALE" | "RENT";
  category: "RESIDENTIAL" | "COMMERCIAL" | "LAND";
  status: "PENDING" | "APPROVED" | "REJECTED" | "PUBLISHED";
  location: string;
  city: string;
  state: string;
  address?: string;
  images: string[];
  createdAt: string;
  seller: {
    name: string;
    email: string;
    role: string;
    createdAt: string;
  };
}

// ── Mock data ──────────────────────────────────────────────────────────────

const mockListing: AdminListingDetail = {
  id: "mock-1",
  title: "Luxury 4-Bedroom Detached House in Banana Island",
  description: `This stunning luxury detached house is located in the prestigious Banana Island, Ikoyi, Lagos.\n\nThe property features:\n- 4 spacious bedrooms with en-suite bathrooms\n- Modern fully fitted kitchen with island counter\n- Large living and dining areas\n- Private swimming pool\n- 24/7 security and gated estate\n- Ample parking space\n- Well-manicured gardens\n\nPerfect for families looking for premium living in Lagos's most exclusive neighborhood.`,
  price: 250_000_000,
  type: "SALE",
  category: "RESIDENTIAL",
  status: "PENDING",
  location: "Banana Island, Ikoyi",
  city: "Lagos",
  state: "Lagos",
  address: "Plot 123, Banana Island Road, Ikoyi",
  images: [],
  createdAt: "2026-04-27T09:00:00Z",
  seller: {
    name: "John Doe",
    email: "john@example.com",
    role: "AGENT",
    createdAt: "2025-01-15T00:00:00Z",
  },
};

const formatPrice = (n: number) =>
  new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(n);

const typeClasses = {
  SALE: "bg-blue-600 text-white border-transparent",
  RENT: "bg-green-600 text-white border-transparent",
};

const statusVariants = {
  PENDING: "warning",
  APPROVED: "default",
  PUBLISHED: "success",
  REJECTED: "destructive",
} as const;

// ── Approve button ─────────────────────────────────────────────────────────

function ApproveButton({ listingId }: { listingId: string }) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const approve = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/listings/${listingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "APPROVED" }),
      });
      if (!res.ok) throw new Error();
      toast({ title: "Listing approved", description: "The listing is now approved." });
    } catch {
      toast({ title: "Error", description: "Could not approve listing.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button className="w-full bg-green-600 hover:bg-green-700" onClick={approve} disabled={loading}>
      {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle className="mr-2 h-4 w-4" />}
      Approve Listing
    </Button>
  );
}

// ── Reject button + dialog ─────────────────────────────────────────────────

function RejectButton({ listingId }: { listingId: string }) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const reject = async () => {
    if (reason.trim().length < 10) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/listings/${listingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "REJECTED", reason }),
      });
      if (!res.ok) throw new Error();
      toast({ title: "Listing rejected" });
      setOpen(false);
    } catch {
      toast({ title: "Error", description: "Could not reject listing.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button variant="outline" className="w-full border-red-300 text-red-600 hover:bg-red-50" onClick={() => setOpen(true)}>
        <XCircle className="mr-2 h-4 w-4" />
        Reject Listing
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
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
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button variant="destructive" disabled={reason.trim().length < 10 || loading} onClick={reject}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Confirm Reject
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────

export default function AdminListingReviewPage() {
  const { id } = useParams<{ id: string }>();

  // In production this would be fetched server-side; using mock for now
  const listing: AdminListingDetail | null =
    id === "mock-1" || true ? { ...mockListing, id } : null;

  if (!listing) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <h1 className="text-3xl font-bold">Listing Not Found</h1>
        <p className="mt-2 text-muted-foreground">This listing does not exist or has been removed.</p>
        <Link href="/admin/listings" className="mt-6">
          <Button><ArrowLeft className="mr-2 h-4 w-4" />Back to Queue</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Link href="/admin/listings" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" />
        Back to Moderation Queue
      </Link>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Main content */}
        <div className="space-y-6 lg:col-span-2">
          <ImageGallery images={listing.images} title={listing.title} />

          <div>
            <div className="mb-3 flex flex-wrap gap-2">
              <Badge className={typeClasses[listing.type]}>{listing.type}</Badge>
              <Badge variant="outline">{listing.category}</Badge>
              <Badge variant={statusVariants[listing.status]}>{listing.status}</Badge>
            </div>
            <h1 className="text-3xl font-bold">{listing.title}</h1>
            <div className="mt-2 flex items-center gap-1 text-muted-foreground">
              <MapPin className="h-4 w-4 flex-shrink-0" />
              <span>{listing.address ?? `${listing.location}, ${listing.city}, ${listing.state}`}</span>
            </div>
          </div>

          <p className="text-3xl font-bold text-primary">
            {formatPrice(listing.price)}
            {listing.type === "RENT" && <span className="ml-1 text-lg font-normal text-muted-foreground">/year</span>}
          </p>

          <Separator />

          <div>
            <h2 className="mb-3 text-xl font-semibold">Description</h2>
            <p className="whitespace-pre-wrap leading-relaxed text-muted-foreground">{listing.description}</p>
          </div>

          <Separator />

          {/* Seller info */}
          <div>
            <h2 className="mb-3 text-xl font-semibold">Seller Information</h2>
            <Card>
              <CardContent className="flex items-center gap-4 p-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                  <User className="h-6 w-6 text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold">{listing.seller.name}</p>
                  <p className="text-sm text-muted-foreground">{listing.seller.email}</p>
                  <div className="mt-1 flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">{listing.seller.role}</Badge>
                    <span className="text-xs text-muted-foreground">
                      Member since {format(new Date(listing.seller.createdAt), "MMMM yyyy")}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>Listed on {format(new Date(listing.createdAt), "MMMM d, yyyy")}</span>
          </div>
        </div>

        {/* Action sidebar */}
        <div className="lg:col-span-1">
          <Card className="sticky top-8">
            <CardHeader>
              <CardTitle>Moderation Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <ApproveButton listingId={listing.id} />
              <RejectButton listingId={listing.id} />
              <Separator />
              <Link href={`/listings/${listing.id}`} className="block" target="_blank">
                <Button variant="ghost" className="w-full">View Public Listing ↗</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
