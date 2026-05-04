"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";

// ── Date filter ────────────────────────────────────────────────────────────

export function AuditDateFilter({
  initialStart,
  initialEnd,
}: {
  initialStart: string;
  initialEnd: string;
}) {
  const router = useRouter();
  const [from, setFrom] = useState(initialStart);
  const [to, setTo] = useState(initialEnd);

  const apply = () => {
    const p = new URLSearchParams();
    if (from) p.set("startDate", from);
    if (to) p.set("endDate", to);
    router.push(`/admin/audit?${p.toString()}`);
  };

  const clear = () => {
    setFrom("");
    setTo("");
    router.push("/admin/audit");
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="flex items-center gap-2">
        <label className="text-sm font-medium">From</label>
        <Input
          type="date"
          className="w-[160px]"
          value={from}
          onChange={(e) => setFrom(e.target.value)}
        />
      </div>
      <div className="flex items-center gap-2">
        <label className="text-sm font-medium">To</label>
        <Input
          type="date"
          className="w-[160px]"
          value={to}
          onChange={(e) => setTo(e.target.value)}
        />
      </div>
      <Button size="sm" onClick={apply}>Apply</Button>
      {(from || to) && (
        <Button size="sm" variant="ghost" onClick={clear}>Clear</Button>
      )}
    </div>
  );
}

// ── Meta dialog + cell ─────────────────────────────────────────────────────

function MetaDialog({
  meta,
  open,
  onClose,
}: {
  meta: Record<string, unknown>;
  open: boolean;
  onClose: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Full Metadata</DialogTitle>
        </DialogHeader>
        <pre className="max-h-64 overflow-auto rounded-md bg-muted p-4 font-mono text-xs">
          {JSON.stringify(meta, null, 2)}
        </pre>
      </DialogContent>
    </Dialog>
  );
}

export function MetaCell({ meta }: { meta: Record<string, unknown> }) {
  const [open, setOpen] = useState(false);
  const preview = JSON.stringify(meta);
  const truncated = preview.length > 80 ? `${preview.slice(0, 80)}…` : preview;

  return (
    <div className="flex items-center gap-2">
      <span className="font-mono text-xs text-muted-foreground">{truncated}</span>
      {preview.length > 80 && (
        <Button
          variant="ghost"
          size="sm"
          className="h-6 px-2 text-xs"
          onClick={() => setOpen(true)}
        >
          View
        </Button>
      )}
      <MetaDialog meta={meta} open={open} onClose={() => setOpen(false)} />
    </div>
  );
}
