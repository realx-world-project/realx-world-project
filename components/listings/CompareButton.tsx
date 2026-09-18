"use client";

import { useCallback, useEffect, useState } from "react";
import { GitCompare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";
import { addToCompare, getCompareIds, MAX_COMPARE, removeFromCompare } from "@/lib/comparison-store";

interface CompareButtonProps {
  listingId: string;
  className?: string;
}

export function CompareButton({ listingId, className }: CompareButtonProps) {
  const { toast } = useToast();
  const [inCompare, setInCompare] = useState(false);
  const [isFull, setIsFull] = useState(false);

  const sync = useCallback(() => {
    const ids = getCompareIds();
    setInCompare(ids.includes(listingId));
    setIsFull(ids.length >= MAX_COMPARE && !ids.includes(listingId));
  }, [listingId]);

  useEffect(() => {
    sync();
    window.addEventListener("compareUpdated", sync);
    return () => window.removeEventListener("compareUpdated", sync);
  }, [sync]);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (inCompare) {
      removeFromCompare(listingId);
      window.dispatchEvent(new Event("compareUpdated"));
      return;
    }

    if (isFull) return;

    const result = addToCompare(listingId);
    if (!result.success) {
      toast({ title: result.message ?? "Could not add to comparison", variant: "destructive" });
      return;
    }
    window.dispatchEvent(new Event("compareUpdated"));
    toast({ title: "Added to comparison" });
  };

  if (isFull) {
    return (
      <Button
        variant="outline"
        size="sm"
        disabled
        title="Remove a property to add this one"
        className={cn(className)}
      >
        Compare full
      </Button>
    );
  }

  return (
    <Button
      variant={inCompare ? "default" : "outline"}
      size="sm"
      onClick={handleClick}
      className={cn(inCompare && "bg-[#D4AF37] text-black hover:bg-[#D4AF37]/90 border-transparent", className)}
    >
      <GitCompare className="mr-2 h-4 w-4" />
      {inCompare ? "Comparing" : "Compare"}
    </Button>
  );
}
