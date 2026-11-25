"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { BookingCalendar } from "./BookingCalendar";

interface BookingRequestFormProps {
  listingId: string;
  pricePerNight: number;
  isLoggedIn: boolean;
}

interface Selection {
  checkIn: string;
  checkOut: string;
  nights: number;
  total: number;
}

const formatNGN = (n: number) =>
  new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(n);

// The API returns either a string or an array of zod issues in `error`
function errorMessage(data: unknown, fallback: string) {
  const err = (data as { error?: unknown } | null)?.error;
  if (typeof err === "string") return err;
  if (Array.isArray(err) && typeof err[0]?.message === "string") return err[0].message as string;
  return fallback;
}

export function BookingRequestForm({ listingId, pricePerNight, isLoggedIn }: BookingRequestFormProps) {
  const router = useRouter();
  const [selection, setSelection] = useState<Selection | null>(null);
  const [pendingCheckIn, setPendingCheckIn] = useState(false);
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  // Bumped to remount the calendar, which clears its selection and refetches availability
  const [calendarKey, setCalendarKey] = useState(0);

  const handleDatesSelected = (checkIn: string, checkOut: string, nights: number, total: number) => {
    setSelection({ checkIn, checkOut, nights, total });
    setPendingCheckIn(false);
    setError(null);
  };

  const handleClear = () => {
    setSelection(null);
    setPendingCheckIn(false);
    setError(null);
  };

  const handleSubmit = async () => {
    if (!isLoggedIn) {
      router.push("/login");
      return;
    }
    if (!selection) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          listingId,
          checkIn: selection.checkIn,
          checkOut: selection.checkOut,
          guestNote: note.trim() || undefined,
        }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        if (res.status === 401) {
          router.push("/login");
          return;
        }
        setError(errorMessage(data, "Something went wrong. Please try again."));
        if (res.status === 409) {
          // Someone else took these dates; reload availability and make them pick again
          setSelection(null);
          setCalendarKey((k) => k + 1);
        }
        return;
      }

      setSuccess(true);
      setSelection(null);
      setNote("");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="rounded-xl border bg-green-50 dark:bg-green-950/20 p-5 text-center space-y-2">
        <p className="font-semibold text-green-700 dark:text-green-400">Booking request sent!</p>
        <p className="text-sm text-muted-foreground">
          The host will confirm or decline your request. You can track it in{" "}
          <Link href="/dashboard/bookings" className="underline">My Bookings</Link>.
        </p>
        <Button type="button" variant="outline" size="sm" onClick={() => setSuccess(false)}>
          Book another date
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs text-muted-foreground mb-2 uppercase tracking-wide font-medium">
          Select dates
        </p>
        <BookingCalendar
          key={calendarKey}
          listingId={listingId}
          pricePerNight={pricePerNight}
          onDatesSelected={handleDatesSelected}
          onClear={handleClear}
          onCheckInSelected={() => setPendingCheckIn(true)}
        />
      </div>

      {error && !selection && <p className="text-sm text-destructive text-center">{error}</p>}

      {selection && (
        <>
          <Separator />
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">
                {formatNGN(pricePerNight)} × {selection.nights} night{selection.nights !== 1 ? "s" : ""}
              </span>
              <span>{formatNGN(selection.total)}</span>
            </div>
            <div className="flex justify-between font-semibold">
              <span>Total</span>
              <span>{formatNGN(selection.total)}</span>
            </div>
          </div>

          <Textarea
            placeholder="Optional message to the host…"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            maxLength={1000}
            rows={3}
            className="text-sm resize-none"
          />

          {error && <p className="text-sm text-destructive">{error}</p>}

          <Button type="button" className="w-full" onClick={handleSubmit} disabled={loading}>
            {loading ? "Sending request…" : isLoggedIn ? "Request to Book" : "Sign in to Book"}
          </Button>

          <p className="text-xs text-muted-foreground text-center">
            You won&apos;t be charged now. The host will confirm your request.
          </p>
        </>
      )}

      {!selection && !pendingCheckIn && (
        <p className="text-xs text-muted-foreground text-center">Select check-in and check-out dates above</p>
      )}
      {!selection && pendingCheckIn && (
        <p className="text-xs text-muted-foreground text-center">Now select your check-out date</p>
      )}
    </div>
  );
}
