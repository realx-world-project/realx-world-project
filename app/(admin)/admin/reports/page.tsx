"use client";

import { Suspense, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import { Flag, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table, TableBody, TableCell, TableHead,
  TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader,
  DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { TableSkeleton } from "@/components/admin/TableSkeleton";

// ── Types ──────────────────────────────────────────────────────────────────

type ReportStatus = "PENDING" | "REVIEWED";

interface AdminReport {
  id: string;
  listingId: string;
  listingTitle: string;
  reporterEmail: string;
  reason: string;
  status: ReportStatus;
  createdAt: string;
}

// ── Mock data ──────────────────────────────────────────────────────────────

const mockReports: AdminReport[] = [
  { id: "r1", listingId: "1", listingTitle: "Luxury 4-Bedroom Detached House in Banana Island", reporterEmail: "bola@example.com", reason: "This listing is fraudulent — the property does not exist at the stated address.", status: "PENDING", createdAt: "2026-04-27T08:00:00Z" },
  { id: "r2", listingId: "3", listingTitle: "Commercial Plot of Land in Lekki", reporterEmail: "ada@example.com", reason: "Duplicate listing. Same property already listed by the same seller.", status: "PENDING", createdAt: "2026-04-26T15:00:00Z" },
  { id: "r3", listingId: "2", listingTitle: "Modern 3-Bedroom Flat in Victoria Island", reporterEmail: "emeka@example.com", reason: "Price is misleading. Photos do not match the actual property.", status: "REVIEWED", createdAt: "2026-04-25T10:00:00Z" },
  { id: "r4", listingId: "5", listingTitle: "5 Bedroom Duplex in Asokoro", reporterEmail: "jane@example.com", reason: "Seller is unresponsive and listing details appear fabricated.", status: "PENDING", createdAt: "2026-04-24T09:00:00Z" },
];

// ── Mark Reviewed Dialog ───────────────────────────────────────────────────

function MarkReviewedDialog({
  report,
  open,
  onClose,
}: {
  report: AdminReport;
  open: boolean;
  onClose: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const submit = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/reports/${report.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "REVIEWED" }),
      });
      if (!res.ok) throw new Error();
      toast({ title: "Report marked as reviewed" });
      onClose();
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
        <div className="rounded-lg bg-muted p-3 text-sm">
          <p className="font-medium">{report.listingTitle}</p>
          <p className="mt-1 text-muted-foreground">Reported by {report.reporterEmail}</p>
          <p className="mt-2 italic">"{report.reason}"</p>
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

// ── Report row action ──────────────────────────────────────────────────────

function ReportAction({ report }: { report: AdminReport }) {
  const [open, setOpen] = useState(false);

  if (report.status === "REVIEWED") {
    return <Badge variant="success">Reviewed</Badge>;
  }

  return (
    <>
      <Button size="sm" variant="outline" onClick={() => setOpen(true)}>
        Mark Reviewed
      </Button>
      <MarkReviewedDialog report={report} open={open} onClose={() => setOpen(false)} />
    </>
  );
}

// ── Filter bar ─────────────────────────────────────────────────────────────

function ReportFilters() {
  const router = useRouter();
  const sp = useSearchParams();
  const status = sp.get("status") ?? "PENDING";

  const push = (s: string) => {
    const p = new URLSearchParams();
    if (s !== "all") p.set("status", s);
    router.push(`/admin/reports?${p.toString()}`);
  };

  return (
    <Tabs value={status} onValueChange={push}>
      <TabsList>
        <TabsTrigger value="PENDING">Pending</TabsTrigger>
        <TabsTrigger value="REVIEWED">Reviewed</TabsTrigger>
        <TabsTrigger value="all">All</TabsTrigger>
      </TabsList>
    </Tabs>
  );
}

const REPORTS_HEADERS = ["Listing", "Reporter", "Reason", "Date", "Status", "Actions"];

// ── Page ───────────────────────────────────────────────────────────────────

export default function AdminReportsPage() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const sp = useSearchParams();
  const statusFilter = sp.get("status") ?? "PENDING";

  const filtered = mockReports.filter((r) =>
    statusFilter === "all" ? true : r.status === statusFilter
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Reports Queue</h1>
        <p className="mt-1 text-muted-foreground">User-submitted reports about listings</p>
      </div>

      <Suspense>
        <ReportFilters />
      </Suspense>

      {!mounted ? (
        <TableSkeleton rows={4} headers={REPORTS_HEADERS} />
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Flag className="h-14 w-14 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold">No reports found</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            {statusFilter === "PENDING" ? "No pending reports — all clear!" : "Try a different filter"}
          </p>
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden rounded-lg border md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Listing</TableHead>
                  <TableHead>Reporter</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((report) => (
                  <TableRow key={report.id}>
                    <TableCell>
                      <Link
                        href={`/listings/${report.listingId}`}
                        className="line-clamp-1 font-medium hover:underline"
                        target="_blank"
                      >
                        {report.listingTitle}
                      </Link>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{report.reporterEmail}</TableCell>
                    <TableCell className="max-w-[260px] text-sm text-muted-foreground">
                      {report.reason.length > 60 ? `${report.reason.slice(0, 60)}…` : report.reason}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {format(new Date(report.createdAt), "MMM d, yyyy")}
                    </TableCell>
                    <TableCell>
                      <Badge variant={report.status === "PENDING" ? "warning" : "success"}>
                        {report.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <ReportAction report={report} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Mobile cards */}
          <div className="space-y-3 md:hidden">
            {filtered.map((report) => (
              <div key={report.id} className="rounded-lg border p-4 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <Link href={`/listings/${report.listingId}`} className="font-medium hover:underline line-clamp-1" target="_blank">
                    {report.listingTitle}
                  </Link>
                  <Badge variant={report.status === "PENDING" ? "warning" : "success"} className="shrink-0">
                    {report.status}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{report.reporterEmail}</p>
                <p className="text-sm italic text-muted-foreground line-clamp-2">"{report.reason}"</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">{format(new Date(report.createdAt), "MMM d, yyyy")}</span>
                  <ReportAction report={report} />
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
