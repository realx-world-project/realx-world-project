"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Plus, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { nigerianStates, formatMaterialPrice } from "@/lib/materials";
import Link from "next/link";

const vendorSchema = z.object({
  businessName: z.string().min(2, "Business name must be at least 2 characters"),
  description: z.string().min(50, "Description must be at least 50 characters").max(1000),
  phone: z.string().regex(/^0[789]\d{9}$/, "Enter a valid Nigerian phone number"),
  whatsapp: z
    .string()
    .regex(/^0[789]\d{9}$/, "Enter a valid Nigerian phone number")
    .optional()
    .or(z.literal("")),
  email: z.string().email("Enter a valid email").optional().or(z.literal("")),
  address: z.string().min(3, "Please enter your business address"),
  state: z.string().min(1, "Please select a state"),
});

type VendorFormData = z.infer<typeof vendorSchema>;

interface MaterialListing {
  id: string;
  title: string;
  price: number;
  unit: string;
  status: "PENDING" | "APPROVED" | "REJECTED" | "SUSPENDED";
}

interface Vendor {
  id: string;
  businessName: string;
  description: string;
  phone: string;
  whatsapp?: string | null;
  email?: string | null;
  address: string;
  state: string;
  isVerified: boolean;
  status: "PENDING" | "APPROVED" | "REJECTED" | "SUSPENDED";
  listings?: MaterialListing[];
}

const statusConfig = {
  PENDING: {
    border: "border-l-amber-400",
    badgeVariant: "warning" as const,
    badgeLabel: "Under Review",
    message:
      "Your vendor account has been submitted and is currently being reviewed by our team. You will be notified once a decision has been made.",
  },
  APPROVED: {
    border: "border-l-green-500",
    badgeVariant: "success" as const,
    badgeLabel: "Approved",
    message: "Your vendor account is approved. You can now list building materials.",
  },
  REJECTED: {
    border: "border-l-red-500",
    badgeVariant: "destructive" as const,
    badgeLabel: "Rejected",
    message: "Your vendor account was not approved. Please update your details and resubmit.",
  },
  SUSPENDED: {
    border: "border-l-red-500",
    badgeVariant: "destructive" as const,
    badgeLabel: "Suspended",
    message: "Your vendor account has been suspended. Please contact support for more information.",
  },
};

const listingStatusVariants: Record<string, "warning" | "default" | "success" | "destructive"> = {
  PENDING: "warning",
  APPROVED: "success",
  REJECTED: "destructive",
  SUSPENDED: "destructive",
};

export default function VendorDashboardClient({
  initialVendor,
}: {
  initialVendor: Vendor | null;
}) {
  const router = useRouter();
  const { toast } = useToast();

  const [vendor, setVendor] = useState<Vendor | null>(initialVendor);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const form = useForm<VendorFormData>({
    resolver: zodResolver(vendorSchema),
    defaultValues: {
      businessName: "",
      description: "",
      phone: "",
      whatsapp: "",
      email: "",
      address: "",
      state: "",
    },
  });

  const onSubmit = async (data: VendorFormData) => {
    setIsSubmitting(true);
    setSubmitError(null);

    const payload = {
      ...data,
      whatsapp: data.whatsapp || undefined,
      email: data.email || undefined,
    };

    try {
      const res = await fetch("/api/vendors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        const message = Array.isArray(err.error)
          ? err.error[0]?.message || "Validation failed"
          : err.error || err.message || "Failed to register vendor account";
        throw new Error(message);
      }

      const savedVendor = await res.json();
      setVendor({ ...savedVendor, listings: [] });
      toast({
        title: "Vendor account submitted for review",
        description: "We'll review your account and notify you once it's approved.",
      });
      router.refresh();
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : "Failed to register vendor account. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const deleteListing = async (id: string) => {
    setDeletingId(id);
    try {
      const res = await fetch(`/api/materials/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete listing");

      setVendor((v) =>
        v ? { ...v, listings: (v.listings ?? []).filter((l) => l.id !== id) } : v
      );
      toast({ title: "Listing deleted" });
    } catch {
      toast({
        title: "Failed to delete listing",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setDeletingId(null);
    }
  };

  const status = vendor ? statusConfig[vendor.status] : null;

  return (
    <div className="mx-auto max-w-4xl p-6">
      <h1 className="text-2xl font-bold text-[#0A0A0A] sm:text-3xl">Vendor Dashboard</h1>
      <p className="mt-2 text-muted-foreground">
        Register and manage your building materials vendor profile.
      </p>

      {!vendor ? (
        <>
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
                name="businessName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Business Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea rows={5} {...field} />
                    </FormControl>
                    <FormDescription>
                      Describe what materials you supply and your business. Minimum 50 characters.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid gap-6 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. 08012345678" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="whatsapp"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>WhatsApp (optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. 08012345678" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email (optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="business@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="state"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>State</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select state" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {nigerianStates.map((s) => (
                          <SelectItem key={s} value={s}>
                            {s}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <p className="text-sm text-muted-foreground">
                Your vendor account will be reviewed before you can list materials.
              </p>

              <div className="flex justify-end">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-[#D4AF37] text-black hover:bg-[#D4AF37]/90"
                >
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Register as Vendor
                </Button>
              </div>
            </form>
          </Form>
        </>
      ) : (
        <>
          {status && (
            <Card className={`mt-6 border-l-4 ${status.border}`}>
              <CardContent className="flex items-start justify-between gap-4 p-4">
                <p className="text-sm text-muted-foreground">{status.message}</p>
                <Badge variant={status.badgeVariant} className="shrink-0">
                  {status.badgeLabel}
                </Badge>
              </CardContent>
            </Card>
          )}

          <div className="mt-8 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-[#0A0A0A]">Your Listings</h2>
            {vendor.status === "APPROVED" && (
              <Link href="/dashboard/vendor/listings/new">
                <Button className="bg-[#D4AF37] text-black hover:bg-[#D4AF37]/90">
                  <Plus className="mr-2 h-4 w-4" />
                  Add New Listing
                </Button>
              </Link>
            )}
          </div>

          {(vendor.listings ?? []).length === 0 ? (
            <p className="mt-4 text-sm text-muted-foreground">
              {vendor.status === "APPROVED"
                ? "You haven't listed any materials yet."
                : "You'll be able to list materials once your vendor account is approved."}
            </p>
          ) : (
            <ul className="mt-4 divide-y rounded-lg border">
              {(vendor.listings ?? []).map((l) => (
                <li key={l.id} className="flex items-center justify-between gap-4 px-4 py-3">
                  <div>
                    <p className="font-medium">{l.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatMaterialPrice(l.price)} / {l.unit}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={listingStatusVariants[l.status]}>{l.status}</Badge>
                    <Link href={`/dashboard/vendor/listings/${l.id}/edit`}>
                      <Button type="button" variant="ghost" size="icon">
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="text-red-600 hover:bg-red-50 hover:text-red-700"
                      disabled={deletingId === l.id}
                      onClick={() => deleteListing(l.id)}
                    >
                      {deletingId === l.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  );
}
