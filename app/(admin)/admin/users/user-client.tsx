"use client";

import { useState, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { MoreHorizontal, Loader2, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu, DropdownMenuContent,
  DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog, DialogContent, DialogHeader,
  DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";

// ── Types ──────────────────────────────────────────────────────────────────

export type UserRole = "ADMIN" | "AGENT" | "SELLER" | "BUYER";

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  isVerified: boolean;
  createdAt: string;
}

// ── Change Role Dialog ─────────────────────────────────────────────────────

function ChangeRoleDialog({
  user,
  open,
  onClose,
  onSuccess,
}: {
  user: AdminUser;
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [role, setRole] = useState<UserRole>(user.role);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const submit = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "CHANGE_ROLE", role }),
      });
      if (!res.ok) throw new Error();
      toast({ title: "Role updated", description: `${user.name}'s role changed to ${role}.` });
      onClose();
      onSuccess();
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

function SuspendDialog({
  user,
  open,
  onClose,
  onSuccess,
}: {
  user: AdminUser;
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const isSuspended = !user.isActive;
  const action = isSuspended ? "unsuspend" : "suspend";
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const submit = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: isSuspended ? "UNSUSPEND" : "SUSPEND" }),
      });
      if (!res.ok) throw new Error();
      toast({ title: `User ${action}ed`, description: `${user.name} has been ${action}ed.` });
      onClose();
      onSuccess();
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

export function UserActionsCell({ user }: { user: AdminUser }) {
  const router = useRouter();
  const [roleOpen, setRoleOpen] = useState(false);
  const [suspendOpen, setSuspendOpen] = useState(false);

  const refresh = () => router.refresh();

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
            className={user.isActive ? "text-destructive" : ""}
          >
            {user.isActive ? "Suspend" : "Unsuspend"}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <ChangeRoleDialog user={user} open={roleOpen} onClose={() => setRoleOpen(false)} onSuccess={refresh} />
      <SuspendDialog user={user} open={suspendOpen} onClose={() => setSuspendOpen(false)} onSuccess={refresh} />
    </>
  );
}

// ── Filter bar ─────────────────────────────────────────────────────────────

export function AdminUserFilters({
  initialSearch,
  initialRole,
  initialStatus,
}: {
  initialSearch: string;
  initialRole: string;
  initialStatus: string;
}) {
  const router = useRouter();
  const [search, setSearch] = useState(initialSearch);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  const push = (q: string, newRole: string, newStatus: string) => {
    const p = new URLSearchParams();
    if (q) p.set("search", q);
    if (newRole !== "all") p.set("role", newRole);
    if (newStatus !== "all") p.set("status", newStatus);
    router.push(`/admin/users?${p.toString()}`);
  };

  const handleSearch = (value: string) => {
    setSearch(value);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => push(value, initialRole, initialStatus), 300);
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="relative min-w-[200px] flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search by name or email…"
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
          className="pl-9"
        />
      </div>
      <Select value={initialRole || "all"} onValueChange={(v) => push(search, v, initialStatus)}>
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
      <Select value={initialStatus || "all"} onValueChange={(v) => push(search, initialRole, v)}>
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

// ── Role badge variants ────────────────────────────────────────────────────

export const roleVariants: Record<UserRole, "destructive" | "default" | "warning" | "secondary"> = {
  ADMIN: "destructive",
  AGENT: "default",
  SELLER: "warning",
  BUYER: "secondary",
};
