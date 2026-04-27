"use client";

import { Suspense, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table, TableBody, TableCell, TableHead,
  TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Pagination, PaginationContent, PaginationItem,
  PaginationLink, PaginationNext, PaginationPrevious,
} from "@/components/ui/pagination";
import { TableSkeleton } from "@/components/admin/TableSkeleton";

// ── Types ──────────────────────────────────────────────────────────────────

interface AuditEntry {
  id: string;
  userEmail: string;
  action: string;
  entity: string;
  entityId: string;
  meta: Record<string, unknown>;
  createdAt: string;
}

// ── Mock data (10 entries) ─────────────────────────────────────────────────

const mockAudit: AuditEntry[] = [
  { id: "a1", userEmail: "admin@realx.ng", action: "LISTING_APPROVED", entity: "Listing", entityId: "lst_001", meta: { listingId: "lst_001", previousStatus: "PENDING", newStatus: "APPROVED" }, createdAt: "2026-04-27T10:30:00Z" },
  { id: "a2", userEmail: "john@example.com", action: "LISTING_CREATED", entity: "Listing", entityId: "lst_002", meta: { title: "4-Bedroom House in Ikoyi", price: 250000000, category: "RESIDENTIAL" }, createdAt: "2026-04-27T09:15:00Z" },
  { id: "a3", userEmail: "bola@example.com", action: "REPORT_SUBMITTED", entity: "Report", entityId: "rep_001", meta: { listingId: "lst_001", reason: "Fraudulent listing" }, createdAt: "2026-04-27T08:45:00Z" },
  { id: "a4", userEmail: "emeka@example.com", action: "USER_REGISTERED", entity: "User", entityId: "usr_004", meta: { role: "BUYER", email: "emeka@example.com" }, createdAt: "2026-04-27T08:00:00Z" },
  { id: "a5", userEmail: "admin@realx.ng", action: "USER_SUSPENDED", entity: "User", entityId: "usr_004", meta: { reason: "Suspicious activity", suspendedBy: "admin@realx.ng" }, createdAt: "2026-04-26T22:00:00Z" },
  { id: "a6", userEmail: "jane@example.com", action: "LISTING_CREATED", entity: "Listing", entityId: "lst_003", meta: { title: "Commercial Plot in Lekki", price: 150000000, category: "LAND" }, createdAt: "2026-04-26T16:00:00Z" },
  { id: "a7", userEmail: "admin@realx.ng", action: "LISTING_REJECTED", entity: "Listing", entityId: "lst_003", meta: { reason: "Missing property documents", rejectedBy: "admin@realx.ng" }, createdAt: "2026-04-26T15:30:00Z" },
  { id: "a8", userEmail: "amaka@example.com", action: "LOGIN", entity: "User", entityId: "usr_005", meta: { ip: "197.210.xx.xx", userAgent: "Mozilla/5.0" }, createdAt: "2026-04-26T12:00:00Z" },
  { id: "a9", userEmail: "mike@example.com", action: "BOOKMARK_ADDED", entity: "SavedListing", entityId: "sl_001", meta: { listingId: "lst_001", userId: "usr_006" }, createdAt: "2026-04-26T09:00:00Z" },
  { id: "a10", userEmail: "admin@realx.ng", action: "ROLE_CHANGED", entity: "User", entityId: "usr_002", meta: { previousRole: "BUYER", newRole: "AGENT", changedBy: "admin@realx.ng" }, createdAt: "2026-04-25T14:00:00Z" },
];

const PAGE_SIZE = 10;

// ── Meta dialog ────────────────────────────────────────────────────────────

function MetaDialog({ meta, open, onClose }: { meta: Record<string, unknown>; open: boolean; onClose: () => void }) {
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Full Metadata</DialogTitle>
        </DialogHeader>
        <pre className="max-h-64 overflow-auto rounded-md bg-muted p-4 font-mono text-xs">
          {JSON.stringify(meta, null, 2)}
        </pre>
      </DialogContent>
    </Dialog>
  );
}

// ── Meta cell ──────────────────────────────────────────────────────────────

function MetaCell({ meta }: { meta: Record<string, unknown> }) {
  const [open, setOpen] = useState(false);
  const preview = JSON.stringify(meta);
  const truncated = preview.length > 80 ? `${preview.slice(0, 80)}…` : preview;

  return (
    <div className="flex items-center gap-2">
      <span className="font-mono text-xs text-muted-foreground">{truncated}</span>
      {preview.length > 80 && (
        <Button variant="ghost" size="sm" className="h-6 px-2 text-xs" onClick={() => setOpen(true)}>
          View
        </Button>
      )}
      <MetaDialog meta={meta} open={open} onClose={() => setOpen(false)} />
    </div>
  );
}

