import { z } from "zod";

export const createStoreSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, "Name must be at least 2 characters")
      .max(120, "Name must be at most 120 characters"),
    code: z
      .string()
      .trim()
      .min(2, "Code must be at least 2 characters")
      .max(30, "Code must be at most 30 characters")
      .regex(
        /^[A-Za-z0-9_-]+$/,
        "Code can only contain letters, numbers, underscores and hyphens",
      )
      .transform((code) => code.toUpperCase()),
    address: z
      .string()
      .trim()
      .max(255, "Address must be at most 255 characters")
      .optional(),
  })
  .strict();

export const updateStoreSchema = createStoreSchema
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field is required",
  });

export const storeIdParamsSchema = z.object({
  id: z.string().regex(/^[1-9]\d*$/, "Store ID must be a positive integer"),
});

export const storeListQuerySchema = z
  .object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().min(1).max(100).default(10),
    search: z
      .string()
      .trim()
      .min(1, "Search cannot be empty")
      .max(100)
      .optional(),
    sortBy: z.enum(["name", "createdAt"]).default("createdAt"),
    sortOrder: z.enum(["asc", "desc"]).default("desc"),
  })
  .strict();
