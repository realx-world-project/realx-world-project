import { auth } from "@/lib/auth";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { Metadata } from "next";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead,
  TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Pagination, PaginationContent, PaginationItem,
  PaginationLink, PaginationNext, PaginationPrevious,
} from "@/components/ui/pagination";
import { AuditDateFilter, MetaCell } from "./audit-client";

export const metadata: Metadata = {
  title: "Audit Log | RealX Admin",
};

interface SearchParams {
  startDate?: string;
  endDate?: string;
  page?: string;
}

interface AdminAuditPageProps {
  searchParams: Promise<SearchParams>;
}

interface AuditEntry {
  id: string;
  action: string;
  entity: string;
  entityId: string;
  meta: Record<string, unknown>;
  createdAt: string;
  user: { email: string };
}

export default async function AdminAuditPage({ searchParams }: AdminAuditPageProps) {
  const session = await auth();
  if (!session || (session.user as any).role !== "ADMIN") redirect("/login");

  const params = await searchParams;
  const startDate = params.startDate ?? "";
  const endDate = params.endDate ?? "";
  const page = Math.max(1, Number(params.page ?? 1));

  const base = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL || "http://localhost:3000";
  const cookieStore = cookies();
  const cookieHeader = cookieStore.getAll().map((c) => `${c.name}=${c.value}`).join("; ");
  const opts = { headers: { Cookie: cookieHeader }, cache: "no-store" as const };

  let logs: AuditEntry[] = [];
  let totalPages = 1;

  try {
    const qs = new URLSearchParams({ page: String(page) });
    if (startDate) qs.set("startDate", startDate);
    if (endDate) qs.set("endDate", endDate);

    const res = await fetch(`${base}/api/admin/audit?${qs}`, opts);
    if (res.ok) {
      const data = await res.json();
      logs = data.logs ?? [];
      totalPages = data.totalPages ?? 1;
    }
  } catch {}

  const pageHref = (n: number) => {
    const qs = new URLSearchParams({ page: String(n) });
    if (startDate) qs.set("startDate", startDate);
    if (endDate) qs.set("endDate", endDate);
    return `/admin/audit?${qs}`;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Audit Log</h1>
        <p className="mt-1 text-muted-foreground">Complete record of platform actions</p>
      </div>

      <Suspense>
        <AuditDateFilter initialStart={startDate} initialEnd={endDate} />
      </Suspense>

      {logs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <h3 className="text-lg font-semibold">No audit logs found</h3>
          <p className="mt-2 text-sm text-muted-foreground">Try a different date range</p>
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden overflow-x-auto rounded-lg border md:block">
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
                {logs.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                      {format(new Date(entry.createdAt), "MMM d, yyyy HH:mm")}
                    </TableCell>
                    <TableCell className="text-sm">{entry.user?.email ?? "—"}</TableCell>
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
                      <MetaCell meta={entry.meta ?? {}} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Mobile cards */}
          <div className="space-y-3 md:hidden">
            {logs.map((entry) => (
              <div key={entry.id} className="space-y-2 rounded-lg border p-4">
                <div className="flex items-center justify-between gap-2">
                  <Badge variant="outline" className="font-mono text-xs">{entry.action}</Badge>
                  <time className="text-xs text-muted-foreground">
                    {format(new Date(entry.createdAt), "MMM d, HH:mm")}
                  </time>
                </div>
                <p className="text-sm">{entry.user?.email ?? "—"}</p>
                <p className="text-xs text-muted-foreground">
                  {entry.entity} · {entry.entityId}
                </p>
                <MetaCell meta={entry.meta ?? {}} />
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
