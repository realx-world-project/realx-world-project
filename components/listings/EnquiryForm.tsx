"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckCircle2, AlertCircle, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface EnquiryFormProps {
  listingId: string;
  listingTitle: string;
  isLoggedIn: boolean;
}

type FormState = "idle" | "submitting" | "success" | "duplicate" | "error";

const MAX_LENGTH = 1000;

export function EnquiryForm({ listingId, listingTitle, isLoggedIn }: EnquiryFormProps) {
  const [message, setMessage] = useState("");
  const [state, setState] = useState<FormState>("idle");
  const [errorText, setErrorText] = useState("");
  const [duplicateId, setDuplicateId] = useState<string | null>(null);

  if (!isLoggedIn) {
    return (
      <div className="rounded-lg border border-amber-300 bg-amber-50 p-4">
        <p className="text-sm font-medium text-amber-900">
          Sign in to send an enquiry to the seller
        </p>
        <Link href={`/login?callbackUrl=/listings/${listingId}`} className="mt-3 block">
          <Button className="w-full bg-[#D4AF37] text-black hover:bg-[#D4AF37]/90">Sign In</Button>
        </Link>
      </div>
    );
  }

  if (state === "success") {
    return (
      <div className="rounded-lg border border-green-300 bg-green-50 p-4">
        <div className="flex items-start gap-2">
          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-green-600" />
          <div>
            <p className="font-medium text-green-900">Enquiry Sent!</p>
            <p className="mt-1 text-sm text-green-800">
              The seller has been notified. You can track your enquiry in your dashboard.
            </p>
          </div>
        </div>
        <Link href="/dashboard/enquiries" className="mt-3 block">
          <Button variant="outline" className="w-full">
            View My Enquiries
          </Button>
        </Link>
      </div>
    );
  }

  if (state === "duplicate") {
    return (
      <div className="rounded-lg border border-amber-300 bg-amber-50 p-4">
        <p className="text-sm font-medium text-amber-900">
          You already have an active enquiry for this listing.
        </p>
        <Link href={duplicateId ? `/dashboard/enquiries/${duplicateId}` : "/dashboard/enquiries"} className="mt-3 block">
          <Button className="w-full bg-[#D4AF37] text-black hover:bg-[#D4AF37]/90">View Enquiry</Button>
        </Link>
      </div>
    );
  }

  const handleSubmit = async () => {
    if (message.trim().length < 20) {
      setErrorText("Your message must be at least 20 characters");
      setState("error");
      return;
    }

    setState("submitting");
    setErrorText("");

    try {
      const res = await fetch("/api/enquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listingId, message }),
      });
      const data = await res.json();

      if (res.status === 409) {
        setDuplicateId(data.enquiryId ?? null);
        setState("duplicate");
        return;
      }

      if (!res.ok) {
        throw new Error(data.error || "Failed to send enquiry");
      }

      setState("success");
    } catch (err) {
      setErrorText(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      setState("error");
    }
  };

  return (
    <div className="space-y-3 rounded-lg border p-4">
      <div className="flex items-center gap-2">
        <MessageSquare className="h-4 w-4 text-[#D4AF37]" />
        <p className="text-sm font-medium">Enquire about this property</p>
      </div>

      <Textarea
        value={message}
        onChange={(e) => setMessage(e.target.value.slice(0, MAX_LENGTH))}
        placeholder={`Hi, I am interested in this property. Could you provide more details about...`}
        rows={4}
        maxLength={MAX_LENGTH}
        className="resize-none"
      />
      <p className="text-right text-xs text-muted-foreground">
        {message.length} / {MAX_LENGTH}
      </p>

      {state === "error" && errorText && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{errorText}</AlertDescription>
        </Alert>
      )}

      <Button
        onClick={handleSubmit}
        disabled={state === "submitting"}
        className="w-full bg-[#D4AF37] text-black hover:bg-[#D4AF37]/90"
      >
        {state === "submitting" ? "Sending…" : "Send Enquiry"}
      </Button>
    </div>
  );
}
