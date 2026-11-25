"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

// The API returns either a string or an array of zod issues in `error`
function errorMessage(data: unknown, fallback: string) {
  const err = (data as { error?: unknown } | null)?.error;
  if (typeof err === "string") return err;
  if (Array.isArray(err) && typeof err[0]?.message === "string") return err[0].message as string;
  return fallback;
}

export function GuestBookingCancel({ bookingId }: { bookingId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cancel = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/bookings/${bookingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "CANCEL" }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        // Keep the confirm view open so the error stays visible
        setError(errorMessage(data, "Something went wrong."));
        if (res.status === 409) router.refresh();
        return;
      }
      setConfirm(false);
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!confirm) {
    return (
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="mt-2 text-destructive border-destructive/40 hover:bg-destructive/10"
        onClick={() => setConfirm(true)}
      >
        Cancel booking
      </Button>
    );
  }

  return (
    <div className="mt-2 space-y-2">
      <p className="text-xs text-muted-foreground">Are you sure you want to cancel this booking?</p>
      {error && <p className="text-xs text-destructive">{error}</p>}
      <div className="flex gap-2">
        <Button type="button" size="sm" variant="destructive" onClick={cancel} disabled={loading}>
          {loading ? "Cancelling…" : "Yes, cancel"}
        </Button>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={() => {
            setConfirm(false);
            setError(null);
          }}
          disabled={loading}
        >
          Keep booking
        </Button>
      </div>
    </div>
  );
}
