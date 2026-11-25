import { format } from "date-fns";

export const formatNGN = (n: number) =>
  new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(n);

// Booking dates are stored as UTC midnight; format the calendar day itself so
// the server's timezone can't shift it.
export const formatBookingDay = (d: Date) =>
  format(new Date(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()), "MMM d, yyyy");

export const bookingStatusColors: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  CONFIRMED: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  CANCELLED: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  COMPLETED: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
};
