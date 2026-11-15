import { z } from "zod";

const roomTypes = ["WHOLE_FLAT", "SINGLE_ROOM", "SEAT_SUBLET", "SHARED"] as const;

const tenantTypes = [
  "FAMILY",
  "BACHELOR",
  "STUDENT",
  "FEMALE_ONLY",
  "MALE_ONLY",
  "WORKING_PROFESSIONAL",
  "ANY",
] as const;

const listingStatuses = ["PENDING", "ACTIVE", "RENTED", "EXPIRED", "HIDDEN"] as const;

export const idParamSchema = z.object({
  id: z.string().min(1),
});

// no defaults here on purpose, the database already has them
// (a default would also overwrite values when this schema is used for updates)
const listingFields = z.object({
  title: z.string().trim().min(5).max(100),
  description: z.string().trim().min(10).max(2000),
  rent: z.number().int().positive(),
  advance: z.number().int().min(0).optional(),
  roomType: z.enum(roomTypes),
  acceptedTenants: z.array(z.enum(tenantTypes)).min(1).max(tenantTypes.length),
  furnished: z.boolean().optional(),
  areaId: z.string().min(1),
  landmarkId: z.string().min(1).nullable().optional(),
  address: z.string().trim().min(5).max(200),
  availableFrom: z.coerce.date(),
});

export const createListingSchema = listingFields;

export const updateListingSchema = listingFields.partial().refine(
  (data) => Object.keys(data).length > 0,
  { message: "Send at least one field to update" },
);

const page = z.coerce.number().int().min(1).default(1);
const limit = z.coerce.number().int().min(1).max(50).default(10);

export const listListingsQuerySchema = z
  .object({
    areaId: z.string().min(1).optional(),
    landmarkId: z.string().min(1).optional(),
    minRent: z.coerce.number().int().min(0).optional(),
    maxRent: z.coerce.number().int().min(0).optional(),
    roomType: z.enum(roomTypes).optional(),
    acceptedTenants: z.enum(tenantTypes).optional(),
    furnished: z
      .enum(["true", "false"])
      .transform((value) => value === "true")
      .optional(),
    sort: z.enum(["newest", "rent_asc", "rent_desc"]).default("newest"),
    page,
    limit,
  })
  .refine(
    (data) => data.minRent === undefined || data.maxRent === undefined || data.minRent <= data.maxRent,
    { message: "minRent cannot be more than maxRent", path: ["minRent"] },
  );

export const myListingsQuerySchema = z.object({
  status: z.enum(listingStatuses).optional(),
  page,
  limit,
});

export type CreateListingInput = z.infer<typeof createListingSchema>;
export type UpdateListingInput = z.infer<typeof updateListingSchema>;
export type ListListingsQuery = z.infer<typeof listListingsQuerySchema>;
export type MyListingsQuery = z.infer<typeof myListingsQuerySchema>;