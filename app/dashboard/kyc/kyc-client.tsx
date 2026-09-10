"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { Loader2, ShieldAlert, ShieldCheck, ShieldX, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent } from "@/components/ui/card";

const idTypeOptions = [
  { value: "NIN", label: "National Identification Number (NIN)" },
  { value: "BVN", label: "Bank Verification Number (BVN)" },
  { value: "DRIVERS_LICENSE", label: "Driver's License" },
  { value: "PASSPORT", label: "International Passport" },
] as const;

const idNumberPlaceholders: Record<string, string> = {
  NIN: "Enter your 11-digit NIN",
  BVN: "Enter your 11-digit BVN",
  DRIVERS_LICENSE: "Enter your license number",
  PASSPORT: "Enter your passport number",
};

const kycSchema = z.object({
  idType: z.enum(["NIN", "BVN", "DRIVERS_LICENSE", "PASSPORT"], {
    required_error: "Please select an ID type",
  }),
  idNumber: z.string().min(5, "Enter a valid ID number"),
  firstName: z.string().min(2, "Enter your first name"),
  lastName: z.string().min(2, "Enter your last name"),
  dateOfBirth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Enter date in YYYY-MM-DD format"),
});

type KycFormData = z.infer<typeof kycSchema>;

interface KycRecord {
  id: string;
  idType: string;
  status: "PENDING" | "VERIFIED" | "FAILED";
  failureReason?: string | null;
  verifiedAt?: string | null;
  createdAt: string;
}

export default function KycClient({ initialRecord }: { initialRecord: KycRecord | null }) {
  const router = useRouter();
  const [record, setRecord] = useState<KycRecord | null>(initialRecord);
  const [showForm, setShowForm] = useState(!initialRecord);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [consent, setConsent] = useState(false);

  const form = useForm<KycFormData>({
    resolver: zodResolver(kycSchema),
    defaultValues: {
      idType: undefined,
      idNumber: "",
      firstName: "",
      lastName: "",
      dateOfBirth: "",
    },
  });

  const selectedIdType = form.watch("idType");

  const onSubmit = async (data: KycFormData) => {
    if (!consent) {
      setSubmitError("Please consent to identity verification to continue.");
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const res = await fetch("/api/kyc", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error || "Verification failed");
      }

      setRecord({
        id: "current",
        idType: data.idType,
        status: "VERIFIED",
        verifiedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      });
      setShowForm(false);
      router.refresh();
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Verification failed. Please try again.");
      setRecord((prev) =>
        prev
          ? { ...prev, status: "FAILED", failureReason: error instanceof Error ? error.message : "Verification failed" }
          : {
              id: "current",
              idType: data.idType,
              status: "FAILED",
              failureReason: error instanceof Error ? error.message : "Verification failed",
              createdAt: new Date().toISOString(),
            }
      );
      setShowForm(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── STATE 2: VERIFIED ─────────────────────────────────────────────────────
  if (record?.status === "VERIFIED" && !showForm) {
    return (
      <div className="mx-auto max-w-2xl p-6">
        <h1 className="text-2xl font-bold text-[#0A0A0A] sm:text-3xl">Identity Verification</h1>

        <Card className="mt-6 border-l-4 border-green-500">
          <CardContent className="flex flex-col items-center gap-4 p-8 text-center">
            <ShieldCheck className="h-16 w-16 text-green-600" />
            <h2 className="text-xl font-semibold">Identity Verified</h2>
            <p className="text-muted-foreground">
              Your identity has been successfully verified. You can now list properties on RealX World.
            </p>
            <div className="mt-2 space-y-1 text-sm text-muted-foreground">
              <p>
                ID type used:{" "}
                <span className="font-medium text-foreground">
                  {idTypeOptions.find((o) => o.value === record.idType)?.label ?? record.idType}
                </span>
              </p>
              {record.verifiedAt && (
                <p>
                  Verified on{" "}
                  <span className="font-medium text-foreground">
                    {format(new Date(record.verifiedAt), "MMMM d, yyyy")}
                  </span>
                </p>
              )}
            </div>
            <Link href="/dashboard/listings/new" className="mt-4">
              <Button className="bg-[#D4AF37] text-black hover:bg-[#D4AF37]/90">Start Listing</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ── STATE 3: FAILED or PENDING ────────────────────────────────────────────
  if (record && !showForm && (record.status === "FAILED" || record.status === "PENDING")) {
    const isFailed = record.status === "FAILED";

    return (
      <div className="mx-auto max-w-2xl p-6">
        <h1 className="text-2xl font-bold text-[#0A0A0A] sm:text-3xl">Identity Verification</h1>

        <Card className={`mt-6 border-l-4 ${isFailed ? "border-red-500" : "border-amber-400"}`}>
          <CardContent className="flex flex-col items-center gap-4 p-8 text-center">
            {isFailed ? (
              <ShieldX className="h-16 w-16 text-red-600" />
            ) : (
              <Clock className="h-16 w-16 text-amber-500" />
            )}
            <h2 className="text-xl font-semibold">
              {isFailed ? "Verification Failed" : "Verification Pending"}
            </h2>
            <p className="text-muted-foreground">
              {isFailed
                ? record.failureReason ??
                  "Please check your details and try again, or use a different ID type."
                : "Your verification is being processed. Please check back shortly."}
            </p>
            {isFailed && (
              <Button
                className="mt-4 bg-[#D4AF37] text-black hover:bg-[#D4AF37]/90"
                onClick={() => setShowForm(true)}
              >
                Try Again
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  // ── STATE 1: NOT_SUBMITTED (form) ─────────────────────────────────────────
  return (
    <div className="mx-auto max-w-2xl p-6">
      <h1 className="text-2xl font-bold text-[#0A0A0A] sm:text-3xl">Verify Your Identity</h1>

      <Card className="mt-6 border-l-4 border-amber-400">
        <CardContent className="flex gap-3 p-4">
          <ShieldAlert className="h-5 w-5 shrink-0 text-amber-500" />
          <p className="text-sm text-muted-foreground">
            As a seller on RealX World, you are required to verify your identity before you can
            list a property. This helps us maintain a safe and trustworthy marketplace.
          </p>
        </CardContent>
      </Card>

      {submitError && (
        <Alert variant="destructive" className="mt-6">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{submitError}</AlertDescription>
        </Alert>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="mt-6 space-y-6">
          <FormField
            control={form.control}
            name="idType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>ID Type</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select an ID type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {idTypeOptions.map((o) => (
                      <SelectItem key={o.value} value={o.value}>
                        {o.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="idNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>ID Number</FormLabel>
                <FormControl>
                  <Input
                    placeholder={selectedIdType ? idNumberPlaceholders[selectedIdType] : "Select an ID type first"}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid gap-6 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>First Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Must match your ID document" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="lastName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Last Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Must match your ID document" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="dateOfBirth"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Date of Birth</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <label className="flex items-start gap-3 text-sm">
            <input
              type="checkbox"
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
              className="mt-1 h-4 w-4 rounded border-gray-300 text-[#D4AF37] focus:ring-[#D4AF37]"
            />
            <span className="text-muted-foreground">
              I consent to my identity being verified through Youverify&apos;s secure identity
              verification service.
            </span>
          </label>

          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-[#D4AF37] text-black hover:bg-[#D4AF37]/90"
            >
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Verify My Identity
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
