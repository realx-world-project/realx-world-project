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

// Nigerian states
const nigerianStates = [
  "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue",
  "Borno", "Cross River", "Delta", "Ebonyi", "Edo", "Ekiti", "Enugu", "Gombe",
  "Imo", "Jigawa", "Kaduna", "Kano", "Katsina", "Kebbi", "Kogi", "Kwara",
  "Lagos", "Nasarawa", "Niger", "Ogun", "Ondo", "Osun", "Oyo", "Plateau",
  "Rivers", "Sokoto", "Taraba", "Yobe", "Zamfara", "FCT",
];

// Form schema
const createListingSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  description: z.string().min(50, "Description must be at least 50 characters"),
  price: z.coerce.number().min(1, "Price is required"),
  type: z.enum(["SALE", "RENT"], {
    required_error: "Please select a property type",
  }),
  category: z.enum(["RESIDENTIAL", "COMMERCIAL", "LAND"], {
    required_error: "Please select a category",
  }),
  state: z.string().min(1, "Please select a state"),
  city: z.string().min(1, "City is required"),
  area: z.string().min(1, "Area is required"),
  address: z.string().min(10, "Full address is required"),
});

type CreateListingFormData = z.infer<typeof createListingSchema>;

export default function CreateListingPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

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

  // Handle image selection
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    if (images.length + files.length > 10) {
      toast({
        title: "Too many images",
        description: "Maximum 10 images allowed",
        variant: "destructive",
      });
      return;
    }

    if (images.length + files.length < 1) {
      toast({
        title: "No images selected",
        description: "At least 1 image is required",
        variant: "destructive",
      });
      return;
    }

    const newImages = [...images, ...files];
    setImages(newImages);

    // Create previews
    const newPreviews = newImages.map((file) => URL.createObjectURL(file));
    setImagePreviews(newPreviews);
  };

  // Remove image
  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    const newPreviews = imagePreviews.filter((_, i) => i !== index);
    setImages(newImages);
    setImagePreviews(newPreviews);
  };

  // Submit form
  const onSubmit = async (data: CreateListingFormData) => {
    if (images.length < 1) {
      setSubmitError("At least 1 image is required");
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      // Note: Cloudinary upload will be wired in when backend is ready
      // For now, we'll just submit the form data
      const response = await fetch("/api/listings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...data,
          images: imagePreviews, // Using previews for now
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create listing");
      }

      toast({
        title: "Listing Created",
        description: "Your listing has been submitted for review",
      });

      router.push("/dashboard/listings");
    } catch (error) {
      console.error("Error creating listing:", error);
      setSubmitError(
        error instanceof Error
          ? error.message
          : "Failed to create listing. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Create New Listing</h1>
        <p className="mt-2 text-muted-foreground">
          Fill in the details below to list your property
        </p>
      </div>

      {/* Error Alert */}
      {submitError && (
        <Alert variant="destructive" className="mb-6">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{submitError}</AlertDescription>
        </Alert>
      )}

      {/* Form */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          {/* Section 1: Basic Info */}
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
                      <Input
                        placeholder="e.g., Luxury 4-Bedroom House in Ikoyi"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      A catchy title for your property
                    </FormDescription>
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
                    <FormDescription>
                      Minimum 50 characters
                    </FormDescription>
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
                        <Input
                          type="number"
                          placeholder="e.g., 50000000"
                          {...field}
                        />
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
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
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
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
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

          {/* Section 2: Location */}
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
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
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
                      <FormLabel>Area</FormLabel>
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

          {/* Section 3: Images */}
          <div className="rounded-lg border bg-card p-6">
            <h2 className="mb-6 text-xl font-semibold">Images</h2>
            
            <div className="space-y-4">
              {/* Image Input */}
              <div>
                <label
                  htmlFor="images"
                  className="flex cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25 px-6 py-8 transition-colors hover:border-muted-foreground/50"
                >
                  <div className="text-center">
                    <Upload className="mx-auto h-8 w-8 text-muted-foreground" />
                    <p className="mt-2 text-sm text-muted-foreground">
                      Click to upload images
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      PNG, JPG up to 10MB (max 10 images)
                    </p>
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
              </div>

              {/* Image Previews */}
              {imagePreviews.length > 0 && (
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                  {imagePreviews.map((preview, index) => (
                    <div
                      key={index}
                      className="group relative aspect-square overflow-hidden rounded-lg border"
                    >
                      <img
                        src={preview}
                        alt={`Preview ${index + 1}`}
                        className="h-full w-full object-cover"
                      />
                      {/* Primary Badge */}
                      {index === 0 && (
                        <div className="absolute left-2 top-2 rounded bg-primary px-2 py-1 text-xs text-white">
                          Primary
                        </div>
                      )}
                      {/* Remove Button */}
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute right-2 top-2 rounded-full bg-black/60 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Image Count */}
              <p className="text-sm text-muted-foreground">
                {images.length}/10 images selected
                {images.length === 0 && (
                  <span className="text-red-500"> (At least 1 required)</span>
                )}
              </p>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
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