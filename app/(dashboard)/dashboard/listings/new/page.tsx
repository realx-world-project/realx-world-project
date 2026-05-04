"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Upload, X, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
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
import { useToast } from "@/components/ui/use-toast";

const nigerianStates = [
  "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue",
  "Borno", "Cross River", "Delta", "Ebonyi", "Edo", "Ekiti", "Enugu", "Gombe",
  "Imo", "Jigawa", "Kaduna", "Kano", "Katsina", "Kebbi", "Kogi", "Kwara",
  "Lagos", "Nasarawa", "Niger", "Ogun", "Ondo", "Osun", "Oyo", "Plateau",
  "Rivers", "Sokoto", "Taraba", "Yobe", "Zamfara", "FCT",
];

const createListingSchema = z.object({
  title: z.string().min(10, "Title must be at least 10 characters").max(100, "Title must be at most 100 characters"),
  description: z.string().min(50, "Description must be at least 50 characters"),
  price: z.coerce.number().positive("Price must be a positive number"),
  type: z.enum(["SALE", "RENT"], { required_error: "Please select a property type" }),
  category: z.enum(["RESIDENTIAL", "COMMERCIAL", "LAND"], { required_error: "Please select a category" }),
  state: z.string().min(1, "Please select a state"),
  city: z.string().min(1, "City is required"),
  area: z.string().optional(),
  address: z.string().min(5, "Full address is required"),
});

type CreateListingFormData = z.infer<typeof createListingSchema>;

interface ImageItem {
  id: string;
  file: File;
  previewUrl: string;
  status: "uploading" | "done" | "error";
  url?: string;
  publicId?: string;
}

