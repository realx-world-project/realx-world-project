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
import { TableSkeleton } from "@/components/admin/TableSkeleton";
import {
  Pagination, PaginationContent, PaginationItem,
  PaginationLink, PaginationNext, PaginationPrevious,
} from "@/components/ui/pagination";
import {
  AdminUserFilters,
  UserActionsCell,
  roleVariants,
  type AdminUser,
} from "./user-client";

export const metadata: Metadata = {
  title: "User Management | RealX Admin",
};

interface SearchParams {
  search?: string;
  role?: string;
  status?: string;
  page?: string;
}

interface AdminUsersPageProps {
  searchParams: Promise<SearchParams>;
}

const initials = (name: string) =>
  name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) || "?";

const USERS_HEADERS = ["User", "Email", "Role", "Status", "Joined", "Actions"];

export default async function AdminUsersPage({ searchParams }: AdminUsersPageProps) {
  const session = await auth();
  if (!session || (session.user as any).role !== "ADMIN") redirect("/login");

  const params = await searchParams;
  const searchQ = params.search ?? "";
  const roleFilter = params.role ?? "";
  const statusFilter = params.status ?? "";
  const page = Math.max(1, Number(params.page ?? 1));

  const base = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL || "http://localhost:3000";
  const cookieStore = cookies();
  const cookieHeader = cookieStore.getAll().map((c) => `${c.name}=${c.value}`).join("; ");
  const opts = { headers: { Cookie: cookieHeader }, cache: "no-store" as const };

  let users: AdminUser[] = [];
  let totalPages = 1;

  try {
    const qs = new URLSearchParams({ page: String(page) });
    if (searchQ) qs.set("search", searchQ);
    if (roleFilter) qs.set("role", roleFilter);
    // Translate UI status filter to API isActive param
    if (statusFilter === "active") qs.set("isActive", "true");
    if (statusFilter === "suspended") qs.set("isActive", "false");

    const res = await fetch(`${base}/api/admin/users?${qs}`, opts);
    if (res.ok) {
      const data = await res.json();
      users = data.users ?? [];
      totalPages = data.totalPages ?? 1;
    }
  } catch {}

  const pageHref = (n: number) => {
    const qs = new URLSearchParams({ page: String(n) });
    if (searchQ) qs.set("search", searchQ);
    if (roleFilter) qs.set("role", roleFilter);
    if (statusFilter) qs.set("status", statusFilter);
    return `/admin/users?${qs}`;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">User Management</h1>
        <p className="mt-1 text-muted-foreground">Manage platform users, roles, and access</p>
      </div>

      <Suspense>
        <AdminUserFilters
          initialSearch={searchQ}
          initialRole={roleFilter}
          initialStatus={statusFilter}
        />
      </Suspense>

      {users.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <h3 className="text-lg font-semibold">No users found</h3>
          <p className="mt-2 text-sm text-muted-foreground">Try a different search or filter</p>
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden rounded-lg border md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                          {initials(user.name || user.email)}
                        </div>
                        <span className="font-medium">{user.name || "—"}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{user.email}</TableCell>
                    <TableCell>
                      <Badge variant={roleVariants[user.role]}>{user.role}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={user.isActive ? "success" : "destructive"}>
                        {user.isActive ? "Active" : "Suspended"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {format(new Date(user.createdAt), "MMM d, yyyy")}
                    </TableCell>
                    <TableCell className="text-right">
                      <UserActionsCell user={user} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Mobile cards */}
          <div className="space-y-3 md:hidden">
            {users.map((user) => (
              <div key={user.id} className="flex items-center justify-between rounded-lg border p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                    {initials(user.name || user.email)}
                  </div>
                  <div>
                    <p className="font-medium">{user.name || "—"}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                    <div className="mt-1 flex gap-1">
                      <Badge variant={roleVariants[user.role]} className="text-xs">{user.role}</Badge>
                      <Badge variant={user.isActive ? "success" : "destructive"} className="text-xs">
                        {user.isActive ? "Active" : "Suspended"}
                      </Badge>
                    </div>
                  </div>
                </div>
                <UserActionsCell user={user} />
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
