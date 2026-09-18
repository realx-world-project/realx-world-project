"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

export interface ThreadMessage {
  id: string;
  message: string;
  createdAt: string;
  senderId: string;
  senderName: string;
}

interface EnquiryThreadProps {
  enquiryId: string;
  currentUserId: string;
  currentUserName: string;
  buyerId: string;
  sellerId: string;
  initialMessages: ThreadMessage[];
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

// The sender's role is derived from the enquiry's buyer/listing-owner ids,
// not the User.role field — a listing owner is always "Seller" in this
// thread regardless of their platform-wide role.
function getRoleSuffix(senderId: string, buyerId: string, sellerId: string): string {
  if (senderId === buyerId) return "Buyer";
  if (senderId === sellerId) return "Seller";
  return "";
}

export function EnquiryThread({
  enquiryId,
  currentUserId,
  currentUserName,
  buyerId,
  sellerId,
  initialMessages,
}: EnquiryThreadProps) {
  const [messages, setMessages] = useState<ThreadMessage[]>(initialMessages);
  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  const handleSend = async () => {
    const trimmed = reply.trim();
    if (!trimmed) return;

    setSending(true);
    setError("");

    const optimisticMessage: ThreadMessage = {
      id: `optimistic-${Date.now()}`,
      message: trimmed,
      createdAt: new Date().toISOString(),
      senderId: currentUserId,
      senderName: currentUserName,
    };
    setMessages((prev) => [...prev, optimisticMessage]);
    setReply("");

    try {
      const res = await fetch(`/api/enquiries/${enquiryId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: trimmed }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to send reply");

      setMessages((prev) =>
        prev.map((m) =>
          m.id === optimisticMessage.id
            ? {
                id: data.id,
                message: data.message,
                createdAt: data.createdAt,
                senderId: data.senderId,
                senderName: currentUserName,
              }
            : m
        )
      );
    } catch (err) {
      setMessages((prev) => prev.filter((m) => m.id !== optimisticMessage.id));
      setReply(trimmed);
      setError(err instanceof Error ? err.message : "Failed to send reply");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-4 rounded-lg border p-4">
        {messages.map((m) => {
          const isMine = m.senderId === currentUserId;
          const roleSuffix = getRoleSuffix(m.senderId, buyerId, sellerId);
          const label = isMine ? "You" : roleSuffix ? `${m.senderName} · ${roleSuffix}` : m.senderName;
          const initials = isMine ? getInitials(currentUserName) : getInitials(m.senderName);

          return (
            <div key={m.id} className={cn("flex items-end gap-2", isMine ? "flex-row-reverse" : "flex-row")}>
              <div
                className={cn(
                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold",
                  isMine ? "bg-[#D4AF37] text-black" : "bg-gray-200 text-black"
                )}
                aria-hidden
              >
                {initials}
              </div>
              <div className={cn("flex max-w-[75%] flex-col", isMine ? "items-end" : "items-start")}>
                <div
                  className={cn(
                    "rounded-lg px-4 py-2 text-sm",
                    isMine ? "bg-[#D4AF37] text-white" : "bg-gray-100 text-black"
                  )}
                >
                  <p className="whitespace-pre-wrap">{m.message}</p>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {label} · {format(new Date(m.createdAt), "MMM d, h:mm a")}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="space-y-2">
        <Textarea
          value={reply}
          onChange={(e) => setReply(e.target.value)}
          placeholder="Type your reply..."
          rows={3}
          className="resize-none"
        />
        <Button
          onClick={handleSend}
          disabled={sending || !reply.trim()}
          className="w-full bg-[#D4AF37] text-black hover:bg-[#D4AF37]/90 sm:w-auto"
        >
          <Send className="mr-2 h-4 w-4" />
          Send Reply
        </Button>
      </div>
    </div>
  );
}
