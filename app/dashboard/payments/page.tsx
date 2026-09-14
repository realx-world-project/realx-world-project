import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { format } from "date-fns";
import { Receipt } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const dynamic = "force-dynamic";

const typeLabels: Record<string, string> = {
  LISTING_FEE: "Listing Fee",
  ENQUIRY_FEE: "Enquiry Fee",
  ESCROW: "Escrow",
};

const statusVariants: Record<string, "warning" | "default" | "success" | "destructive"> = {
  PENDING: "warning",
  SUCCESS: "success",
  FAILED: "destructive",
  REFUNDED: "default",
};

const formatAmount = (amount: number) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(amount);

export default async function PaymentsPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const db: any = prisma;
  const payments = await db.payment.findMany({
    where: { userId: session.user.id as string },
    orderBy: { createdAt: "desc" },
    include: { listing: { select: { title: true } } },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold sm:text-3xl">Payment History</h1>
        <p className="mt-1 text-muted-foreground">View your listing fee, enquiry fee, and escrow payments</p>
      </div>

      {payments.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16">
          <Receipt className="h-16 w-16 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold">No payments yet</h3>
        </div>
      ) : (
        <div className="rounded-lg border">
          <div className="hidden overflow-x-auto md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Listing</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.map((p: any) => (
                  <TableRow key={p.id}>
                    <TableCell className="text-sm text-muted-foreground">
                      {format(new Date(p.createdAt), "MMM d, yyyy")}
                    </TableCell>
                    <TableCell>{typeLabels[p.type] ?? p.type}</TableCell>
                    <TableCell className="tabular-nums">{formatAmount(p.amount)}</TableCell>
                    <TableCell>
                      <Badge variant={statusVariants[p.status] ?? "default"}>{p.status}</Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {p.listing?.title ?? "—"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="space-y-3 p-4 md:hidden">
            {payments.map((p: any) => (
              <div key={p.id} className="rounded-lg border p-4">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{typeLabels[p.type] ?? p.type}</span>
                  <Badge variant={statusVariants[p.status] ?? "default"}>{p.status}</Badge>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  {p.listing?.title ?? "—"}
                </p>
                <div className="mt-2 flex items-center justify-between text-sm">
                  <span className="tabular-nums">{formatAmount(p.amount)}</span>
                  <span className="text-muted-foreground">
                    {format(new Date(p.createdAt), "MMM d, yyyy")}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
