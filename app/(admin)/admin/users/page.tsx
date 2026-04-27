"use client";

import { Suspense, useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { format } from "date-fns";
import { MoreHorizontal, Loader2, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead,
  TableHeader, TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu, DropdownMenuContent,
  DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog, DialogContent, DialogHeader,
  DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { TableSkeleton } from "@/components/admin/TableSkeleton";

// ── Types ──────────────────────────────────────────────────────────────────

type UserRole = "ADMIN" | "AGENT" | "SELLER" | "BUYER";

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  isVerified: boolean; // true = active, false = suspended
  createdAt: string;
}

// ── Mock data ──────────────────────────────────────────────────────────────

const mockUsers: AdminUser[] = [
  { id: "u1", name: "Admin User", email: "admin@realx.ng", role: "ADMIN", isVerified: true, createdAt: "2024-01-01T00:00:00Z" },
  { id: "u2", name: "John Doe", email: "john@example.com", role: "AGENT", isVerified: true, createdAt: "2024-03-15T00:00:00Z" },
  { id: "u3", name: "Jane Smith", email: "jane@example.com", role: "SELLER", isVerified: true, createdAt: "2024-06-20T00:00:00Z" },
  { id: "u4", name: "Emeka Eze", email: "emeka@example.com", role: "BUYER", isVerified: false, createdAt: "2025-01-10T00:00:00Z" },
  { id: "u5", name: "Amaka Osei", email: "amaka@example.com", role: "SELLER", isVerified: true, createdAt: "2025-09-05T00:00:00Z" },
];

const roleVariants: Record<UserRole, "destructive" | "default" | "warning" | "secondary"> = {
  ADMIN: "destructive",
  AGENT: "default",
  SELLER: "warning",
  BUYER: "secondary",
};

const initials = (name: string) =>
  name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

// ── Change Role Dialog ─────────────────────────────────────────────────────

function ChangeRoleDialog({ user, open, onClose }: { user: AdminUser; open: boolean; onClose: () => void }) {
  const [role, setRole] = useState<UserRole>(user.role);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const submit = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
      });
      if (!res.ok) throw new Error();
      toast({ title: "Role updated", description: `${user.name}'s role changed to ${role}.` });
      onClose();
    } catch {
      toast({ title: "Error", description: "Could not update role.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Change Role</DialogTitle>
          <DialogDescription>Change role for {user.name}</DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <Select value={role} onValueChange={(v) => setRole(v as UserRole)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="BUYER">Buyer</SelectItem>
              <SelectItem value="SELLER">Seller</SelectItem>
              <SelectItem value="AGENT">Agent</SelectItem>
              <SelectItem value="ADMIN">Admin</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button disabled={loading} onClick={submit}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── Suspend / Unsuspend Dialog ─────────────────────────────────────────────

function SuspendDialog({ user, open, onClose }: { user: AdminUser; open: boolean; onClose: () => void }) {
  const action = user.isVerified ? "suspend" : "unsuspend";
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const submit = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isVerified: !user.isVerified }),
      });
      if (!res.ok) throw new Error();
      toast({ title: `User ${action}ed`, description: `${user.name} has been ${action}ed.` });
      onClose();
    } catch {
      toast({ title: "Error", description: `Could not ${action} user.`, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="capitalize">{action} User</DialogTitle>
          <DialogDescription>
            Are you sure you want to {action} <strong>{user.name}</strong>?
            {action === "suspend" && " They will lose access to the platform."}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button
            variant={action === "suspend" ? "destructive" : "default"}
            disabled={loading}
            onClick={submit}
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Confirm
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── Row actions ────────────────────────────────────────────────────────────

function UserActions({ user }: { user: AdminUser }) {
  const [roleOpen, setRoleOpen] = useState(false);
  const [suspendOpen, setSuspendOpen] = useState(false);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setRoleOpen(true)}>Change Role</DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => setSuspendOpen(true)}
            className={user.isVerified ? "text-destructive" : ""}
          >
            {user.isVerified ? "Suspend" : "Unsuspend"}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <ChangeRoleDialog user={user} open={roleOpen} onClose={() => setRoleOpen(false)} />
      <SuspendDialog user={user} open={suspendOpen} onClose={() => setSuspendOpen(false)} />
    </>
  );
}

