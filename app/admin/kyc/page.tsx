import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { format } from "date-fns";
import { ShieldQuestion } from "lucide-react";
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
  AdminKycFilters,
  KycActionsCell,
  kycStatusVariants,
  type AdminKycRow,
} from "./kyc-client";

interface SearchParams {
  status?: string;
}

export const metadata = {
  title: "KYC Verification | RealX Admin",
};

const idTypeLabels: Record<string, string> = {
  NIN: "NIN",
  BVN: "BVN",
  DRIVERS_LICENSE: "Driver's License",
  PASSPORT: "Passport",
};

function mapRow(raw: any): AdminKycRow {
  return {
    id: raw.id,
    userName: raw.user?.name ?? "",
    userEmail: raw.user?.email ?? "",
    idType: raw.idType,
    status: raw.status,
    createdAt: raw.createdAt instanceof Date ? raw.createdAt.toISOString() : raw.createdAt,
    verifiedAt: raw.verifiedAt
      ? raw.verifiedAt instanceof Date
        ? raw.verifiedAt.toISOString()
        : raw.verifiedAt
      : null,
  };
}

export default async function AdminKycPage({
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
  const rows = await db.kycVerification.findMany({
    where,
    include: { user: { select: { name: true, email: true } } },
    orderBy: { createdAt: "desc" },
  });

  const records: AdminKycRow[] = rows.map(mapRow);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold sm:text-3xl">KYC Verification</h1>
        <p className="mt-1 text-muted-foreground">Review and moderate identity verification submissions</p>
      </div>

      <AdminKycFilters />

      {records.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20">
          <ShieldQuestion className="h-16 w-16 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold">No submissions found</h3>
          <p className="mt-2 text-sm text-muted-foreground">Try a different filter</p>
        </div>
      ) : (
        <>
          <div className="hidden overflow-x-auto rounded-lg border md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>ID Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead>Verified</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {records.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="font-medium">{r.userName}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{r.userEmail}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{idTypeLabels[r.idType] ?? r.idType}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={kycStatusVariants[r.status] ?? "default"}>{r.status}</Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {format(new Date(r.createdAt), "MMM d, yyyy")}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {r.verifiedAt ? format(new Date(r.verifiedAt), "MMM d, yyyy") : "—"}
                    </TableCell>
                    <TableCell className="text-right">
                      <KycActionsCell record={r} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="space-y-3 md:hidden">
            {records.map((r) => (
              <div key={r.id} className="flex items-start justify-between rounded-lg border p-4">
                <div className="flex-1">
                  <p className="font-medium">{r.userName}</p>
                  <p className="text-sm text-muted-foreground">{r.userEmail}</p>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <Badge variant={kycStatusVariants[r.status] ?? "default"}>{r.status}</Badge>
                    <Badge variant="outline">{idTypeLabels[r.idType] ?? r.idType}</Badge>
                  </div>
                </div>
                <KycActionsCell record={r} />
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
