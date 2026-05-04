"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogHeader,
  DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";

// ── Types ──────────────────────────────────────────────────────────────────

export interface AdminReport {
  id: string;
  listingId: string;
  listingTitle: string;
  reporterEmail: string;
  reason: string;
  status: "PENDING" | "REVIEWED";
  createdAt: string;
}

// ── Mark Reviewed Dialog ───────────────────────────────────────────────────

function MarkReviewedDialog({
  report,
  open,
  onClose,
  onSuccess,
}: {
  report: AdminReport;
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [rejectListing, setRejectListing] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const submit = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/reports/${report.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "MARK_REVIEWED", rejectListing }),
      });
      if (!res.ok) throw new Error();
      toast({
        title: "Report marked as reviewed",
        description: rejectListing ? "The listing has also been rejected." : undefined,
      });
      onClose();
      onSuccess();
    } catch {
      toast({ title: "Error", description: "Could not update report.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Mark as Reviewed</DialogTitle>
          <DialogDescription>
            Confirm you have reviewed this report and taken appropriate action.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div className="rounded-lg bg-muted p-3 text-sm">
            <p className="font-medium">{report.listingTitle}</p>
            <p className="mt-1 text-muted-foreground">Reported by {report.reporterEmail}</p>
            <p className="mt-2 italic">"{report.reason}"</p>
          </div>
          <label className="flex cursor-pointer items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={rejectListing}
              onChange={(e) => setRejectListing(e.target.checked)}
              className="rounded"
            />
            Also reject this listing
          </label>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button disabled={loading} onClick={submit}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Confirm
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── Report action cell ─────────────────────────────────────────────────────

export function ReportActionCell({ report }: { report: AdminReport }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  if (report.status === "REVIEWED") {
    return <Badge variant="success">Reviewed</Badge>;
  }

  return (
    <>
      <Button size="sm" variant="outline" onClick={() => setOpen(true)}>
        Mark Reviewed
      </Button>
      <MarkReviewedDialog
        report={report}
        open={open}
        onClose={() => setOpen(false)}
        onSuccess={() => router.refresh()}
      />
    </>
  );
}

// ── Filter tabs ────────────────────────────────────────────────────────────

export function ReportStatusTabs({ activeStatus }: { activeStatus: string }) {
  const router = useRouter();

  const push = (s: string) => {
    const p = new URLSearchParams();
    if (s !== "PENDING") p.set("status", s);
    router.push(`/admin/reports?${p.toString()}`);
  };

  return (
    <Tabs value={activeStatus} onValueChange={push}>
      <TabsList>
        <TabsTrigger value="PENDING">Pending</TabsTrigger>
        <TabsTrigger value="REVIEWED">Reviewed</TabsTrigger>
        <TabsTrigger value="all">All</TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
