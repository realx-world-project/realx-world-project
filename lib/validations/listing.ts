import { z } from "zod";

export const listingSchema = z.object({
  title: z.string().min(10).max(100),
  description: z.string().min(50),
  price: z.number().positive(),
  type: z.enum(["SALE", "RENT"]),
  category: z.enum(["RESIDENTIAL", "COMMERCIAL", "LAND"]),
  location: z.object({
    state: z.string().min(1),
    city: z.string().min(1),
    area: z.string().optional(),
    address: z.string().min(1),
    lat: z.number().optional(),
    lng: z.number().optional(),
  }),
  images: z
    .array(
      z.object({
        url: z.string().url(),
        publicId: z.string(),
        isPrimary: z.boolean(),
        order: z.number(),
      })
    )
    .min(1)
    .max(10),
});

export const moderateSchema = z.object({
  action: z.enum(["APPROVE", "REJECT"]),
  reason: z.string().optional(),
});

export const reportSchema = z.object({
  reason: z.string().min(20).max(500),
});

export const searchSchema = z.object({
  q: z.string().optional(),
  type: z.enum(["SALE", "RENT"]).optional(),
  category: z.enum(["RESIDENTIAL", "COMMERCIAL", "LAND"]).optional(),
  state: z.string().optional(),
  city: z.string().optional(),
  minPrice: z.coerce.number().optional(),
  maxPrice: z.coerce.number().optional(),
  page: z.coerce.number().default(1),
  limit: z.coerce.number().default(20),
});
