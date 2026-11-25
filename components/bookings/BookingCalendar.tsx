"use client";

import { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface BookingCalendarProps {
  listingId: string;
  pricePerNight: number;
  onDatesSelected: (checkIn: string, checkOut: string, nights: number, total: number) => void;
  onClear: () => void;
  /** Fires when a check-in date is picked, before a check-out is chosen */
  onCheckInSelected?: (checkIn: string) => void;
}

const DAY_MS = 1000 * 60 * 60 * 24;

// All dates are handled as "YYYY-MM-DD" strings with UTC arithmetic, so the
// viewer's timezone and DST changes can't shift a day.
function localDateStr(d: Date) {
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${mm}-${dd}`;
}

function addDays(dateStr: string, n: number) {
  const d = new Date(`${dateStr}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

function nightsBetween(start: string, end: string) {
  return Math.round(
    (new Date(`${end}T00:00:00Z`).getTime() - new Date(`${start}T00:00:00Z`).getTime()) / DAY_MS
  );
}

function addMonths(d: Date, n: number) {
  return new Date(d.getFullYear(), d.getMonth() + n, 1);
}

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

export function BookingCalendar({
  listingId,
  pricePerNight,
  onDatesSelected,
  onClear,
  onCheckInSelected,
}: BookingCalendarProps) {
  const today = localDateStr(new Date());
  const [viewDate, setViewDate] = useState(() => addMonths(new Date(), 0));
  const [checkIn, setCheckIn] = useState<string | null>(null);
  const [checkOut, setCheckOut] = useState<string | null>(null);
  const [hovered, setHovered] = useState<string | null>(null);
  // Nights that can't be booked (a night is identified by the date you sleep there)
  const [blockedNights, setBlockedNights] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    setLoading(true);
    setError(false);
    fetch(`/api/listings/${listingId}/availability`)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((data) => {
        const blocked = new Set<string>();
        (data.blockedDates ?? []).forEach((d: string) => blocked.add(d.slice(0, 10)));
        (data.bookings ?? []).forEach(({ checkIn: ci, checkOut: co }: { checkIn: string; checkOut: string }) => {
          const end = co.slice(0, 10);
          for (let d = ci.slice(0, 10); d < end; d = addDays(d, 1)) blocked.add(d);
        });
        setBlockedNights(blocked);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [listingId]);

  const isBlocked = useCallback((dateStr: string) => blockedNights.has(dateStr), [blockedNights]);

  const rangeIsFree = useCallback(
    (start: string, end: string) => {
      for (let d = start; d < end; d = addDays(d, 1)) if (isBlocked(d)) return false;
      return true;
    },
    [isBlocked]
  );

  // A blocked date can still be a check-out day (e.g. the next guest checks in
  // that morning), as long as every night before it is free.
  const isSelectableCheckOut = (dateStr: string) =>
    !!checkIn && !checkOut && dateStr > checkIn && rangeIsFree(checkIn, dateStr);

  const isInRange = (dateStr: string) => {
    const end = checkOut ?? (hovered && isSelectableCheckOut(hovered) ? hovered : null);
    if (!checkIn || !end) return false;
    return dateStr > checkIn && dateStr < end;
  };

  const startOver = (dateStr: string | null) => {
    setCheckIn(dateStr);
    setCheckOut(null);
    setHovered(null);
    onClear();
    if (dateStr) onCheckInSelected?.(dateStr);
  };

  const handleDayClick = (dateStr: string) => {
    if (dateStr < today) return;

    if (isSelectableCheckOut(dateStr)) {
      setCheckOut(dateStr);
      const nights = nightsBetween(checkIn!, dateStr);
      onDatesSelected(checkIn!, dateStr, nights, pricePerNight * nights);
      return;
    }

    if (!isBlocked(dateStr)) startOver(dateStr);
  };

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  const monthLabel = viewDate.toLocaleString("default", { month: "long", year: "numeric" });
  const isCurrentMonth = localDateStr(viewDate).slice(0, 7) === today.slice(0, 7);

  const days: (string | null)[] = [];
  for (let i = 0; i < firstDay; i++) days.push(null);
  for (let d = 1; d <= daysInMonth; d++) {
    const dd = String(d).padStart(2, "0");
    const mm = String(month + 1).padStart(2, "0");
    days.push(`${year}-${mm}-${dd}`);
  }

  return (
    <div className="select-none">
      {loading && <p className="mb-2 text-xs text-muted-foreground">Loading availability…</p>}
      {error && (
        <p className="mb-2 text-xs text-destructive">
          Couldn&apos;t load availability. Some dates shown as open may be taken.
        </p>
      )}
      <div className="flex items-center justify-between mb-3">
        <button
          type="button"
          aria-label="Previous month"
          disabled={isCurrentMonth}
          onClick={() => setViewDate(addMonths(viewDate, -1))}
          className="p-1 rounded hover:bg-muted disabled:opacity-30 disabled:hover:bg-transparent"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <span className="text-sm font-semibold">{monthLabel}</span>
        <button
          type="button"
          aria-label="Next month"
          onClick={() => setViewDate(addMonths(viewDate, 1))}
          className="p-1 rounded hover:bg-muted"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      <div className="grid grid-cols-7 text-center text-xs text-muted-foreground mb-1">
        {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
          <span key={d}>{d}</span>
        ))}
      </div>

      <div className="grid grid-cols-7 text-center text-sm gap-y-1">
        {days.map((dateStr, i) => {
          if (!dateStr) return <div key={i} />;
          const past = dateStr < today;
          const checkOutOption = !past && isSelectableCheckOut(dateStr);
          const unavailable = past || (isBlocked(dateStr) && !checkOutOption);
          const isStart = dateStr === checkIn;
          const isEnd = dateStr === checkOut;
          const inRange = isInRange(dateStr);

          return (
            <button
              type="button"
              key={dateStr}
              disabled={unavailable}
              aria-pressed={isStart || isEnd}
              onMouseEnter={() => checkIn && !checkOut && setHovered(dateStr)}
              onMouseLeave={() => setHovered(null)}
              onClick={() => handleDayClick(dateStr)}
              className={cn(
                "py-1 rounded transition-colors",
                unavailable && "text-muted-foreground/40 cursor-not-allowed line-through",
                !unavailable && !isStart && !isEnd && !inRange && "hover:bg-muted",
                inRange && "bg-primary/10",
                (isStart || isEnd) && "bg-primary text-primary-foreground font-semibold",
              )}
            >
              {Number(dateStr.slice(8))}
            </button>
          );
        })}
      </div>

      {(checkIn || checkOut) && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="mt-3 w-full text-xs"
          onClick={() => startOver(null)}
        >
          Clear dates
        </Button>
      )}
    </div>
  );
}
