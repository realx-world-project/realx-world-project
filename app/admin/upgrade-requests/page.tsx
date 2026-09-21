import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { format } from "date-fns";
import { UserCog } from "lucide-react";
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
  AdminUpgradeRequestFilters,
  UpgradeRequestActionsCell,
  type AdminUpgradeRequestRow,
} from "./upgrade-requests-client";
import { upgradeRequestStatusVariants } from "./upgrade-requests-utils";

export const metadata = {
  title: "Role Upgrade Requests | RealX Admin",
};

interface SearchParams {
  status?: string;
}

function mapRow(raw: any): AdminUpgradeRequestRow {
  return {
    id: raw.id,
    userName: raw.user?.name ?? "",
    userEmail: raw.user?.email ?? "",
    fromRole: raw.fromRole,
    toRole: raw.toRole,
    status: raw.status,
    createdAt: raw.createdAt instanceof Date ? raw.createdAt.toISOString() : raw.createdAt,
  };
}

export default async function AdminUpgradeRequestsPage({
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
  const [rows, pendingCount] = await Promise.all([
    db.roleUpgradeRequest.findMany({
      where,
      include: { user: { select: { name: true, email: true } } },
      orderBy: { createdAt: "desc" },
    }),
    db.roleUpgradeRequest.count({ where: { status: "PENDING" } }),
  ]);

  const requests: AdminUpgradeRequestRow[] = rows.map(mapRow);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold sm:text-3xl">Role Upgrade Requests</h1>
        <p className="mt-1 text-muted-foreground">Review BUYER requests to become a Seller</p>
      </div>

      <AdminUpgradeRequestFilters pendingCount={pendingCount} />

      {requests.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20">
          <UserCog className="h-16 w-16 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold">No requests found</h3>
          <p className="mt-2 text-sm text-muted-foreground">Try a different filter</p>
        </div>
      ) : (
        <>
          <div className="hidden overflow-x-auto rounded-lg border md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Current Role</TableHead>
                  <TableHead>Requested Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {requests.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="font-medium">{r.userName}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{r.userEmail}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{r.fromRole}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{r.toRole}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={upgradeRequestStatusVariants[r.status] ?? "default"}>{r.status}</Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {format(new Date(r.createdAt), "MMM d, yyyy")}
                    </TableCell>
                    <TableCell className="text-right">
                      <UpgradeRequestActionsCell request={r} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="space-y-3 md:hidden">
            {requests.map((r) => (
              <div key={r.id} className="flex items-start justify-between rounded-lg border p-4">
                <div className="flex-1">
                  <p className="font-medium">{r.userName}</p>
                  <p className="text-sm text-muted-foreground">{r.userEmail}</p>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <Badge variant={upgradeRequestStatusVariants[r.status] ?? "default"}>{r.status}</Badge>
                    <span className="text-xs text-muted-foreground">
                      {r.fromRole} → {r.toRole}
                    </span>
                  </div>
                </div>
                <UpgradeRequestActionsCell request={r} />
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
