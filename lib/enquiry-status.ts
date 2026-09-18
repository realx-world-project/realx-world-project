export type EnquiryStatusLabel = "Awaiting Reply" | "Replied" | "Active";

/**
 * Derives a display status from message history since the schema has no
 * explicit "closed"/"active" field — status is inferred from who sent the
 * most recent message.
 */
export function getEnquiryStatus(enquiry: {
  sellerReply?: string | null;
  listing: { userId: string };
  messages: { senderId: string }[];
}): EnquiryStatusLabel {
  if (!enquiry.sellerReply) return "Awaiting Reply";
  const lastMessage = enquiry.messages[enquiry.messages.length - 1];
  if (lastMessage && lastMessage.senderId === enquiry.listing.userId) return "Replied";
  return "Active";
}

export function statusBadgeVariant(status: EnquiryStatusLabel): "warning" | "success" | "default" {
  if (status === "Awaiting Reply") return "warning";
  if (status === "Replied") return "success";
  return "default";
}
