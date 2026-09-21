import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { format } from "date-fns";
import { Store } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AdminVendorFilters,
  VendorActionsCell,
  type AdminVendorRow,
} from "./vendors-client";
import { vendorStatusVariants } from "./vendors-utils";

interface SearchParams {
  status?: string;
}

export const metadata = {
  title: "Vendors Moderation | RealX Admin",
};

function mapRow(raw: any): AdminVendorRow {
  return {
    id: raw.id,
    businessName: raw.businessName,
    ownerName: raw.user?.name ?? "",
    ownerEmail: raw.user?.email ?? "",
    state: raw.state,
    status: raw.status,
    listingsCount: raw._count?.listings ?? 0,
    createdAt: raw.createdAt instanceof Date ? raw.createdAt.toISOString() : raw.createdAt,
  };
}

export default async function AdminVendorsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const session = await auth();
  if (!session || (session.user as any).role !== "ADMIN") redirect("/login");

  const params = await searchParams;
  const statusFilter = params.status ?? "";

  const where: any = {};
  if (statusFilter) where.status = statusFilter;

  const db: any = prisma;
  const rows = await db.materialVendor.findMany({
    where,
    include: {
      user: { select: { name: true, email: true } },
      _count: { select: { listings: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const vendors: AdminVendorRow[] = rows.map(mapRow);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold sm:text-3xl">Vendors Moderation</h1>
        <p className="mt-1 text-muted-foreground">Review and moderate material vendor registrations</p>
      </div>

      <AdminVendorFilters />

      {vendors.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Store className="h-16 w-16 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold">No vendors found</h3>
          <p className="mt-2 text-sm text-muted-foreground">Try a different filter</p>
        </div>
      ) : (
        <>
          <div className="hidden overflow-x-auto rounded-lg border md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Business Name</TableHead>
                  <TableHead>Owner</TableHead>
                  <TableHead>State</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Listings</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {vendors.map((v) => (
                  <TableRow key={v.id}>
                    <TableCell className="font-medium">{v.businessName}</TableCell>
                    <TableCell>
                      <p className="text-sm font-medium">{v.ownerName}</p>
                      <p className="text-xs text-muted-foreground">{v.ownerEmail}</p>
                    </TableCell>
                    <TableCell className="text-sm">{v.state}</TableCell>
                    <TableCell>
                      <Badge variant={vendorStatusVariants[v.status] ?? "default"}>{v.status}</Badge>
                    </TableCell>
                    <TableCell className="tabular-nums">{v.listingsCount}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {format(new Date(v.createdAt), "MMM d, yyyy")}
                    </TableCell>
                    <TableCell className="text-right">
                      <VendorActionsCell vendor={v} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="space-y-3 md:hidden">
            {vendors.map((v) => (
              <div key={v.id} className="flex items-start justify-between rounded-lg border p-4">
                <div className="flex-1">
                  <p className="font-medium">{v.businessName}</p>
                  <p className="text-sm text-muted-foreground">{v.ownerName} · {v.state}</p>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <Badge variant={vendorStatusVariants[v.status] ?? "default"}>{v.status}</Badge>
                    <span className="text-xs text-muted-foreground">{v.listingsCount} listings</span>
                  </div>
                </div>
                <VendorActionsCell vendor={v} />
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
