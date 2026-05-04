"use client";

import { useState, useEffect, useRef } from "react";
import { format } from "date-fns";
import { Download, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead,
  TableHeader, TableRow,
} from "@/components/ui/table";
import { useToast } from "@/components/ui/use-toast";

// ── Types ──────────────────────────────────────────────────────────────────

type ExportStatus = "PENDING" | "PROCESSING" | "DONE" | "FAILED";
type ExportType = "LISTINGS_CSV" | "LISTINGS_EXCEL" | "USERS_CSV";

interface ExportEntry {
  id: string;
  type: ExportType;
  status: ExportStatus;
  requestedAt: string;
  completedAt?: string | null;
  fileUrl?: string | null;
}

const exportTypeLabels: Record<ExportType, string> = {
  LISTINGS_CSV: "Listings CSV",
  LISTINGS_EXCEL: "Listings Excel",
  USERS_CSV: "Users CSV",
};

const statusVariants: Record<ExportStatus, "warning" | "default" | "success" | "destructive"> = {
  PENDING: "warning",
  PROCESSING: "default",
  DONE: "success",
  FAILED: "destructive",
};

// ── Page ───────────────────────────────────────────────────────────────────

export default function AdminExportsPage() {
  const [exportType, setExportType] = useState<ExportType>("LISTINGS_CSV");
  const [requesting, setRequesting] = useState(false);
  const [history, setHistory] = useState<ExportEntry[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const { toast } = useToast();
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Load export history on mount
  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/admin/exports");
        if (res.ok) {
          const data = await res.json();
          setHistory(
            (data.exports ?? []).map((e: any) => ({
              id: e.id,
              type: e.type as ExportType,
              status: e.status as ExportStatus,
              requestedAt: e.createdAt,
              completedAt: e.completedAt ?? null,
              fileUrl: e.fileUrl ?? null,
            }))
          );
        }
      } catch {}
      setLoadingHistory(false);
    };
    load();
  }, []);

  // Poll every 3 s for any PENDING or PROCESSING entries; stop when all reach terminal state
  useEffect(() => {
    const pending = history.filter(
      (e) => e.status === "PENDING" || e.status === "PROCESSING"
    );

    if (pending.length === 0) {
      if (pollRef.current) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
      return;
    }

    pollRef.current = setInterval(async () => {
      for (const entry of pending) {
        try {
          const res = await fetch(`/api/admin/exports/${entry.id}`);
          if (!res.ok) continue;
          const data = await res.json();
          const updated: Partial<ExportEntry> = {
            status: data.status,
            completedAt: data.completedAt ?? null,
            fileUrl: data.fileUrl ?? null,
          };
          setHistory((prev) =>
            prev.map((e) => (e.id === entry.id ? { ...e, ...updated } : e))
          );
        } catch {}
      }
    }, 3000);

    return () => {
      if (pollRef.current) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
    };
  }, [history]);

  const requestExport = async () => {
    setRequesting(true);
    try {
      const res = await fetch("/api/admin/exports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: exportType }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error((err as any).error || "Request failed");
      }
      const data = await res.json();
      const newEntry: ExportEntry = {
        id: data.exportId,
        type: exportType,
        status: "PENDING",
        requestedAt: new Date().toISOString(),
        completedAt: null,
        fileUrl: null,
      };
      setHistory((prev) => [newEntry, ...prev]);
      toast({ title: "Export queued", description: `Export ID: ${data.exportId}` });
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to request export.",
        variant: "destructive",
      });
    } finally {
      setRequesting(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Data Exports</h1>
        <p className="mt-1 text-muted-foreground">Export platform data as CSV or Excel</p>
      </div>

      {/* Request form */}
      <Card className="max-w-md">
        <CardHeader>
          <CardTitle>Request Export</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Export Type</label>
            <Select
              value={exportType}
              onValueChange={(v) => setExportType(v as ExportType)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="LISTINGS_CSV">Listings CSV</SelectItem>
                <SelectItem value="LISTINGS_EXCEL">Listings Excel</SelectItem>
                <SelectItem value="USERS_CSV">Users CSV</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button className="w-full" onClick={requestExport} disabled={requesting}>
            {requesting
              ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Requesting…</>
              : "Request Export"}
          </Button>
        </CardContent>
      </Card>

      {/* Export history */}
      <div>
        <h2 className="mb-4 text-xl font-semibold">Export History</h2>

        {loadingHistory ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading history…
          </div>
        ) : history.length === 0 ? (
          <p className="text-sm text-muted-foreground">No exports yet.</p>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden rounded-lg border md:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Requested</TableHead>
                    <TableHead>Completed</TableHead>
                    <TableHead>Download</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {history.map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell className="font-medium">
                        {exportTypeLabels[entry.type] ?? entry.type}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {(entry.status === "PENDING" || entry.status === "PROCESSING") && (
                            <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
                          )}
                          <Badge variant={statusVariants[entry.status]}>
                            {entry.status}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {format(new Date(entry.requestedAt), "MMM d, yyyy HH:mm")}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {entry.completedAt
                          ? format(new Date(entry.completedAt), "MMM d, yyyy HH:mm")
                          : "—"}
                      </TableCell>
                      <TableCell>
                        {entry.status === "DONE" && entry.fileUrl ? (
                          <Button variant="outline" size="sm" asChild>
                            <a href={entry.fileUrl} download>
                              <Download className="mr-2 h-3.5 w-3.5" />
                              Download
                            </a>
                          </Button>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Mobile cards */}
            <div className="space-y-3 md:hidden">
              {history.map((entry) => (
                <div key={entry.id} className="space-y-2 rounded-lg border p-4">
                  <div className="flex items-center justify-between">
                    <p className="font-medium">{exportTypeLabels[entry.type] ?? entry.type}</p>
                    <div className="flex items-center gap-2">
                      {(entry.status === "PENDING" || entry.status === "PROCESSING") && (
                        <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
                      )}
                      <Badge variant={statusVariants[entry.status]}>{entry.status}</Badge>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Requested {format(new Date(entry.requestedAt), "MMM d, yyyy HH:mm")}
                  </p>
                  {entry.completedAt && (
                    <p className="text-xs text-muted-foreground">
                      Completed {format(new Date(entry.completedAt), "MMM d, yyyy HH:mm")}
                    </p>
                  )}
                  {entry.status === "DONE" && entry.fileUrl && (
                    <Button variant="outline" size="sm" asChild>
                      <a href={entry.fileUrl} download>
                        <Download className="mr-2 h-3.5 w-3.5" />
                        Download
                      </a>
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
