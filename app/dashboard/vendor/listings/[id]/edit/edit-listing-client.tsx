"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Upload, X, Loader2 } from "lucide-react";
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
import { materialCategories, nigerianStates } from "@/lib/materials";

const materialListingSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(100),
  description: z.string().min(20, "Description must be at least 20 characters"),
  category: z.enum(materialCategories.map((c) => c.value) as [string, ...string[]], {
    required_error: "Please select a category",
  }),
  price: z.coerce.number().positive("Price must be a positive number"),
  unit: z.string().min(1, "Unit is required (e.g. tonne, bag, piece)"),
  minOrder: z.coerce.number().int().min(1, "Minimum order must be at least 1"),
  state: z.string().min(1, "Please select a state"),
});

type MaterialListingFormData = z.infer<typeof materialListingSchema>;

interface MaterialImage {
  id: string;
  url: string;
  publicId: string;
  isPrimary: boolean;
}

interface InitialListing {
  id: string;
  title: string;
  description: string;
  category: string;
  price: number;
  unit: string;
  minOrder: number;
  state: string;
  images: MaterialImage[];
}

export default function EditMaterialListingClient({
  initialListing,
}: {
  initialListing: InitialListing;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [images, setImages] = useState<MaterialImage[]>(initialListing.images);
  const [uploading, setUploading] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);

  const form = useForm<MaterialListingFormData>({
    resolver: zodResolver(materialListingSchema),
    defaultValues: {
      title: initialListing.title,
      description: initialListing.description,
      category: initialListing.category as MaterialListingFormData["category"],
      price: initialListing.price,
      unit: initialListing.unit,
      minOrder: initialListing.minOrder,
      state: initialListing.state,
    },
  });

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    e.target.value = "";
    if (!files.length) return;

    if (images.length + files.length > 10) {
      toast({ title: "Too many images", description: "Maximum 10 images allowed", variant: "destructive" });
      return;
    }

    setUploading(true);
    try {
      for (const file of files) {
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

        const addRes = await fetch(`/api/materials/${initialListing.id}/images`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            url: data.secure_url,
            publicId: data.public_id,
            isPrimary: images.length === 0,
          }),
        });
        if (!addRes.ok) throw new Error("Failed to attach image");
        const image = await addRes.json();
        setImages((prev) => [...prev, image]);
      }
    } catch (error) {
      toast({
        title: "Image upload failed",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const removeImage = async (imageId: string) => {
    setRemovingId(imageId);
    try {
      const res = await fetch(`/api/materials/${initialListing.id}/images`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageId }),
      });
      if (!res.ok) throw new Error("Failed to remove image");
      setImages((prev) => prev.filter((img) => img.id !== imageId));
    } catch {
      toast({ title: "Failed to remove image", description: "Please try again.", variant: "destructive" });
    } finally {
      setRemovingId(null);
    }
  };

  const onSubmit = async (data: MaterialListingFormData) => {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const response = await fetch(`/api/materials/${initialListing.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const err = await response.json();
        const message = Array.isArray(err.error)
          ? err.error[0]?.message || "Validation failed"
          : err.error || "Failed to update listing";
        throw new Error(message);
      }

      toast({ title: "Listing updated" });
      router.push("/dashboard/vendor");
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : "Failed to update listing. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Edit Material Listing</h1>
        <p className="mt-2 text-muted-foreground">Update your material listing details</p>
      </div>

      {submitError && (
        <Alert variant="destructive" className="mb-6">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{submitError}</AlertDescription>
        </Alert>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="rounded-lg border bg-card p-6">
            <h2 className="mb-6 text-xl font-semibold">Material Details</h2>
            <div className="space-y-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
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
                    <FormDescription>Minimum 20 characters</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid gap-4 md:grid-cols-2">
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
                          {materialCategories.map((c) => (
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
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price (₦)</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="unit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Unit</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., bag, tonne, piece" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="minOrder"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Minimum Order</FormLabel>
                      <FormControl>
                        <Input type="number" min={1} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </div>

          <div className="rounded-lg border bg-card p-6">
            <h2 className="mb-6 text-xl font-semibold">Images</h2>
            <div className="space-y-4">
              {images.length > 0 && (
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                  {images.map((img, index) => (
                    <div key={img.id} className="group relative aspect-square overflow-hidden rounded-lg border">
                      <img src={img.url} alt={`Image ${index + 1}`} className="h-full w-full object-cover" />
                      {img.isPrimary && (
                        <div className="absolute left-2 top-2 rounded bg-primary px-2 py-1 text-xs text-white">
                          Primary
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={() => removeImage(img.id)}
                        disabled={removingId === img.id}
                        className="absolute right-2 top-2 rounded-full bg-black/60 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100"
                      >
                        {removingId === img.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <X className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <label
                htmlFor="images"
                className="flex cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25 px-6 py-8 transition-colors hover:border-muted-foreground/50"
              >
                <div className="text-center">
                  {uploading ? (
                    <Loader2 className="mx-auto h-8 w-8 animate-spin text-muted-foreground" />
                  ) : (
                    <Upload className="mx-auto h-8 w-8 text-muted-foreground" />
                  )}
                  <p className="mt-2 text-sm text-muted-foreground">
                    {uploading ? "Uploading…" : "Click to upload images"}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">PNG, JPG up to 10MB (max 10 images)</p>
                </div>
                <input
                  id="images"
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handleImageChange}
                  disabled={uploading}
                />
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={() => router.back()} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || uploading}
              className="bg-[#D4AF37] text-black hover:bg-[#D4AF37]/90"
            >
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
