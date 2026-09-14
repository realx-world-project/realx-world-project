"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Loader2, CheckCircle2, XCircle, Phone, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

type VerifyState = "loading" | "success" | "error";

function VerifyPaymentContent() {
  const searchParams = useSearchParams();
  const reference = searchParams.get("reference");

  const [state, setState] = useState<VerifyState>("loading");
  const [message, setMessage] = useState<string | null>(null);
  const [paymentType, setPaymentType] = useState<string | null>(null);
  const [seller, setSeller] = useState<{ name?: string; phone?: string; email?: string } | null>(null);

  const verify = useCallback(async () => {
    if (!reference) {
      setState("error");
      setMessage("No payment reference was provided.");
      return;
    }

    setState("loading");
    try {
      const res = await fetch(`/api/payments/verify?reference=${encodeURIComponent(reference)}`);
      const data = await res.json();

      if (!res.ok || data.verified === false) {
        setState("error");
        setMessage(data.message || data.error || "Payment verification failed.");
        return;
      }

      setPaymentType(data.type ?? null);
      if (data.seller) setSeller(data.seller);
      setState("success");
    } catch {
      setState("error");
      setMessage("Something went wrong while verifying your payment.");
    }
  }, [reference]);

  useEffect(() => {
    verify();
  }, [verify]);

  return (
    <div className="mx-auto max-w-lg p-6">
      <Card>
        <CardContent className="flex flex-col items-center gap-4 p-8 text-center">
          {state === "loading" && (
            <>
              <Loader2 className="h-12 w-12 animate-spin text-[#D4AF37]" />
              <h1 className="text-xl font-semibold">Verifying your payment…</h1>
              <p className="text-sm text-muted-foreground">This will only take a moment.</p>
            </>
          )}

          {state === "success" && (
            <>
              <CheckCircle2 className="h-14 w-14 text-green-600" />
              <h1 className="text-xl font-semibold">Payment Successful</h1>
              <p className="text-sm text-muted-foreground">
                {paymentType === "ENQUIRY_FEE"
                  ? "Your enquiry fee has been paid. Here are the seller's contact details:"
                  : "Your payment was confirmed."}
              </p>

              {seller && (
                <div className="w-full space-y-2 rounded-lg bg-muted p-4 text-left text-sm">
                  {seller.name && <p className="font-medium">{seller.name}</p>}
                  {seller.phone && (
                    <p className="flex items-center gap-2 text-muted-foreground">
                      <Phone className="h-4 w-4" /> {seller.phone}
                    </p>
                  )}
                  {seller.email && (
                    <p className="flex items-center gap-2 text-muted-foreground">
                      <Mail className="h-4 w-4" /> {seller.email}
                    </p>
                  )}
                </div>
              )}

              <div className="mt-2 flex gap-3">
                <Link href="/dashboard/payments">
                  <Button className="bg-[#D4AF37] text-black hover:bg-[#D4AF37]/90">
                    View Payment History
                  </Button>
                </Link>
                <Link href="/dashboard">
                  <Button variant="outline">Go to Dashboard</Button>
                </Link>
              </div>
            </>
          )}

          {state === "error" && (
            <>
              <XCircle className="h-14 w-14 text-red-600" />
              <h1 className="text-xl font-semibold">Payment Verification Failed</h1>
              <p className="text-sm text-muted-foreground">{message}</p>
              <div className="mt-2 flex gap-3">
                <Button
                  className="bg-[#D4AF37] text-black hover:bg-[#D4AF37]/90"
                  onClick={() => verify()}
                >
                  Retry
                </Button>
                <Link href="/dashboard">
                  <Button variant="outline">Go to Dashboard</Button>
                </Link>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function VerifyLoadingFallback() {
  return (
    <div className="mx-auto max-w-lg p-6">
      <Card>
        <CardContent className="flex flex-col items-center gap-4 p-8 text-center">
          <Loader2 className="h-12 w-12 animate-spin text-[#D4AF37]" />
          <h1 className="text-xl font-semibold">Verifying your payment…</h1>
        </CardContent>
      </Card>
    </div>
  );
}

export default function VerifyPaymentPage() {
  return (
    <Suspense fallback={<VerifyLoadingFallback />}>
      <VerifyPaymentContent />
    </Suspense>
  );
}
