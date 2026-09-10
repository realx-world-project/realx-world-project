import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { format } from "date-fns";
import { Package } from "lucide-react";
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
import { materialCategoryLabels } from "@/lib/materials";
import {
  AdminMaterialFilters,
  MaterialActionsCell,
  materialStatusVariants,
  type AdminMaterialRow,
} from "./materials-client";

interface SearchParams {
  status?: string;
}

export const metadata = {
  title: "Materials Moderation | RealX Admin",
};

function mapRow(raw: any): AdminMaterialRow {
  return {
    id: raw.id,
    title: raw.title,
    category: raw.category,
    vendorName: raw.vendor?.businessName ?? "",
    state: raw.state,
    status: raw.status,
    imageUrl: raw.images?.[0]?.url ?? null,
    createdAt: raw.createdAt instanceof Date ? raw.createdAt.toISOString() : raw.createdAt,
  };
}

export default async function AdminMaterialsPage({
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
  const rows = await db.materialListing.findMany({
    where,
    include: {
      vendor: { select: { businessName: true } },
      images: { where: { isPrimary: true }, take: 1 },
    },
    orderBy: { createdAt: "desc" },
  });

  const materials: AdminMaterialRow[] = rows.map(mapRow);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold sm:text-3xl">Materials Moderation</h1>
        <p className="mt-1 text-muted-foreground">Review and moderate building material listings</p>
      </div>

      <AdminMaterialFilters />

      {materials.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Package className="h-16 w-16 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold">No listings found</h3>
          <p className="mt-2 text-sm text-muted-foreground">Try a different filter</p>
        </div>
      ) : (
        <>
          <div className="hidden overflow-x-auto rounded-lg border md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Image</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Vendor</TableHead>
                  <TableHead>State</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {materials.map((m) => (
                  <TableRow key={m.id}>
                    <TableCell>
                      <div className="h-[50px] w-[50px] overflow-hidden rounded-md bg-muted">
                        {m.imageUrl ? (
                          <img src={m.imageUrl} alt="" className="h-full w-full object-cover" />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center">
                            <Package className="h-5 w-5 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="max-w-[220px]">
                      <p className="line-clamp-1 font-medium">{m.title}</p>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{materialCategoryLabels[m.category] ?? m.category}</Badge>
                    </TableCell>
                    <TableCell className="text-sm">{m.vendorName}</TableCell>
                    <TableCell className="text-sm">{m.state}</TableCell>
                    <TableCell>
                      <Badge variant={materialStatusVariants[m.status] ?? "default"}>{m.status}</Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {format(new Date(m.createdAt), "MMM d, yyyy")}
                    </TableCell>
                    <TableCell className="text-right">
                      <MaterialActionsCell material={m} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="space-y-3 md:hidden">
            {materials.map((m) => (
              <div key={m.id} className="flex items-start justify-between rounded-lg border p-4">
                <div className="flex-1">
                  <p className="line-clamp-1 font-medium">{m.title}</p>
                  <p className="text-sm text-muted-foreground">{m.vendorName} · {m.state}</p>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <Badge variant={materialStatusVariants[m.status] ?? "default"}>{m.status}</Badge>
                    <Badge variant="outline">{materialCategoryLabels[m.category] ?? m.category}</Badge>
                  </div>
                </div>
                <MaterialActionsCell material={m} />
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
