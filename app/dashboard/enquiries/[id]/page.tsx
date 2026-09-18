import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import Image from "next/image";
import { format } from "date-fns";
import { ArrowLeft, Home } from "lucide-react";
import { EnquiryThread, type ThreadMessage } from "@/components/dashboard/EnquiryThread";

interface EnquiryDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function DashboardEnquiryDetailPage({ params }: EnquiryDetailPageProps) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) redirect("/login");

  const userId = session.user.id as string;
  const db: any = prisma;

  const enquiry = await db.enquiry.findUnique({
    where: { id },
    include: {
      listing: {
        select: {
          id: true,
          title: true,
          userId: true,
          images: { where: { isPrimary: true }, take: 1, select: { url: true } },
        },
      },
      buyer: { select: { id: true, name: true, email: true } },
      messages: {
        orderBy: { createdAt: "asc" },
        include: { sender: { select: { id: true, name: true, email: true } } },
      },
    },
  });

  if (!enquiry) notFound();

  const isBuyer = enquiry.buyerId === userId;
  const isSeller = enquiry.listing.userId === userId;
  if (!isBuyer && !isSeller) notFound();

  await db.enquiryMessage.updateMany({
    where: { enquiryId: enquiry.id, senderId: { not: userId }, isRead: false },
    data: { isRead: true },
  });
  await db.enquiry.update({
    where: { id: enquiry.id },
    data: isSeller ? { isReadBySeller: true } : { isReadByBuyer: true },
  });

  const initialMessages: ThreadMessage[] = enquiry.messages.map((m: any) => ({
    id: m.id,
    message: m.message,
    createdAt: m.createdAt.toISOString(),
    senderId: m.senderId,
    senderName: m.sender?.name ?? m.sender?.email ?? "User",
  }));

  const thumbnail = enquiry.listing.images?.[0]?.url ?? null;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Link
        href="/dashboard/enquiries"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Enquiries
      </Link>

      <div className="flex items-center gap-4 rounded-lg border p-4">
        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-md bg-muted">
          {thumbnail ? (
            <Image src={thumbnail} alt={enquiry.listing.title} fill unoptimized className="object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <Home className="h-6 w-6 text-muted-foreground/50" />
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <Link href={`/listings/${enquiry.listing.id}`} className="font-semibold hover:underline">
            {enquiry.listing.title}
          </Link>
          <p className="text-sm text-muted-foreground">
            Enquiry started {format(new Date(enquiry.createdAt), "MMMM d, yyyy")}
          </p>
        </div>
      </div>

      <EnquiryThread
        enquiryId={enquiry.id}
        currentUserId={userId}
        currentUserName={session.user.name ?? session.user.email ?? "You"}
        buyerId={enquiry.buyerId}
        sellerId={enquiry.listing.userId}
        initialMessages={initialMessages}
      />
    </div>
  );
}
