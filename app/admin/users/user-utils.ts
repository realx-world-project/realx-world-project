import type { UserRole } from "./user-client";

export const roleVariants: Record<UserRole, "destructive" | "default" | "warning" | "secondary"> = {
  ADMIN: "destructive",
  SELLER: "warning",
  BUYER: "secondary",
};
