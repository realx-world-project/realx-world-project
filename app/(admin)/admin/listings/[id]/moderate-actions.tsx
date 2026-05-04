"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  Dialog, DialogContent, DialogHeader,
  DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import Link from "next/link";

// ── Approve button ─────────────────────────────────────────────────────────

export function ApproveButton({ listingId }: { listingId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const approve = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/listings/${listingId}/moderate`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "APPROVE" }),
      });
      if (!res.ok) throw new Error();
      toast({ title: "Listing approved", description: "The listing has been approved." });
      router.push("/admin/listings");
    } catch {
      toast({ title: "Error", description: "Could not approve listing.", variant: "destructive" });
      setLoading(false);
    }
  };

  return (
    <Button className="w-full bg-green-600 hover:bg-green-700" onClick={approve} disabled={loading}>
      {loading
        ? <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        : <CheckCircle className="mr-2 h-4 w-4" />}
      Approve Listing
    </Button>
  );
}

// ── Reject button + dialog ─────────────────────────────────────────────────

export function RejectButton({ listingId }: { listingId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const reject = async () => {
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
      router.push("/admin/listings");
    } catch {
      toast({ title: "Error", description: "Could not reject listing.", variant: "destructive" });
      setLoading(false);
    }
  };

  return (
    <>
      <Button
        variant="outline"
        className="w-full border-red-300 text-red-600 hover:bg-red-50"
        onClick={() => setOpen(true)}
      >
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
            <Button
              variant="destructive"
              disabled={reason.trim().length < 10 || loading}
              onClick={reject}
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Confirm Reject
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

// ── Sidebar card ───────────────────────────────────────────────────────────

export function ModerationSidebar({ listingId }: { listingId: string }) {
  return (
    <div className="space-y-3">
      <ApproveButton listingId={listingId} />
      <RejectButton listingId={listingId} />
      <Separator />
      <Link href={`/listings/${listingId}`} className="block" target="_blank">
        <Button variant="ghost" className="w-full">View Public Listing ↗</Button>
      </Link>
    </div>
  );
}
