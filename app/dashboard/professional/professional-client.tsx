"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Upload, X, Loader2, FileText, AlertCircle } from "lucide-react";
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

const professionalCategories = [
  { value: "SURVEYOR", label: "Surveyor" },
  { value: "ARCHITECT", label: "Architect" },
  { value: "ENGINEER", label: "Engineer" },
  { value: "CONTRACTOR", label: "Contractor" },
  { value: "LAWYER", label: "Lawyer / Legal Adviser" },
  { value: "VALUER", label: "Property Valuer" },
  { value: "PLANNER", label: "Urban Planner" },
  { value: "LANDSCAPER", label: "Landscaper" },
  { value: "PROJECT_MANAGER", label: "Project Manager" },
  { value: "PROPERTY_MANAGER", label: "Property Manager" },
  { value: "OTHER", label: "Other" },
] as const;

const nigerianStates = [
  "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue",
  "Borno", "Cross River", "Delta", "Ebonyi", "Edo", "Ekiti", "Enugu", "FCT (Abuja)",
  "Gombe", "Imo", "Jigawa", "Kaduna", "Kano", "Katsina", "Kebbi", "Kogi", "Kwara",
  "Lagos", "Nasarawa", "Niger", "Ogun", "Ondo", "Osun", "Oyo", "Plateau", "Rivers",
  "Sokoto", "Taraba", "Yobe", "Zamfara",
];

const professionalSchema = z.object({
  category: z.enum(
    [
      "SURVEYOR", "ARCHITECT", "ENGINEER", "CONTRACTOR", "LAWYER",
      "VALUER", "PLANNER", "LANDSCAPER", "PROJECT_MANAGER",
      "PROPERTY_MANAGER", "OTHER",
    ],
    { required_error: "Please select a category" }
  ),
  bio: z.string()
    .min(100, "Bio must be at least 100 characters")
    .max(1000, "Bio must be under 1000 characters"),
  company: z.string().optional(),
  experience: z.coerce.number()
    .min(1, "Experience must be at least 1 year")
    .max(60, "Please enter a valid number of years"),
  location: z.string().min(2, "Please enter your area or location"),
  state: z.string().min(1, "Please select a state"),
  phone: z.string()
    .regex(/^0[789]\d{9}$/, "Enter a valid Nigerian phone number"),
  website: z.string().url("Enter a valid URL").optional().or(z.literal("")),
});

type ProfessionalFormData = z.infer<typeof professionalSchema>;

interface Credential {
  id: string;
  name: string;
  fileUrl: string;
  publicId: string;
}

interface Professional {
  id: string;
  category: string;
  bio: string;
  company?: string | null;
  experience: number;
  location: string;
  state: string;
  phone: string;
  website?: string | null;
  status: "PENDING" | "APPROVED" | "REJECTED" | "SUSPENDED";
  credentials?: Credential[];
}

const statusConfig = {
  PENDING: {
    border: "border-l-amber-400",
    badgeVariant: "warning" as const,
    badgeLabel: "Under Review",
    message:
      "Your profile has been submitted and is currently being reviewed by our team. You will be notified once a decision has been made.",
  },
  APPROVED: {
    border: "border-l-green-500",
    badgeVariant: "success" as const,
    badgeLabel: "Approved",
    message: "Your profile is approved and visible in the Professionals Directory.",
  },
  REJECTED: {
    border: "border-l-red-500",
    badgeVariant: "destructive" as const,
    badgeLabel: "Rejected",
    message: "Your profile was not approved. Please update your details and resubmit.",
  },
  SUSPENDED: {
    border: "border-l-red-500",
    badgeVariant: "destructive" as const,
    badgeLabel: "Suspended",
    message: "Your profile has been suspended. Please contact support for more information.",
  },
};

interface PendingUpload {
  file: File;
  status: "uploading" | "done" | "error";
  url?: string;
  publicId?: string;
}

