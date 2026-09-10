"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";

export type AdminMaterialRow = {
  id: string;
  title: string;
  category: string;
  vendorName: string;
  state: string;
  status: string;
  imageUrl: string | null;
  createdAt: string;
};

export const materialStatusVariants: Record<string, "warning" | "default" | "success" | "destructive"> = {
  PENDING: "warning",
  APPROVED: "success",
  REJECTED: "destructive",
  SUSPENDED: "destructive",
};

export function AdminMaterialFilters() {
  const router = useRouter();
  const sp = useSearchParams();
  const status = sp.get("status") ?? "all";

  const push = (newStatus: string) => {
    const p = new URLSearchParams();
    if (newStatus !== "all") p.set("status", newStatus);
    router.push(`/admin/materials?${p.toString()}`);
  };

  return (
    <Tabs value={status} onValueChange={push}>
      <TabsList>
        <TabsTrigger value="all">All</TabsTrigger>
        <TabsTrigger value="PENDING">Pending</TabsTrigger>
        <TabsTrigger value="APPROVED">Approved</TabsTrigger>
        <TabsTrigger value="REJECTED">Rejected</TabsTrigger>
        <TabsTrigger value="SUSPENDED">Suspended</TabsTrigger>
      </TabsList>
    </Tabs>
  );
}

export function MaterialActionsCell({ material }: { material: AdminMaterialRow }) {
  const router = useRouter();
  const { toast } = useToast();
  const [updating, setUpdating] = useState(false);

  const updateStatus = async (status: "APPROVED" | "REJECTED" | "SUSPENDED") => {
    setUpdating(true);
    try {
      const res = await fetch(`/api/admin/materials/${material.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error();
      toast({ title: `Listing ${status.toLowerCase()}`, description: `"${material.title}" is now ${status.toLowerCase()}.` });
      router.refresh();
    } catch {
      toast({ title: "Error", description: "Could not update listing.", variant: "destructive" });
    } finally {
      setUpdating(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          {updating ? <Loader2 className="h-4 w-4 animate-spin" /> : <MoreHorizontal className="h-4 w-4" />}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => updateStatus("APPROVED")} disabled={updating}>
          Approve
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => updateStatus("REJECTED")} disabled={updating} className="text-destructive">
          Reject
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => updateStatus("SUSPENDED")} disabled={updating} className="text-destructive">
          Suspend
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
