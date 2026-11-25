"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface HostBookingActionsProps {
  bookingId: string;
  status: "PENDING" | "CONFIRMED";
}

// The API returns either a string or an array of zod issues in `error`
function errorMessage(data: unknown, fallback: string) {
  const err = (data as { error?: unknown } | null)?.error;
  if (typeof err === "string") return err;
  if (Array.isArray(err) && typeof err[0]?.message === "string") return err[0].message as string;
  return fallback;
}

export function HostBookingActions({ bookingId, status }: HostBookingActionsProps) {
  const router = useRouter();
  const [hostNote, setHostNote] = useState("");
  const [loading, setLoading] = useState<"CONFIRM" | "CANCEL" | null>(null);
  const [error, setError] = useState<string | null>(null);

  const cancelLabel = status === "PENDING" ? "Decline" : "Cancel booking";

  const act = async (action: "CONFIRM" | "CANCEL") => {
    if (
      action === "CANCEL" &&
      !window.confirm(
        status === "PENDING"
          ? "Decline this booking request?"
          : "Cancel this confirmed booking? The guest will lose their reservation."
      )
    ) {
      return;
    }

    setLoading(action);
    setError(null);
    try {
      const res = await fetch(`/api/bookings/${bookingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, hostNote: hostNote.trim() || undefined }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        setError(errorMessage(data, "Something went wrong."));
        // 409 means the status changed elsewhere (e.g. the guest cancelled); show the current state
        if (res.status === 409) router.refresh();
        return;
      }
      setHostNote("");
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="space-y-2 pt-3 border-t">
      <Textarea
        placeholder="Optional note to the guest…"
        value={hostNote}
        onChange={(e) => setHostNote(e.target.value)}
        maxLength={1000}
        rows={2}
        className="text-sm resize-none"
      />
      {error && <p className="text-xs text-destructive">{error}</p>}
      <div className="flex gap-2">
        {status === "PENDING" && (
          <Button
            type="button"
            size="sm"
            className="flex-1"
            onClick={() => act("CONFIRM")}
            disabled={loading !== null}
          >
            {loading === "CONFIRM" ? "Confirming…" : "Confirm"}
          </Button>
        )}
        <Button
          type="button"
          size="sm"
          variant="destructive"
          className="flex-1"
          onClick={() => act("CANCEL")}
          disabled={loading !== null}
        >
          {loading === "CANCEL" ? "Cancelling…" : cancelLabel}
        </Button>
      </div>
    </div>
  );
}
