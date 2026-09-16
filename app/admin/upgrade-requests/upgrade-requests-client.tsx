"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";

export type AdminUpgradeRequestRow = {
  id: string;
  userName: string;
  userEmail: string;
  fromRole: string;
  toRole: string;
  status: string;
  createdAt: string;
};

export const upgradeRequestStatusVariants: Record<string, "warning" | "default" | "success" | "destructive"> = {
  PENDING: "warning",
  APPROVED: "success",
  REJECTED: "destructive",
};

export function AdminUpgradeRequestFilters({ pendingCount }: { pendingCount: number }) {
  const router = useRouter();
  const sp = useSearchParams();
  const status = sp.get("status") ?? "all";

  const push = (newStatus: string) => {
    const p = new URLSearchParams();
    if (newStatus !== "all") p.set("status", newStatus);
    router.push(`/admin/upgrade-requests?${p.toString()}`);
  };

  return (
    <Tabs value={status} onValueChange={push}>
      <TabsList>
        <TabsTrigger value="all">All</TabsTrigger>
        <TabsTrigger value="PENDING">
          Pending{pendingCount > 0 ? ` (${pendingCount})` : ""}
        </TabsTrigger>
        <TabsTrigger value="APPROVED">Approved</TabsTrigger>
        <TabsTrigger value="REJECTED">Rejected</TabsTrigger>
      </TabsList>
    </Tabs>
  );
}

function RejectDialog({
  requestId,
  open,
  onClose,
  onSuccess,
}: {
  requestId: string;
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [adminNote, setAdminNote] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const submit = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/upgrade-requests/${requestId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "REJECTED", adminNote: adminNote || undefined }),
      });
      if (!res.ok) throw new Error();
      toast({ title: "Request rejected" });
      onClose();
      onSuccess();
    } catch {
      toast({ title: "Error", description: "Could not reject request.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reject Upgrade Request</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 py-2">
          <label className="text-sm font-medium">Note to applicant (optional)</label>
          <Textarea
            placeholder="Explain why this request is being rejected…"
            rows={3}
            value={adminNote}
            onChange={(e) => setAdminNote(e.target.value)}
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button variant="destructive" disabled={loading} onClick={submit}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Reject
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function UpgradeRequestActionsCell({ request }: { request: AdminUpgradeRequestRow }) {
  const router = useRouter();
  const { toast } = useToast();
  const [rejectOpen, setRejectOpen] = useState(false);
  const [approving, setApproving] = useState(false);

  const approve = async () => {
    setApproving(true);
    try {
      const res = await fetch(`/api/admin/upgrade-requests/${request.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "APPROVED" }),
      });
      if (!res.ok) throw new Error();
      toast({ title: "Approved", description: `${request.userName} is now a Seller.` });
      router.refresh();
    } catch {
      toast({ title: "Error", description: "Could not approve request.", variant: "destructive" });
    } finally {
      setApproving(false);
    }
  };

  if (request.status !== "PENDING") {
    return <span className="text-sm text-muted-foreground">—</span>;
  }

  return (
    <>
      <div className="hidden items-center gap-2 sm:flex">
        <Button
          size="sm"
          onClick={approve}
          disabled={approving}
          className="bg-green-600 text-white hover:bg-green-700"
        >
          {approving && <Loader2 className="mr-2 h-3 w-3 animate-spin" />}
          Approve
        </Button>
        <Button size="sm" variant="outline" className="text-destructive" onClick={() => setRejectOpen(true)}>
          Reject
        </Button>
      </div>

      <div className="sm:hidden">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              {approving ? <Loader2 className="h-4 w-4 animate-spin" /> : <MoreHorizontal className="h-4 w-4" />}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={approve} disabled={approving}>Approve</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setRejectOpen(true)} className="text-destructive">
              Reject…
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <RejectDialog
        requestId={request.id}
        open={rejectOpen}
        onClose={() => setRejectOpen(false)}
        onSuccess={() => router.refresh()}
      />
    </>
  );
}
