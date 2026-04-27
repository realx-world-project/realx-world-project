"use client";

import { useState } from "react";
import { Bookmark } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";

interface BookmarkToggleProps {
  listingId: string;
  isSaved?: boolean;
  size?: "default" | "sm" | "lg" | "icon";
  showLabel?: boolean;
  className?: string;
}

export function BookmarkToggle({
  listingId,
  isSaved: initialSaved = false,
  size = "default",
  showLabel = false,
  className,
}: BookmarkToggleProps) {
  const [isSaved, setIsSaved] = useState(initialSaved);
  const [isPending, setIsPending] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const handleToggle = async () => {
    const previous = isSaved;
    setIsSaved(!isSaved);

    try {
      const res = await fetch(`/api/listings/${listingId}/bookmark`, {
        method: isSaved ? "DELETE" : "POST",
      });

      if (res.status === 401) {
        setIsSaved(previous);
        router.push("/login");
        return;
      }

      if (!res.ok) throw new Error();

      toast({
        title: isSaved ? "Removed from saved" : "Listing saved",
        description: isSaved ? "Removed from your saved listings" : "Added to your saved listings",
      });
    } catch {
      setIsSaved(previous);
      toast({
        title: "Something went wrong",
        description: "Could not update saved listing. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Button
      variant={isSaved ? "default" : "outline"}
      size={size}
      onClick={handleToggle}
      disabled={isPending}
      className={cn("w-full", isSaved && "bg-primary hover:bg-primary/90", className)}
    >
      <Bookmark className={cn("h-4 w-4", isSaved ? "fill-current" : "", showLabel && "mr-2")} />
      {showLabel && <span>{isSaved ? "Saved" : "Save Listing"}</span>}
    </Button>
  );
}
