"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, MoreHorizontal } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogHeader,
  DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu, DropdownMenuContent,
  DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Tabs, TabsList, TabsTrigger,
} from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import Link from "next/link";

// ── Types ──────────────────────────────────────────────────────────────────

export type AdminListingRow = {
  id: string;
  title: string;
  city: string;
  state: string;
  sellerName: string;
  sellerEmail: string;
  category: string;
  price: number;
  status: string;
  imageUrl: string | null;
  createdAt: string;
};

// ── Reject Dialog ──────────────────────────────────────────────────────────

function RejectDialog({
  listingId,
  open,
  onClose,
  onSuccess,
}: {
  listingId: string;
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (reason.trim().length < 10) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/listings/${listingId}/moderate`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "REJECT", reason }),
      });
      if (!res.ok) throw new Error();
      toast({ title: "Listing rejected" });
      onClose();
      onSuccess();
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
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Reject
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── Action cell ────────────────────────────────────────────────────────────

export function ListingActionsCell({ listing }: { listing: AdminListingRow }) {
  const router = useRouter();
  const [rejectOpen, setRejectOpen] = useState(false);
  const [approving, setApproving] = useState(false);
  const { toast } = useToast();

  const quickApprove = async () => {
    setApproving(true);
    try {
      const res = await fetch(`/api/admin/listings/${listing.id}/moderate`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "APPROVE" }),
      });
      if (!res.ok) throw new Error();
      toast({ title: "Approved", description: `"${listing.title}" has been approved.` });
      router.refresh();
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
            {approving
              ? <Loader2 className="h-4 w-4 animate-spin" />
              : <MoreHorizontal className="h-4 w-4" />}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem asChild>
            <Link href={`/admin/listings/${listing.id}`}>Review</Link>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={quickApprove} disabled={approving}>
            Quick Approve
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => setRejectOpen(true)}
            className="text-destructive"
          >
            Reject…
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <RejectDialog
        listingId={listing.id}
        open={rejectOpen}
        onClose={() => setRejectOpen(false)}
        onSuccess={() => router.refresh()}
      />
    </>
  );
}

// ── Filter bar ─────────────────────────────────────────────────────────────

export function AdminListingFilters() {
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
          <TabsTrigger value="PUBLISHED">Published</TabsTrigger>
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

// ── Status badge variants ──────────────────────────────────────────────────

export const listingStatusVariants: Record<string, "warning" | "default" | "success" | "destructive"> = {
  PENDING: "warning",
  APPROVED: "default",
  PUBLISHED: "success",
  REJECTED: "destructive",
};
