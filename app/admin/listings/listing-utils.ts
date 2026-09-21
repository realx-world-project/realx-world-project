export const listingStatusVariants: Record<string,
  "default" | "secondary" | "destructive" | "outline" |
  "warning" | "success"> = {
  PENDING: "warning",
  APPROVED: "default",
  PUBLISHED: "success",
  REJECTED: "destructive",
};

export const VALID_STATUSES = ["PENDING", "APPROVED", "REJECTED", "PUBLISHED"];
export const VALID_CATEGORIES = ["RESIDENTIAL", "COMMERCIAL", "LAND"];
