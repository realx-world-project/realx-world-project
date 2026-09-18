"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Bookmark, BookmarkCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";

export interface SavedSearchFilters {
  type?: string;
  category?: string;
  state?: string;
  priceMin?: string;
  priceMax?: string;
}

interface SaveSearchButtonProps {
  href: string;
  query: string;
  filters: SavedSearchFilters;
  defaultName: string;
  className?: string;
}

export function SaveSearchButton({ href, query, filters, defaultName, className }: SaveSearchButtonProps) {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [savedHrefs, setSavedHrefs] = useState<Set<string>>(new Set());
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState(defaultName);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!session?.user) return;
    fetch("/api/searches")
      .then((res) => (res.ok ? res.json() : []))
      .then((data: any[]) => setSavedHrefs(new Set(data.map((s: any) => s.href))))
      .catch(() => {});
  }, [session?.user]);

  const isSaved = savedHrefs.has(href);

  const handleOpen = () => {
    if (!session?.user) {
      toast({ title: "Sign in to save searches" });
      return;
    }
    setName(defaultName);
    setIsOpen(true);
  };

  const handleSave = async () => {
    if (name.trim().length < 2) {
      toast({ title: "Please enter a name (min 2 characters)", variant: "destructive" });
      return;
    }
    setIsSaving(true);
    try {
      const res = await fetch("/api/searches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), query: query || undefined, filters, href }),
      });
      const data = await res.json();

      if (!res.ok) {
        if (data.error === "Search already saved") {
          toast({ title: "Already saved" });
          setSavedHrefs((prev) => new Set(prev).add(href));
          setIsOpen(false);
          return;
        }
        throw new Error(data.error || "Failed to save search");
      }

      toast({ title: "Search saved!" });
      setSavedHrefs((prev) => new Set(prev).add(href));
      setIsOpen(false);
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to save search",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isSaved) {
    return (
      <Button
        variant="outline"
        size="sm"
        disabled
        className={cn("border-[#D4AF37] text-[#D4AF37]", className)}
      >
        <BookmarkCheck className="mr-1 h-3.5 w-3.5" />
        Saved
      </Button>
    );
  }

  return (
    <>
      <Button variant="outline" size="sm" onClick={handleOpen} className={className}>
        <Bookmark className="mr-1 h-3.5 w-3.5" />
        Save Search
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader>
            <DialogTitle>Save this search</DialogTitle>
            <DialogDescription>You&apos;ll be able to run it again from your dashboard.</DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-2">
            <label htmlFor="search-name" className="text-sm font-medium">
              Search name
            </label>
            <Input id="search-name" value={name} onChange={(e) => setName(e.target.value)} maxLength={50} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={isSaving || name.trim().length < 2}
              className="bg-[#D4AF37] text-black hover:bg-[#D4AF37]/90"
            >
              {isSaving ? "Saving…" : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