// ── Filter bar ─────────────────────────────────────────────────────────────

function AdminUserFilters() {
  const router = useRouter();
  const sp = useSearchParams();
  const [search, setSearch] = useState(sp.get("q") ?? "");
  const role = sp.get("role") ?? "all";
  const status = sp.get("status") ?? "all";
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  const push = (q: string, newRole: string, newStatus: string) => {
    const p = new URLSearchParams();
    if (q) p.set("q", q);
    if (newRole !== "all") p.set("role", newRole);
    if (newStatus !== "all") p.set("status", newStatus);
    router.push(`/admin/users?${p.toString()}`);
  };

  const handleSearch = (value: string) => {
    setSearch(value);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => push(value, role, status), 300);
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="relative flex-1 min-w-[200px]">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search by name or email…"
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
          className="pl-9"
        />
      </div>
      <Select value={role} onValueChange={(v) => push(search, v, status)}>
        <SelectTrigger className="w-[140px]">
          <SelectValue placeholder="Role" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Roles</SelectItem>
          <SelectItem value="ADMIN">Admin</SelectItem>
          <SelectItem value="AGENT">Agent</SelectItem>
          <SelectItem value="SELLER">Seller</SelectItem>
          <SelectItem value="BUYER">Buyer</SelectItem>
        </SelectContent>
      </Select>
      <Select value={status} onValueChange={(v) => push(search, role, v)}>
        <SelectTrigger className="w-[140px]">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Status</SelectItem>
          <SelectItem value="active">Active</SelectItem>
          <SelectItem value="suspended">Suspended</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}

const USERS_HEADERS = ["User", "Email", "Role", "Status", "Joined", "Actions"];

// ── Page ───────────────────────────────────────────────────────────────────

export default function AdminUsersPage() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const sp = useSearchParams();
  const q = (sp.get("q") ?? "").toLowerCase();
  const roleFilter = sp.get("role") ?? "";
  const statusFilter = sp.get("status") ?? "";

  const filtered = mockUsers.filter((u) => {
    if (q && !u.name.toLowerCase().includes(q) && !u.email.toLowerCase().includes(q)) return false;
    if (roleFilter && u.role !== roleFilter) return false;
    if (statusFilter === "active" && !u.isVerified) return false;
    if (statusFilter === "suspended" && u.isVerified) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">User Management</h1>
        <p className="mt-1 text-muted-foreground">Manage platform users, roles, and access</p>
      </div>

      <Suspense>
        <AdminUserFilters />
      </Suspense>

      {!mounted ? (
        <TableSkeleton rows={5} headers={USERS_HEADERS} />
      ) : filtered.length === 0 ? (
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
                {filtered.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                          {initials(user.name)}
                        </div>
                        <span className="font-medium">{user.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{user.email}</TableCell>
                    <TableCell>
                      <Badge variant={roleVariants[user.role]}>{user.role}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={user.isVerified ? "success" : "destructive"}>
                        {user.isVerified ? "Active" : "Suspended"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {format(new Date(user.createdAt), "MMM d, yyyy")}
                    </TableCell>
                    <TableCell className="text-right">
                      <UserActions user={user} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Mobile cards */}
          <div className="space-y-3 md:hidden">
            {filtered.map((user) => (
              <div key={user.id} className="flex items-center justify-between rounded-lg border p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                    {initials(user.name)}
                  </div>
                  <div>
                    <p className="font-medium">{user.name}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                    <div className="mt-1 flex gap-1">
                      <Badge variant={roleVariants[user.role]} className="text-xs">{user.role}</Badge>
                      <Badge variant={user.isVerified ? "success" : "destructive"} className="text-xs">
                        {user.isVerified ? "Active" : "Suspended"}
                      </Badge>
                    </div>
                  </div>
                </div>
                <UserActions user={user} />
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
