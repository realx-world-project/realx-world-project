"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, Filter, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const NIGERIAN_STATES = [
  "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue",
  "Borno", "Cross River", "Delta", "Ebonyi", "Edo", "Ekiti", "Enugu", "Gombe",
  "Imo", "Jigawa", "Kaduna", "Kano", "Katsina", "Kebbi", "Kogi", "Kwara",
  "Lagos", "Nasarawa", "Niger", "Ogun", "Ondo", "Osun", "Oyo", "Plateau",
  "Rivers", "Sokoto", "Taraba", "Yobe", "Zamfara", "FCT",
];

const PRICE_RANGES = [
  { label: "Any Price", value: "any" },
  { label: "Under ₦10M", value: "0-10000000" },
  { label: "₦10M – ₦30M", value: "10000000-30000000" },
  { label: "₦30M – ₦50M", value: "30000000-50000000" },
  { label: "₦50M – ₦100M", value: "50000000-100000000" },
  { label: "₦100M – ₦200M", value: "100000000-200000000" },
  { label: "₦200M – ₦500M", value: "200000000-500000000" },
  { label: "₦500M+", value: "500000000-" },
];

interface Filters {
  query: string;
  type: string;
  category: string;
  state: string;
  price: string;
}

function filtersToParams(f: Filters): URLSearchParams {
  const p = new URLSearchParams();
  if (f.query) p.set("q", f.query);
  if (f.type && f.type !== "all") p.set("type", f.type);
  if (f.category && f.category !== "all") p.set("category", f.category);
  if (f.state && f.state !== "all") p.set("state", f.state);
  if (f.price && f.price !== "any") {
    const [min, max] = f.price.split("-");
    if (min) p.set("priceMin", min);
    if (max) p.set("priceMax", max);
  }
  return p;
}

export function SearchBar() {
  const router = useRouter();
  const sp = useSearchParams();

  // Reconstruct current price range value from URL params
  const currentPriceMin = sp.get("priceMin") ?? "";
  const currentPriceMax = sp.get("priceMax") ?? "";
  const currentPriceValue =
    currentPriceMin
      ? `${currentPriceMin}-${currentPriceMax}`
      : "any";

  const [filters, setFilters] = useState<Filters>({
    query: sp.get("q") ?? "",
    type: sp.get("type") ?? "all",
    category: sp.get("category") ?? "all",
    state: sp.get("state") ?? "all",
    price: currentPriceValue,
  });
  const [mobileOpen, setMobileOpen] = useState(false);

  const update = (key: keyof Filters, value: string) =>
    setFilters((prev) => ({ ...prev, [key]: value }));

  const search = () => {
    const qs = filtersToParams(filters).toString();
    router.push(qs ? `/listings?${qs}` : "/listings");
    setMobileOpen(false);
  };

  const clear = () => {
    const reset: Filters = { query: "", type: "all", category: "all", state: "all", price: "any" };
    setFilters(reset);
    router.push("/listings");
  };

  const hasActive =
    filters.type !== "all" ||
    filters.category !== "all" ||
    filters.state !== "all" ||
    filters.price !== "any";

  const FilterControls = () => (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <label className="text-sm font-medium">Property Type</label>
        <Select value={filters.type} onValueChange={(v) => update("type", v)}>
          <SelectTrigger>
            <SelectValue placeholder="All Types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="SALE">For Sale</SelectItem>
            <SelectItem value="RENT">For Rent</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium">Category</label>
        <Select value={filters.category} onValueChange={(v) => update("category", v)}>
          <SelectTrigger>
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="RESIDENTIAL">Residential</SelectItem>
            <SelectItem value="COMMERCIAL">Commercial</SelectItem>
            <SelectItem value="LAND">Land</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium">State</label>
        <Select value={filters.state} onValueChange={(v) => update("state", v)}>
          <SelectTrigger>
            <SelectValue placeholder="All States" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All States</SelectItem>
            {NIGERIAN_STATES.map((s) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium">Price Range</label>
        <Select value={filters.price} onValueChange={(v) => update("price", v)}>
          <SelectTrigger>
            <SelectValue placeholder="Any Price" />
          </SelectTrigger>
          <SelectContent>
            {PRICE_RANGES.map((r) => (
              <SelectItem key={r.value} value={r.value}>
                {r.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex gap-2 pt-2">
        <Button onClick={search} className="flex-1">
          <Search className="mr-2 h-4 w-4" />
          Search
        </Button>
        {hasActive && (
          <Button variant="outline" onClick={clear}>
            <X className="mr-1 h-4 w-4" />
            Clear
          </Button>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-3">
      {/* Desktop layout */}
      <div className="hidden flex-col gap-3 md:flex">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search properties by title or location…"
              value={filters.query}
              onChange={(e) => update("query", e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && search()}
              className="pl-10"
            />
          </div>
          <Button onClick={search}>Search</Button>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Select value={filters.type} onValueChange={(v) => update("type", v)}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="SALE">For Sale</SelectItem>
              <SelectItem value="RENT">For Rent</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filters.category} onValueChange={(v) => update("category", v)}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="RESIDENTIAL">Residential</SelectItem>
              <SelectItem value="COMMERCIAL">Commercial</SelectItem>
              <SelectItem value="LAND">Land</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filters.state} onValueChange={(v) => update("state", v)}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="State" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All States</SelectItem>
              {NIGERIAN_STATES.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filters.price} onValueChange={(v) => update("price", v)}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Price" />
            </SelectTrigger>
            <SelectContent>
              {PRICE_RANGES.map((r) => (
                <SelectItem key={r.value} value={r.value}>
                  {r.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {hasActive && (
            <Button variant="ghost" size="sm" onClick={clear}>
              <X className="mr-1 h-3.5 w-3.5" />
              Clear filters
            </Button>
          )}
        </div>
      </div>

      {/* Mobile layout */}
      <div className="flex gap-2 md:hidden">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search properties…"
            value={filters.query}
            onChange={(e) => update("query", e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && search()}
            className="pl-10"
          />
        </div>

        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" aria-label="Open filters">
              <Filter className="h-4 w-4" />
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-[82vh] overflow-y-auto">
            <SheetHeader>
              <SheetTitle>Filter Properties</SheetTitle>
            </SheetHeader>
            <div className="mt-6">
              <FilterControls />
            </div>
          </SheetContent>
        </Sheet>

        <Button onClick={search} size="icon" aria-label="Search">
          <Search className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