export default function CreateListingPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [imageItems, setImageItems] = useState<ImageItem[]>([]);

  const form = useForm<CreateListingFormData>({
    resolver: zodResolver(createListingSchema),
    defaultValues: {
      title: "",
      description: "",
      price: undefined,
      type: undefined,
      category: undefined,
      state: "",
      city: "",
      area: "",
      address: "",
    },
  });

  const uploadFile = async (id: string, file: File) => {
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
        `https://api.cloudinary.com/v1_1/${sig.cloudName}/image/upload`,
        { method: "POST", body: formData }
      );
      const data = await uploadRes.json();
      if (!uploadRes.ok) throw new Error(data.error?.message || "Upload failed");

      setImageItems((prev) =>
        prev.map((item) =>
          item.id === id
            ? { ...item, status: "done", url: data.secure_url, publicId: data.public_id }
            : item
        )
      );
    } catch {
      setImageItems((prev) =>
        prev.map((item) => (item.id === id ? { ...item, status: "error" } : item))
      );
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    if (imageItems.length + files.length > 10) {
      toast({ title: "Too many images", description: "Maximum 10 images allowed", variant: "destructive" });
      return;
    }

    const newItems: ImageItem[] = files.map((file) => ({
      id: crypto.randomUUID(),
      file,
      previewUrl: URL.createObjectURL(file),
      status: "uploading",
    }));

    setImageItems((prev) => [...prev, ...newItems]);
    newItems.forEach((item) => uploadFile(item.id, item.file));
    e.target.value = "";
  };

  const removeImage = (id: string) => {
    setImageItems((prev) => {
      const item = prev.find((i) => i.id === id);
      if (item) URL.revokeObjectURL(item.previewUrl);
      return prev.filter((i) => i.id !== id);
    });
  };

  const onSubmit = async (data: CreateListingFormData) => {
    const uploading = imageItems.some((img) => img.status === "uploading");
    const doneImages = imageItems.filter((img) => img.status === "done");

    if (imageItems.length === 0) {
      setSubmitError("At least 1 image is required");
      return;
    }
    if (uploading) {
      setSubmitError("Please wait for all images to finish uploading");
      return;
    }
    if (doneImages.length === 0) {
      setSubmitError("All image uploads failed. Please try again.");
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const response = await fetch("/api/listings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: data.title,
          description: data.description,
          price: data.price,
          type: data.type,
          category: data.category,
          location: {
            state: data.state,
            city: data.city,
            area: data.area ?? "",
            address: data.address,
          },
          images: doneImages.map((img, idx) => ({
            url: img.url!,
            publicId: img.publicId!,
            isPrimary: idx === 0,
            order: idx,
          })),
        }),
      });

      if (!response.ok) {
        const err = await response.json();
        const message = Array.isArray(err.error)
          ? err.error[0]?.message || "Validation failed"
          : err.message || err.error || "Failed to create listing";
        throw new Error(message);
      }

      toast({
        title: "Listing submitted for review",
        description: "We'll review your listing and notify you shortly.",
      });
      router.push("/dashboard/listings");
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : "Failed to create listing. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const uploadingCount = imageItems.filter((i) => i.status === "uploading").length;
  const doneCount = imageItems.filter((i) => i.status === "done").length;
  const errorCount = imageItems.filter((i) => i.status === "error").length;

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Create New Listing</h1>
        <p className="mt-2 text-muted-foreground">Fill in the details below to list your property</p>
      </div>

      {submitError && (
        <Alert variant="destructive" className="mb-6">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{submitError}</AlertDescription>
        </Alert>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          {/* Basic Info */}
          <div className="rounded-lg border bg-card p-6">
            <h2 className="mb-6 text-xl font-semibold">Basic Information</h2>
            <div className="space-y-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Property Title</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Luxury 4-Bedroom House in Ikoyi" {...field} />
                    </FormControl>
                    <FormDescription>A catchy title for your property (min 10 characters)</FormDescription>
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
                      <Textarea
                        placeholder="Describe your property in detail (minimum 50 characters)..."
                        rows={5}
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>Minimum 50 characters</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price (₦)</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="e.g., 50000000" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Property Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="SALE">For Sale</SelectItem>
                          <SelectItem value="RENT">For Rent</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="RESIDENTIAL">Residential</SelectItem>
                          <SelectItem value="COMMERCIAL">Commercial</SelectItem>
                          <SelectItem value="LAND">Land</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="rounded-lg border bg-card p-6">
            <h2 className="mb-6 text-xl font-semibold">Location</h2>
            <div className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
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
                          {nigerianStates.map((state) => (
                            <SelectItem key={state} value={state}>
                              {state}
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
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>City</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Lagos" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="area"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Area <span className="text-muted-foreground">(optional)</span></FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Ikoyi" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Address</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter the complete address of the property..."
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Images */}
          <div className="rounded-lg border bg-card p-6">
            <h2 className="mb-6 text-xl font-semibold">Images</h2>
            <div className="space-y-4">
              <label
                htmlFor="images"
                className="flex cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25 px-6 py-8 transition-colors hover:border-muted-foreground/50"
              >
                <div className="text-center">
                  <Upload className="mx-auto h-8 w-8 text-muted-foreground" />
                  <p className="mt-2 text-sm text-muted-foreground">Click to upload images</p>
                  <p className="mt-1 text-xs text-muted-foreground">PNG, JPG up to 10MB (max 10 images)</p>
                </div>
                <input
                  id="images"
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handleImageChange}
                />
              </label>

              {imageItems.length > 0 && (
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                  {imageItems.map((item, index) => (
                    <div
                      key={item.id}
                      className="group relative aspect-square overflow-hidden rounded-lg border"
                    >
                      <img
                        src={item.previewUrl}
                        alt={`Preview ${index + 1}`}
                        className="h-full w-full object-cover"
                      />

                      {/* Upload in progress */}
                      {item.status === "uploading" && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                          <Loader2 className="h-6 w-6 animate-spin text-white" />
                        </div>
                      )}

                      {/* Upload failed */}
                      {item.status === "error" && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-red-900/70">
                          <AlertCircle className="h-5 w-5 text-white" />
                          <span className="text-xs text-white">Failed</span>
                        </div>
                      )}

                      {/* Success indicator */}
                      {item.status === "done" && (
                        <div className="absolute bottom-2 right-2">
                          <CheckCircle2 className="h-4 w-4 text-green-400 drop-shadow" />
                        </div>
                      )}

                      {/* Primary badge */}
                      {index === 0 && item.status === "done" && (
                        <div className="absolute left-2 top-2 rounded bg-primary px-2 py-1 text-xs text-white">
                          Primary
                        </div>
                      )}

                      {/* Remove button */}
                      <button
                        type="button"
                        onClick={() => removeImage(item.id)}
                        className="absolute right-2 top-2 rounded-full bg-black/60 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <p className="text-sm text-muted-foreground">
                {imageItems.length === 0 ? (
                  <span className="text-red-500">At least 1 image is required</span>
                ) : (
                  <>
                    {doneCount}/{imageItems.length} uploaded
                    {uploadingCount > 0 && (
                      <span className="ml-2 text-blue-500">· {uploadingCount} uploading…</span>
                    )}
                    {errorCount > 0 && (
                      <span className="ml-2 text-red-500">· {errorCount} failed</span>
                    )}
                  </>
                )}
              </p>
            </div>
          </div>

          {/* Submit */}
          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || uploadingCount > 0}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting…
                </>
              ) : uploadingCount > 0 ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading images…
                </>
              ) : (
                "Create Listing"
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
