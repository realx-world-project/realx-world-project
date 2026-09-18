const RECENT_KEY = "realx_recent_searches";
const MAX_RECENT = 5;

export interface RecentSearch {
  query: string;
  filters: {
    type?: string;
    category?: string;
    state?: string;
    priceMin?: string;
    priceMax?: string;
  };
  label: string;
  href: string;
  timestamp: number;
}

export function getRecentSearches(): RecentSearch[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(RECENT_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function addRecentSearch(search: RecentSearch): void {
  const existing = getRecentSearches();
  const filtered = existing.filter((s) => s.href !== search.href);
  const updated = [search, ...filtered].slice(0, MAX_RECENT);
  localStorage.setItem(RECENT_KEY, JSON.stringify(updated));
}

export function clearRecentSearches(): void {
  localStorage.removeItem(RECENT_KEY);
}
