import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Metadata } from "next";
import Link from "next/link";
import { format } from "date-fns";
import { MessageSquare } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Pagination, PaginationContent, PaginationItem,
  PaginationLink, PaginationNext, PaginationPrevious,
} from "@/components/ui/pagination";
import { getEnquiryStatus, statusBadgeVariant } from "@/lib/enquiry-status";

export const metadata: Metadata = {
  title: "Enquiries | RealX Admin",
};

const PAGE_SIZE = 20;

interface AdminEnquiriesPageProps {
  searchParams: Promise<{ page?: string }>;
}

export default async function AdminEnquiriesPage({ searchParams }: AdminEnquiriesPageProps) {
  const session = await auth();
  if (!session || (session.user as any).role !== "ADMIN") redirect("/login");

  const params = await searchParams;
  const page = Math.max(1, Number(params.page ?? 1));
  const db: any = prisma;

  const [enquiries, total] = await Promise.all([
    db.enquiry.findMany({
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: {
        listing: { select: { id: true, title: true, userId: true, user: { select: { name: true, email: true } } } },
        buyer: { select: { name: true, email: true } },
        messages: { orderBy: { createdAt: "asc" }, select: { id: true, senderId: true } },
      },
    }),
    db.enquiry.count(),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const pageHref = (n: number) => `/admin/enquiries?page=${n}`;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Enquiries</h1>
        <p className="mt-1 text-muted-foreground">All buyer-seller enquiries across the platform</p>
      </div>

      {enquiries.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <MessageSquare className="h-14 w-14 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold">No enquiries yet</h3>
        </div>
      ) : (
        <>
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Listing</TableHead>
                  <TableHead>Buyer</TableHead>
                  <TableHead>Seller</TableHead>
                  <TableHead>Messages</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {enquiries.map((enquiry: any) => (
                  <TableRow key={enquiry.id}>
                    <TableCell>
                      <Link
                        href={`/listings/${enquiry.listing.id}`}
                        className="line-clamp-1 font-medium hover:underline"
                        target="_blank"
                      >
                        {enquiry.listing.title}
                      </Link>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {enquiry.buyer?.name ?? enquiry.buyer?.email ?? "—"}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {enquiry.listing.user?.name ?? enquiry.listing.user?.email ?? "—"}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {enquiry.messages.length}
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusBadgeVariant(getEnquiryStatus(enquiry))}>
                        {getEnquiryStatus(enquiry)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {format(new Date(enquiry.createdAt), "MMM d, yyyy")}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {totalPages > 1 && (
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious href={page > 1 ? pageHref(page - 1) : "#"} aria-disabled={page <= 1} />
                </PaginationItem>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                  <PaginationItem key={n}>
                    <PaginationLink href={pageHref(n)} isActive={n === page}>{n}</PaginationLink>
                  </PaginationItem>
                ))}
                <PaginationItem>
                  <PaginationNext href={page < totalPages ? pageHref(page + 1) : "#"} aria-disabled={page >= totalPages} />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </>
      )}
    </div>
  );
}
