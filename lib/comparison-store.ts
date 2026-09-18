export const COMPARISON_KEY = "realx_compare";
export const MAX_COMPARE = 3;

export function getCompareIds(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(COMPARISON_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function addToCompare(id: string): { success: boolean; message?: string } {
  const ids = getCompareIds();
  if (ids.includes(id)) return { success: false, message: "Already in comparison" };
  if (ids.length >= MAX_COMPARE) {
    return {
      success: false,
      message: `You can compare up to ${MAX_COMPARE} properties at a time`,
    };
  }
  localStorage.setItem(COMPARISON_KEY, JSON.stringify([...ids, id]));
  return { success: true };
}

export function removeFromCompare(id: string): void {
  const ids = getCompareIds().filter((i) => i !== id);
  localStorage.setItem(COMPARISON_KEY, JSON.stringify(ids));
}

export function clearCompare(): void {
  localStorage.removeItem(COMPARISON_KEY);
}

export function isInCompare(id: string): boolean {
  return getCompareIds().includes(id);
}
