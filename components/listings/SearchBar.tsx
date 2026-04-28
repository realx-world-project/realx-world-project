"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, Filter, XCircle } from "lucide-react";
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

// ── Option tables ──────────────────────────────────────────────────────────

const TYPE_OPTIONS = [
  { value: "all",  label: "All Types" },
  { value: "SALE", label: "For Sale" },
  { value: "RENT", label: "For Rent" },
] as const;

const CATEGORY_OPTIONS = [
  { value: "all",          label: "All Categories" },
  { value: "RESIDENTIAL",  label: "Residential" },
  { value: "COMMERCIAL",   label: "Commercial" },
  { value: "LAND",         label: "Land" },
] as const;

const PRICE_OPTIONS = [
  { value: "any",                label: "Any Price" },
  { value: "0-5000000",          label: "Under ₦5M" },
  { value: "5000000-20000000",   label: "₦5M – ₦20M" },
  { value: "20000000-50000000",  label: "₦20M – ₦50M" },
  { value: "50000000-100000000", label: "₦50M – ₦100M" },
  { value: "100000000-",         label: "Above ₦100M" },
] as const;

const NIGERIAN_STATES = [
  "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue",
  "Borno", "Cross River", "Delta", "Ebonyi", "Edo", "Ekiti", "Enugu",
  "FCT", "Gombe", "Imo", "Jigawa", "Kaduna", "Kano", "Katsina", "Kebbi",
  "Kogi", "Kwara", "Lagos", "Nasarawa", "Niger", "Ogun", "Ondo", "Osun",
  "Oyo", "Plateau", "Rivers", "Sokoto", "Taraba", "Yobe", "Zamfara",
];

// ── Label helpers ──────────────────────────────────────────────────────────

function getLabel(
  options: readonly { value: string; label: string }[],
  value: string,
): string {
  return options.find((o) => o.value === value)?.label ?? options[0].label;
}

function getStateLabel(s: string): string {
  if (s === "all") return "All States";
  return s === "FCT" ? "FCT (Abuja)" : s;
}

// ── Types ──────────────────────────────────────────────────────────────────

interface Filters {
  query:    string;
  type:     string;
  category: string;
  state:    string;
  price:    string;
}

// ── Helpers ────────────────────────────────────────────────────────────────

function filtersToParams(f: Filters): URLSearchParams {
  const p = new URLSearchParams();
  if (f.query)              p.set("q",        f.query);
  if (f.type !== "all")     p.set("type",     f.type);
  if (f.category !== "all") p.set("category", f.category);
  if (f.state !== "all")    p.set("state",    f.state);
  if (f.price !== "any") {
    const [min, max] = f.price.split("-");
    if (min) p.set("priceMin", min);
    if (max) p.set("priceMax", max);
  }
  return p;
}

// ── FilterControls — module-level component (never defined inside a render) ─

interface FilterControlsProps {
  filters:          Filters;
  hasActiveFilters: boolean;
  onFilterChange:   (key: keyof Filters, value: string) => void;
  onSearch:         () => void;
  onClear:          () => void;
}

