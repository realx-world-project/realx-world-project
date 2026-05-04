import { auth } from "@/lib/auth";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { Metadata } from "next";
import Link from "next/link";
import { format } from "date-fns";
import { Flag } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead,
  TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Pagination, PaginationContent, PaginationItem,
  PaginationLink, PaginationNext, PaginationPrevious,
} from "@/components/ui/pagination";
import {
  ReportActionCell,
  ReportStatusTabs,
  type AdminReport,
} from "./report-client";

export const metadata: Metadata = {
  title: "Reports Queue | RealX Admin",
};

interface SearchParams {
  status?: string;
  page?: string;
}

interface AdminReportsPageProps {
  searchParams: Promise<SearchParams>;
}

export default async function AdminReportsPage({ searchParams }: AdminReportsPageProps) {
  const session = await auth();
  if (!session || (session.user as any).role !== "ADMIN") redirect("/login");

  const params = await searchParams;
  const statusFilter = params.status ?? "PENDING";
  const page = Math.max(1, Number(params.page ?? 1));

  const base = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL || "http://localhost:3000";
  const cookieStore = cookies();
  const cookieHeader = cookieStore.getAll().map((c) => `${c.name}=${c.value}`).join("; ");
  const opts = { headers: { Cookie: cookieHeader }, cache: "no-store" as const };

  let reports: AdminReport[] = [];
  let totalPages = 1;

  try {
    const qs = new URLSearchParams({ page: String(page) });
    const res = await fetch(`${base}/api/admin/reports?${qs}`, opts);
    if (res.ok) {
      const data = await res.json();
      const raw: any[] = data.reports ?? [];
      reports = raw.map((r) => ({
        id: r.id,
        listingId: r.listing?.id ?? "",
        listingTitle: r.listing?.title ?? "—",
        reporterEmail: r.user?.email ?? "—",
        reason: r.reason,
        status: r.status,
        createdAt: r.createdAt,
      }));
      totalPages = data.totalPages ?? 1;
    }
  } catch {}

  // Client-side status filter (API only returns PENDING; for REVIEWED/all, data will be empty)
  const filtered = statusFilter === "all"
    ? reports
    : reports.filter((r) => r.status === statusFilter);

  const pageHref = (n: number) => {
    const qs = new URLSearchParams({ page: String(n) });
    if (statusFilter !== "PENDING") qs.set("status", statusFilter);
    return `/admin/reports?${qs}`;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Reports Queue</h1>
        <p className="mt-1 text-muted-foreground">User-submitted reports about listings</p>
      </div>

      <Suspense>
        <ReportStatusTabs activeStatus={statusFilter} />
      </Suspense>

      {filtered.length === 0 ? (
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
                    <TableCell className="text-sm text-muted-foreground">
                      {report.reporterEmail}
                    </TableCell>
                    <TableCell className="max-w-[260px] text-sm text-muted-foreground">
                      {report.reason.length > 80 ? `${report.reason.slice(0, 80)}…` : report.reason}
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
                      <ReportActionCell report={report} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Mobile cards */}
          <div className="space-y-3 md:hidden">
            {filtered.map((report) => (
              <div key={report.id} className="space-y-2 rounded-lg border p-4">
                <div className="flex items-start justify-between gap-2">
                  <Link
                    href={`/listings/${report.listingId}`}
                    className="line-clamp-1 font-medium hover:underline"
                    target="_blank"
                  >
                    {report.listingTitle}
                  </Link>
                  <Badge
                    variant={report.status === "PENDING" ? "warning" : "success"}
                    className="shrink-0"
                  >
                    {report.status}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{report.reporterEmail}</p>
                <p className="line-clamp-2 text-sm italic text-muted-foreground">
                  "{report.reason}"
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    {format(new Date(report.createdAt), "MMM d, yyyy")}
                  </span>
                  <ReportActionCell report={report} />
                </div>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious href={page > 1 ? pageHref(page - 1) : "#"} aria-disabled={page <= 1} />
                </PaginationItem>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                  <PaginationItem key={n}>
                    <PaginationLink href={pageHref(n)} isActive={n === page}>{n}</PaginationLink>
                  </PaginationItem>
                ))}
                <PaginationItem>
                  <PaginationNext href={page < totalPages ? pageHref(page + 1) : "#"} aria-disabled={page >= totalPages} />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </>
      )}
    </div>
  );
}