// ── Date filter ────────────────────────────────────────────────────────────

function AuditDateFilter() {
  const router = useRouter();
  const sp = useSearchParams();
  const [from, setFrom] = useState(sp.get("from") ?? "");
  const [to, setTo] = useState(sp.get("to") ?? "");

  const apply = () => {
    const p = new URLSearchParams();
    if (from) p.set("from", from);
    if (to) p.set("to", to);
    router.push(`/admin/audit?${p.toString()}`);
  };

  const clear = () => {
    setFrom("");
    setTo("");
    router.push("/admin/audit");
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="flex items-center gap-2">
        <label className="text-sm font-medium">From</label>
        <Input type="date" className="w-[160px]" value={from} onChange={(e) => setFrom(e.target.value)} />
      </div>
      <div className="flex items-center gap-2">
        <label className="text-sm font-medium">To</label>
        <Input type="date" className="w-[160px]" value={to} onChange={(e) => setTo(e.target.value)} />
      </div>
      <Button size="sm" onClick={apply}>Apply</Button>
      {(from || to) && <Button size="sm" variant="ghost" onClick={clear}>Clear</Button>}
    </div>
  );
}

const AUDIT_HEADERS = ["Timestamp", "User", "Action", "Entity", "Entity ID", "Meta"];

// ── Page ───────────────────────────────────────────────────────────────────

export default function AdminAuditPage() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const sp = useSearchParams();
  const page = parseInt(sp.get("page") ?? "1");
  const from = sp.get("from");
  const to = sp.get("to");

  const filtered = mockAudit.filter((entry) => {
    const d = new Date(entry.createdAt);
    if (from && d < new Date(from)) return false;
    if (to && d > new Date(`${to}T23:59:59`)) return false;
    return true;
  });

  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE) || 1;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Audit Log</h1>
        <p className="mt-1 text-muted-foreground">Complete record of platform actions</p>
      </div>

      <Suspense>
        <AuditDateFilter />
      </Suspense>

      {!mounted ? (
        <TableSkeleton rows={10} headers={AUDIT_HEADERS} />
      ) : (
      <>
      {/* Desktop table */}
      <div className="hidden rounded-lg border md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Timestamp</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Action</TableHead>
              <TableHead>Entity</TableHead>
              <TableHead>Entity ID</TableHead>
              <TableHead>Meta</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginated.map((entry) => (
              <TableRow key={entry.id}>
                <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                  {format(new Date(entry.createdAt), "MMM d, yyyy HH:mm")}
                </TableCell>
                <TableCell className="text-sm">{entry.userEmail}</TableCell>
                <TableCell>
                  <Badge variant="outline" className="font-mono text-xs">
                    {entry.action}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">{entry.entity}</TableCell>
                <TableCell className="font-mono text-xs text-muted-foreground">
                  {entry.entityId.slice(0, 10)}…
                </TableCell>
                <TableCell className="max-w-[280px]">
                  <MetaCell meta={entry.meta} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Mobile cards */}
      <div className="space-y-3 md:hidden">
        {paginated.map((entry) => (
          <div key={entry.id} className="rounded-lg border p-4 space-y-2">
            <div className="flex items-center justify-between gap-2">
              <Badge variant="outline" className="font-mono text-xs">{entry.action}</Badge>
              <time className="text-xs text-muted-foreground">
                {format(new Date(entry.createdAt), "MMM d, HH:mm")}
              </time>
            </div>
            <p className="text-sm">{entry.userEmail}</p>
            <p className="text-xs text-muted-foreground">{entry.entity} · {entry.entityId}</p>
            <MetaCell meta={entry.meta} />
          </div>
        ))}
      </div>

      {totalPages > 1 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious href={page > 1 ? `/admin/audit?page=${page - 1}` : "#"} aria-disabled={page <= 1} />
            </PaginationItem>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
              <PaginationItem key={n}>
                <PaginationLink href={`/admin/audit?page=${n}`} isActive={n === page}>{n}</PaginationLink>
              </PaginationItem>
            ))}
            <PaginationItem>
              <PaginationNext href={page < totalPages ? `/admin/audit?page=${page + 1}` : "#"} aria-disabled={page >= totalPages} />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
      </>
      )}
    </div>
  );
}
