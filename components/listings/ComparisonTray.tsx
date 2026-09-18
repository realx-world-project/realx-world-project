"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { clearCompare, getCompareIds, MAX_COMPARE, removeFromCompare } from "@/lib/comparison-store";

export function ComparisonTray() {
  const [ids, setIds] = useState<string[]>([]);

  const sync = useCallback(() => {
    setIds(getCompareIds());
  }, []);

  useEffect(() => {
    sync();
    window.addEventListener("compareUpdated", sync);
    return () => window.removeEventListener("compareUpdated", sync);
  }, [sync]);

  if (ids.length === 0) return null;

  const handleClear = () => {
    clearCompare();
    window.dispatchEvent(new Event("compareUpdated"));
  };

  const handleRemove = (id: string) => {
    removeFromCompare(id);
    window.dispatchEvent(new Event("compareUpdated"));
  };

  const canCompare = ids.length >= 2;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-[#0A0A0A] px-4 py-3 text-white shadow-[0_-2px_10px_rgba(0,0,0,0.2)]">
      <div className="container mx-auto flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium">
            Comparing {ids.length} of {MAX_COMPARE} properties
          </span>
          <div className="flex flex-wrap gap-1.5">
            {ids.map((id, i) => (
              <span
                key={id}
                className="flex items-center gap-1 rounded-full bg-[#D4AF37] px-3 py-1 text-xs font-semibold text-black"
              >
                Property {i + 1}
                <button
                  onClick={() => handleRemove(id)}
                  aria-label="Remove from comparison"
                  className="ml-1 hover:opacity-70"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleClear}
            className="border-white bg-transparent text-white hover:bg-white hover:text-black"
          >
            Clear All
          </Button>
          {canCompare ? (
            <Link href={`/compare?ids=${ids.join(",")}`}>
              <Button size="sm" className="bg-[#D4AF37] text-black hover:bg-[#D4AF37]/90">
                Compare Now
              </Button>
            </Link>
          ) : (
            <Button
              size="sm"
              disabled
              title="Select at least 2 properties"
              className="bg-[#D4AF37]/40 text-black/50"
            >
              Compare Now
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