export default function ProfessionalDashboardClient({
  initialProfessional,
}: {
  initialProfessional: Professional | null;
}) {
  const router = useRouter();
  const { toast } = useToast();

  const [prof, setProf] = useState<Professional | null>(initialProfessional);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const [pendingUpload, setPendingUpload] = useState<PendingUpload | null>(null);
  const [credName, setCredName] = useState("");
  const [isAddingCredential, setIsAddingCredential] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);

  const form = useForm<ProfessionalFormData>({
    resolver: zodResolver(professionalSchema),
    defaultValues: {
      category: prof?.category as ProfessionalFormData["category"] | undefined,
      bio: prof?.bio ?? "",
      company: prof?.company ?? "",
      experience: prof?.experience ?? undefined,
      location: prof?.location ?? "",
      state: prof?.state ?? "",
      phone: prof?.phone ?? "",
      website: prof?.website ?? "",
    },
  });

  const bioValue = form.watch("bio") ?? "";

  const onSubmit = async (data: ProfessionalFormData) => {
    setIsSubmitting(true);
    setSubmitError(null);

    const payload = {
      ...data,
      company: data.company || undefined,
      website: data.website || undefined,
    };

    try {
      const res = await fetch(
        prof ? `/api/professionals/${prof.id}` : "/api/professionals",
        {
          method: prof ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        const message = Array.isArray(err.error)
          ? err.error[0]?.message || "Validation failed"
          : err.error || err.message || "Failed to save profile";
        throw new Error(message);
      }

      const savedProf = await res.json();
      setProf(savedProf);
      toast({
        title: prof ? "Profile updated" : "Profile submitted for review",
        description: prof
          ? "Your changes have been saved."
          : "We'll review your profile and notify you once it's approved.",
      });
      router.refresh();
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : "Failed to save profile. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !prof) return;

    setPendingUpload({ file, status: "uploading" });
    setCredName(file.name.replace(/\.[^/.]+$/, ""));

    try {
      const sigRes = await fetch("/api/upload/signature", { method: "POST" });
      if (!sigRes.ok) throw new Error("Could not get upload signature");
      const sig = await sigRes.json();

      const formData = new FormData();
      formData.append("file", file);
      formData.append("signature", sig.signature);
      formData.append("timestamp", sig.timestamp.toString());
      formData.append("api_key", sig.apiKey);
      formData.append("folder", sig.folder);

      const uploadRes = await fetch(
        `https://api.cloudinary.com/v1_1/${sig.cloudName}/auto/upload`,
        { method: "POST", body: formData }
      );
      const uploadData = await uploadRes.json();
      if (!uploadRes.ok) throw new Error(uploadData.error?.message || "Upload failed");

      setPendingUpload({
        file,
        status: "done",
        url: uploadData.secure_url,
        publicId: uploadData.public_id,
      });
    } catch {
      setPendingUpload({ file, status: "error" });
      toast({
        title: "Upload failed",
        description: "Could not upload the document. Please try again.",
        variant: "destructive",
      });
    }
  };

  const addCredential = async () => {
    if (!prof || !pendingUpload || pendingUpload.status !== "done") return;
    if (!credName.trim()) {
      toast({ title: "Name required", description: "Please name this credential.", variant: "destructive" });
      return;
    }

    setIsAddingCredential(true);
    try {
      const res = await fetch(`/api/professionals/${prof.id}/credentials`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: credName.trim(),
          fileUrl: pendingUpload.url,
          publicId: pendingUpload.publicId,
        }),
      });

      if (!res.ok) throw new Error("Failed to add credential");

      const cred = await res.json();
      setProf((p) => (p ? { ...p, credentials: [...(p.credentials ?? []), cred] } : p));
      setPendingUpload(null);
      setCredName("");
      toast({ title: "Credential added" });
    } catch {
      toast({
        title: "Failed to add credential",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAddingCredential(false);
    }
  };

  const removeCredential = async (credentialId: string) => {
    if (!prof) return;
    setRemovingId(credentialId);
    try {
      const res = await fetch(`/api/professionals/${prof.id}/credentials`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ credentialId }),
      });
      if (!res.ok) throw new Error("Failed to remove credential");

      setProf((p) =>
        p ? { ...p, credentials: (p.credentials ?? []).filter((c) => c.id !== credentialId) } : p
      );
      toast({ title: "Credential removed" });
    } catch {
      toast({
        title: "Failed to remove credential",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setRemovingId(null);
    }
  };

  const status = prof ? statusConfig[prof.status] : null;

  return (
    <div className="mx-auto max-w-3xl p-6">
      <h1 className="text-2xl font-bold text-[#0A0A0A] sm:text-3xl">Professional Profile</h1>
      <p className="mt-2 text-muted-foreground">
        Manage your professional profile and credentials shown in the Professionals Directory.
      </p>

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
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {professionalCategories.map((c) => (
                      <SelectItem key={c.value} value={c.value}>
                        {c.label}
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
            name="bio"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Bio</FormLabel>
                <FormControl>
                  <Textarea rows={6} {...field} />
                </FormControl>
                <FormDescription>
                  Describe your professional background, specialisations, and what clients can
                  expect from you. Minimum 100 characters.
                </FormDescription>
                <p className="text-xs text-muted-foreground">{bioValue.length} / 1000 characters</p>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="company"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Company / Firm Name (optional)</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid gap-6 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="experience"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Years of Experience</FormLabel>
                  <FormControl>
                    <Input type="number" min={1} max={60} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Area / Neighbourhood</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Victoria Island, Lekki Phase 1" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
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
          </div>

          <FormField
            control={form.control}
            name="website"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Website (optional)</FormLabel>
                <FormControl>
                  <Input placeholder="https://yourwebsite.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-[#D4AF37] text-black hover:bg-[#D4AF37]/90"
            >
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {prof ? "Save Changes" : "Submit for Review"}
            </Button>
          </div>
        </form>
      </Form>

      <div className="mt-10 border-t pt-6">
        <h2 className="text-lg font-semibold text-[#0A0A0A]">Credentials</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Upload certifications, licences, or other documents that support your profile.
        </p>

        {!prof ? (
          <p className="mt-4 text-sm text-muted-foreground">
            Submit your profile above before adding credentials.
          </p>
        ) : (
          <div className="mt-4 space-y-4">
            {(prof.credentials ?? []).length > 0 && (
              <ul className="divide-y rounded-lg border">
                {(prof.credentials ?? []).map((c) => (
                  <li key={c.id} className="flex items-center justify-between gap-4 px-4 py-3">
                    <a
                      href={c.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm font-medium hover:underline"
                    >
                      <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
                      {c.name}
                    </a>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="text-red-600 hover:bg-red-50 hover:text-red-700"
                      disabled={removingId === c.id}
                      onClick={() => removeCredential(c.id)}
                    >
                      {removingId === c.id && <Loader2 className="mr-2 h-3 w-3 animate-spin" />}
                      Remove
                    </Button>
                  </li>
                ))}
              </ul>
            )}

            {!pendingUpload ? (
              <label
                htmlFor="credential-upload"
                className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border-2 border-dashed border-muted-foreground/25 px-6 py-6 text-sm transition-colors hover:border-muted-foreground/50"
              >
                <Upload className="h-4 w-4 text-muted-foreground" />
                <span>Upload Document</span>
                <input
                  id="credential-upload"
                  type="file"
                  accept="application/pdf,image/*"
                  className="hidden"
                  onChange={handleFileSelect}
                />
              </label>
            ) : (
              <div className="rounded-lg border p-4">
                {pendingUpload.status === "uploading" && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Uploading {pendingUpload.file.name}…
                  </div>
                )}

                {pendingUpload.status === "error" && (
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 text-sm text-red-600">
                      <AlertCircle className="h-4 w-4" />
                      Failed to upload {pendingUpload.file.name}
                    </div>
                    <Button type="button" variant="ghost" size="sm" onClick={() => setPendingUpload(null)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}

                {pendingUpload.status === "done" && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <label htmlFor="credential-name" className="text-sm font-medium">
                        Credential name
                      </label>
                      <Button type="button" variant="ghost" size="sm" onClick={() => setPendingUpload(null)}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    <Input
                      id="credential-name"
                      value={credName}
                      onChange={(e) => setCredName(e.target.value)}
                      placeholder="e.g. Surveyor's License"
                    />
                    <Button
                      type="button"
                      onClick={addCredential}
                      disabled={isAddingCredential}
                      className="bg-[#D4AF37] text-black hover:bg-[#D4AF37]/90"
                    >
                      {isAddingCredential && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Add Credential
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
