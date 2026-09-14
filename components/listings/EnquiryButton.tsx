"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Loader2, Phone, Mail, MessageCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

type EnquiryState = "idle" | "loading" | "paid" | "paying" | "error";

interface EnquiryButtonProps {
  listingId: string;
  sellerPhone?: string;
  sellerEmail?: string;
  paymentsEnabled: boolean;
}

export function EnquiryButton({
  listingId,
  sellerPhone,
  sellerEmail,
  paymentsEnabled,
}: EnquiryButtonProps) {
  const { data: session } = useSession();
  const router = useRouter();

  // When payments are disabled, contact details are free — start straight
  // in the "paid" (unlocked) state. The payment path below is wired up
  // but never triggered while paymentsEnabled is false.
  const [state, setState] = useState<EnquiryState>(paymentsEnabled ? "idle" : "paid");
  const [error, setError] = useState<string | null>(null);

  const startEnquiry = async () => {
    if (!session?.user) {
      router.push("/login");
      return;
    }

    if (!paymentsEnabled) {
      setState("paid");
      return;
    }

    setState("loading");
    setError(null);

    try {
      const res = await fetch("/api/payments/enquiry-fee", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listingId }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to start enquiry");
      }

      if (data.skip) {
        setState("paid");
        return;
      }

      if (data.authorizationUrl) {
        setState("paying");
        window.location.href = data.authorizationUrl;
        return;
      }

      throw new Error("Could not start payment");
    } catch (err) {
      setState("error");
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    }
  };

  if (state === "paid") {
    const waNumber = sellerPhone?.replace(/[^\d]/g, "");
    return (
      <div className="space-y-2">
        {sellerPhone ? (
          <a href={`tel:${sellerPhone}`} className="block">
            <Button className="w-full" size="lg">
              <Phone className="mr-2 h-4 w-4" />
              {sellerPhone}
            </Button>
          </a>
        ) : (
          <div className="rounded-lg bg-muted p-3 text-center text-sm text-muted-foreground">
            Contact info not available
          </div>
        )}
        {waNumber && (
          <a href={`https://wa.me/${waNumber}`} target="_blank" rel="noopener noreferrer" className="block">
            <Button variant="outline" className="w-full">
              <MessageCircle className="mr-2 h-4 w-4" />
              WhatsApp
            </Button>
          </a>
        )}
        {sellerEmail && (
          <a href={`mailto:${sellerEmail}`} className="block">
            <Button variant="outline" className="w-full">
              <Mail className="mr-2 h-4 w-4" />
              Email Seller
            </Button>
          </a>
        )}
      </div>
    );
  }

  if (state === "loading" || state === "paying") {
    return (
      <Button className="w-full" size="lg" disabled>
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        {state === "paying" ? "Redirecting to payment…" : "Please wait…"}
      </Button>
    );
  }

  if (state === "error") {
    return (
      <div className="space-y-2">
        <div className="flex items-start gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
        <Button className="w-full" size="lg" onClick={startEnquiry}>
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <Button
      className="w-full bg-[#D4AF37] text-black hover:bg-[#D4AF37]/90"
      size="lg"
      onClick={startEnquiry}
    >
      <Phone className="mr-2 h-4 w-4" />
      Contact Seller
    </Button>
  );
}
