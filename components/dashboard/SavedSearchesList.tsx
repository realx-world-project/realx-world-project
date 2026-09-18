"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { Bookmark, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export interface SavedSearchItem {
  id: string;
  name: string;
  query: string | null;
  filters: {
    type?: string;
    category?: string;
    state?: string;
    priceMin?: string;
    priceMax?: string;
  };
  href: string;
  createdAt: string;
}

interface SavedSearchesListProps {
  initialSearches: SavedSearchItem[];
}

const TYPE_LABELS: Record<string, string> = {
  SALE: "For Sale",
  SHORT_TERM: "Short-Term Rental",
  MONTHLY: "Monthly Rental",
  ANNUAL: "Annual Lease",
  LONG_TERM: "Long-Term Lease",
};

const CATEGORY_LABELS: Record<string, string> = {
  RESIDENTIAL: "Residential",
  COMMERCIAL: "Commercial",
  LAND: "Land",
};

function formatPriceBadge(priceMin?: string, priceMax?: string): string | null {
  if (!priceMin && !priceMax) return null;
  const fmt = (n: string) => `₦${Number(n).toLocaleString()}`;
  if (priceMin && priceMax) return `${fmt(priceMin)} – ${fmt(priceMax)}`;
  if (priceMin) return `Above ${fmt(priceMin)}`;
  return `Under ${fmt(priceMax!)}`;
}

export function SavedSearchesList({ initialSearches }: SavedSearchesListProps) {
  const [searches, setSearches] = useState<SavedSearchItem[]>(initialSearches);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const router = useRouter();

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this saved search?")) return;

    const previous = searches;
    setDeletingId(id);
    setSearches((prev) => prev.filter((s) => s.id !== id));

    try {
      const res = await fetch(`/api/searches/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
    } catch {
      setSearches(previous);
    } finally {
      setDeletingId(null);
    }
  };

  if (searches.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16 text-center">
        <Bookmark className="h-10 w-10 text-muted-foreground/50" />
        <p className="mt-4 max-w-sm text-sm text-muted-foreground">
          No saved searches yet. Use the search filters on the listings page and click &quot;Save
          Search&quot; to save one.
        </p>
        <Button
          onClick={() => router.push("/listings")}
          className="mt-4 bg-[#D4AF37] text-black hover:bg-[#D4AF37]/90"
        >
          Browse Listings
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {searches.map((s) => {
        const priceBadge = formatPriceBadge(s.filters.priceMin, s.filters.priceMax);
        return (
          <div key={s.id} className="space-y-3 rounded-lg border p-4">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-bold">{s.name}</p>
                <p className="text-xs text-muted-foreground">
                  Saved {format(new Date(s.createdAt), "MMM d, yyyy")}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {s.query && <Badge variant="outline">&quot;{s.query}&quot;</Badge>}
              {s.filters.type && <Badge variant="outline">{TYPE_LABELS[s.filters.type] ?? s.filters.type}</Badge>}
              {s.filters.category && (
                <Badge variant="outline">{CATEGORY_LABELS[s.filters.category] ?? s.filters.category}</Badge>
              )}
              {s.filters.state && <Badge variant="outline">{s.filters.state}</Badge>}
              {priceBadge && <Badge variant="outline">{priceBadge}</Badge>}
              {!s.query &&
                !s.filters.type &&
                !s.filters.category &&
                !s.filters.state &&
                !priceBadge && <Badge variant="outline">All Properties</Badge>}
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push(s.href)}
                className="border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37] hover:text-black"
              >
                Search Again
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDelete(s.id)}
                disabled={deletingId === s.id}
                className="border-red-300 text-red-600 hover:bg-red-50 hover:text-red-700"
              >
                <Trash2 className="mr-1 h-3.5 w-3.5" />
                Delete
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