function FilterControls({
  filters,
  hasActiveFilters,
  onFilterChange,
  onSearch,
  onClear,
}: FilterControlsProps) {
  return (
    <div className="space-y-4">
      {/* Type */}
      <div className="space-y-1.5">
        <label className="text-sm font-medium">Property Type</label>
        <Select value={filters.type} onValueChange={(v) => onFilterChange("type", v)}>
          <SelectTrigger className="w-full">
            <SelectValue>{getLabel(TYPE_OPTIONS, filters.type)}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            {TYPE_OPTIONS.map((o) => (
              <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Category */}
      <div className="space-y-1.5">
        <label className="text-sm font-medium">Category</label>
        <Select value={filters.category} onValueChange={(v) => onFilterChange("category", v)}>
          <SelectTrigger className="w-full">
            <SelectValue>{getLabel(CATEGORY_OPTIONS, filters.category)}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            {CATEGORY_OPTIONS.map((o) => (
              <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* State */}
      <div className="space-y-1.5">
        <label className="text-sm font-medium">State</label>
        <Select value={filters.state} onValueChange={(v) => onFilterChange("state", v)}>
          <SelectTrigger className="w-full">
            <SelectValue>{getStateLabel(filters.state)}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All States</SelectItem>
            {NIGERIAN_STATES.map((s) => (
              <SelectItem key={s} value={s}>
                {s === "FCT" ? "FCT (Abuja)" : s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Price */}
      <div className="space-y-1.5">
        <label className="text-sm font-medium">Price Range</label>
        <Select value={filters.price} onValueChange={(v) => onFilterChange("price", v)}>
          <SelectTrigger className="w-full">
            <SelectValue>{getLabel(PRICE_OPTIONS, filters.price)}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            {PRICE_OPTIONS.map((o) => (
              <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Action buttons — standalone, never inside another button */}
      <div className="flex gap-2 pt-2">
        <Button onClick={onSearch} className="flex-1">
          <Search className="mr-2 h-4 w-4" />
          Search
        </Button>
        {hasActiveFilters && (
          <Button
            variant="outline"
            onClick={onClear}
            className="border-gray-300 text-gray-700"
          >
            <XCircle className="mr-1 h-4 w-4" />
            Clear
          </Button>
        )}
      </div>
    </div>
  );
}

// ── SearchBar ──────────────────────────────────────────────────────────────

export function SearchBar() {
  const router = useRouter();
  const sp     = useSearchParams();

  const priceMin = sp.get("priceMin") ?? "";
  const priceMax = sp.get("priceMax") ?? "";
  const currentPrice = priceMin ? `${priceMin}-${priceMax}` : "any";

  const [filters, setFilters] = useState<Filters>({
    query:    sp.get("q")        ?? "",
    type:     sp.get("type")     ?? "all",
    category: sp.get("category") ?? "all",
    state:    sp.get("state")    ?? "all",
    price:    currentPrice,
  });
  const [mobileOpen, setMobileOpen] = useState(false);

  const setFilter = (key: keyof Filters, v: string) =>
    setFilters((prev) => ({ ...prev, [key]: v }));

  const search = () => {
    const qs = filtersToParams(filters).toString();
    router.push(qs ? `/listings?${qs}` : "/listings");
    setMobileOpen(false);
  };

  const clearAll = () => {
    setFilters({ query: "", type: "all", category: "all", state: "all", price: "any" });
    router.push("/listings");
  };

  const hasActiveFilters =
    !!filters.query           ||
    filters.type     !== "all" ||
    filters.category !== "all" ||
    filters.state    !== "all" ||
    filters.price    !== "any";

  return (
    <div className="space-y-3">
      {/* ── Desktop layout ── */}
      <div className="hidden flex-col gap-3 md:flex">
        {/* Search input row */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search properties by title or location…"
              value={filters.query}
              onChange={(e) => setFilter("query", e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && search()}
              className="pl-10"
            />
          </div>
          <Button onClick={search}>Search</Button>
        </div>

        {/* Filter row — SelectTriggers and Clear button are siblings, never nested */}
        <div className="flex flex-wrap items-center gap-2">
          <Select value={filters.type} onValueChange={(v) => setFilter("type", v)}>
            <SelectTrigger className="w-auto bg-white border-gray-200 text-gray-700 min-w-[140px]">
              <SelectValue>{getLabel(TYPE_OPTIONS, filters.type)}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              {TYPE_OPTIONS.map((o) => (
                <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filters.category} onValueChange={(v) => setFilter("category", v)}>
            <SelectTrigger className="w-auto bg-white border-gray-200 text-gray-700 min-w-[155px]">
              <SelectValue>{getLabel(CATEGORY_OPTIONS, filters.category)}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              {CATEGORY_OPTIONS.map((o) => (
                <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filters.state} onValueChange={(v) => setFilter("state", v)}>
            <SelectTrigger className="w-auto bg-white border-gray-200 text-gray-700 min-w-[140px]">
              <SelectValue>{getStateLabel(filters.state)}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All States</SelectItem>
              {NIGERIAN_STATES.map((s) => (
                <SelectItem key={s} value={s}>
                  {s === "FCT" ? "FCT (Abuja)" : s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filters.price} onValueChange={(v) => setFilter("price", v)}>
            <SelectTrigger className="w-auto bg-white border-gray-200 text-gray-700 min-w-[160px]">
              <SelectValue>{getLabel(PRICE_OPTIONS, filters.price)}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              {PRICE_OPTIONS.map((o) => (
                <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {hasActiveFilters && (
            <Button
              variant="outline"
              size="sm"
              onClick={clearAll}
              className="border-gray-300 text-gray-700"
            >
              <XCircle className="mr-1 h-3.5 w-3.5" />
              Clear filters
            </Button>
          )}
        </div>
      </div>

      {/* ── Mobile layout ── */}
      <div className="flex gap-2 md:hidden">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search properties…"
            value={filters.query}
            onChange={(e) => setFilter("query", e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && search()}
            className="pl-10"
          />
        </div>

        {/* Filter sheet — SheetTrigger renders one button via asChild; SheetContent
            portals to document.body so its buttons are never inside the trigger */}
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
              <FilterControls
                filters={filters}
                hasActiveFilters={hasActiveFilters}
                onFilterChange={setFilter}
                onSearch={search}
                onClear={clearAll}
              />
            </div>
          </SheetContent>
        </Sheet>

        {/* Standalone search button — not inside any other button */}
        <Button onClick={search} size="icon" aria-label="Search">
          <Search className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
