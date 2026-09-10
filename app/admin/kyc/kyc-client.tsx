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

export type AdminKycRow = {
  id: string;
  userName: string;
  userEmail: string;
  idType: string;
  status: string;
  createdAt: string;
  verifiedAt: string | null;
};

export const kycStatusVariants: Record<string, "warning" | "default" | "success" | "destructive"> = {
  PENDING: "warning",
  VERIFIED: "success",
  FAILED: "destructive",
};

export function AdminKycFilters() {
  const router = useRouter();
  const sp = useSearchParams();
  const status = sp.get("status") ?? "all";

  const push = (newStatus: string) => {
    const p = new URLSearchParams();
    if (newStatus !== "all") p.set("status", newStatus);
    router.push(`/admin/kyc?${p.toString()}`);
  };

  return (
    <Tabs value={status} onValueChange={push}>
      <TabsList>
        <TabsTrigger value="all">All</TabsTrigger>
        <TabsTrigger value="PENDING">Pending</TabsTrigger>
        <TabsTrigger value="VERIFIED">Verified</TabsTrigger>
        <TabsTrigger value="FAILED">Failed</TabsTrigger>
      </TabsList>
    </Tabs>
  );
}

function FailDialog({
  kycId,
  open,
  onClose,
  onSuccess,
}: {
  kycId: string;
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const submit = async () => {
    if (reason.trim().length < 5) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/kyc/${kycId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "FAILED", failureReason: reason }),
      });
      if (!res.ok) throw new Error();
      toast({ title: "Marked as failed" });
      onClose();
      onSuccess();
    } catch {
      toast({ title: "Error", description: "Could not update record.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Mark KYC as Failed</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 py-2">
          <label className="text-sm font-medium">Reason</label>
          <Textarea
            placeholder="Explain why this verification is being marked as failed…"
            rows={4}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button variant="destructive" disabled={reason.trim().length < 5 || loading} onClick={submit}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Mark Failed
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function KycActionsCell({ record }: { record: AdminKycRow }) {
  const router = useRouter();
  const { toast } = useToast();
  const [failOpen, setFailOpen] = useState(false);
  const [verifying, setVerifying] = useState(false);

  const markVerified = async () => {
    setVerifying(true);
    try {
      const res = await fetch(`/api/admin/kyc/${record.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "VERIFIED" }),
      });
      if (!res.ok) throw new Error();
      toast({ title: "Marked as verified", description: `${record.userName}'s identity is now verified.` });
      router.refresh();
    } catch {
      toast({ title: "Error", description: "Could not update record.", variant: "destructive" });
    } finally {
      setVerifying(false);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            {verifying ? <Loader2 className="h-4 w-4 animate-spin" /> : <MoreHorizontal className="h-4 w-4" />}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={markVerified} disabled={verifying}>
            Mark Verified
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setFailOpen(true)} className="text-destructive">
            Mark Failed…
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <FailDialog
        kycId={record.id}
        open={failOpen}
        onClose={() => setFailOpen(false)}
        onSuccess={() => router.refresh()}
      />
    </>
  );
}
