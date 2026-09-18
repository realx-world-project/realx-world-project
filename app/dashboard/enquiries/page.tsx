import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { MessageSquare } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getEnquiryStatus, statusBadgeVariant } from "@/lib/enquiry-status";

interface EnquiriesPageProps {
  searchParams: Promise<{ tab?: string }>;
}

function EnquiryRow({
  href,
  listingId,
  title,
  subtitle,
  preview,
  time,
  unread,
  status,
}: {
  href: string;
  listingId: string;
  title: string;
  subtitle: string;
  preview: string;
  time: string;
  unread: boolean;
  status: ReturnType<typeof getEnquiryStatus>;
}) {
  return (
    <div className="flex flex-col gap-3 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          {unread && <span className="h-2 w-2 shrink-0 rounded-full bg-[#D4AF37]" aria-label="Unread" />}
          <Link href={`/listings/${listingId}`} className="truncate font-medium hover:underline">
            {title}
          </Link>
        </div>
        <p className="text-sm text-muted-foreground">{subtitle}</p>
        {preview && (
          <p className="mt-1 line-clamp-1 text-sm text-muted-foreground">{preview}</p>
        )}
        <p className="mt-1 text-xs text-muted-foreground">{time}</p>
      </div>
      <div className="flex shrink-0 items-center gap-3">
        <Badge variant={statusBadgeVariant(status)}>{status}</Badge>
        <Link href={href}>
          <Button size="sm" variant="outline">
            View Thread
          </Button>
        </Link>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16 text-center">
      <MessageSquare className="h-10 w-10 text-muted-foreground/50" />
      <p className="mt-4 text-sm text-muted-foreground">
        No enquiries yet. Browse listings to make an enquiry.
      </p>
      <Link href="/listings" className="mt-4">
        <Button variant="outline">Browse Listings</Button>
      </Link>
    </div>
  );
}

export default async function DashboardEnquiriesPage({ searchParams }: EnquiriesPageProps) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const userId = session.user.id as string;
  const role = (session.user as any).role;
  const db: any = prisma;

  const [received, sent] = await Promise.all([
    db.enquiry.findMany({
      where: { listing: { userId } },
      include: {
        listing: { select: { id: true, title: true, userId: true } },
        buyer: { select: { name: true, email: true } },
        messages: { orderBy: { createdAt: "asc" } },
      },
    }),
    db.enquiry.findMany({
      where: { buyerId: userId },
      include: {
        listing: { select: { id: true, title: true, userId: true } },
        buyer: { select: { name: true, email: true } },
        messages: { orderBy: { createdAt: "asc" } },
      },
    }),
  ]);

  const sortByActivity = (list: any[]) =>
    [...list].sort((a: any, b: any) => {
      const aTime = a.messages[a.messages.length - 1]?.createdAt ?? a.createdAt;
      const bTime = b.messages[b.messages.length - 1]?.createdAt ?? b.createdAt;
      return new Date(bTime).getTime() - new Date(aTime).getTime();
    });

  const receivedSorted = sortByActivity(received);
  const sentSorted = sortByActivity(sent);

  const showReceived = role === "SELLER" || receivedSorted.length > 0;
  const showSent = role === "BUYER" || sentSorted.length > 0;

  const { tab: tabParam } = await searchParams;
  const defaultTab = showReceived ? "received" : "sent";
  const activeTab = tabParam === "sent" || tabParam === "received" ? tabParam : defaultTab;

  const tabs: { key: string; label: string }[] = [
    ...(showReceived ? [{ key: "received", label: "Received" }] : []),
    ...(showSent ? [{ key: "sent", label: "Sent" }] : []),
  ];

  const activeList = activeTab === "sent" ? sentSorted : receivedSorted;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold sm:text-3xl">Enquiries</h1>
        <p className="mt-1 text-muted-foreground">Messages between you and buyers or sellers</p>
      </div>

      {tabs.length > 1 && (
        <div className="flex gap-2 border-b">
          {tabs.map((t) => (
            <Link
              key={t.key}
              href={`/dashboard/enquiries?tab=${t.key}`}
              className={cn(
                "border-b-2 px-4 py-2 text-sm font-medium transition-colors",
                activeTab === t.key
                  ? "border-[#D4AF37] text-[#D4AF37]"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              {t.label}
            </Link>
          ))}
        </div>
      )}

      {activeList.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="space-y-3">
          {activeList.map((enquiry: any) => {
            const isSellerView = activeTab === "received";
            const lastMessage = enquiry.messages[enquiry.messages.length - 1];
            const unread = isSellerView ? !enquiry.isReadBySeller : !enquiry.isReadByBuyer;
            const time = lastMessage
              ? formatDistanceToNow(new Date(lastMessage.createdAt), { addSuffix: true })
              : formatDistanceToNow(new Date(enquiry.createdAt), { addSuffix: true });

            return (
              <EnquiryRow
                key={enquiry.id}
                href={`/dashboard/enquiries/${enquiry.id}`}
                listingId={enquiry.listing.id}
                title={enquiry.listing.title}
                subtitle={isSellerView ? (enquiry.buyer.name ?? enquiry.buyer.email) : "Your enquiry"}
                preview={lastMessage ? lastMessage.message.slice(0, 80) : ""}
                time={time}
                unread={unread}
                status={getEnquiryStatus(enquiry)}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
