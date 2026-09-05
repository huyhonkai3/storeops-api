import { z } from "zod";

export const createProductSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, "Name is required")
      .max(120, "Name must be at most 120 characters"),

    sku: z
      .string()
      .trim()
      .min(1, "SKU is required")
      .max(50, "SKU must be at most 50 characters"),

    price: z
      .number()
      .int("Price must be an integer")
      .positive("Price must be greater than 0"),

    stock: z
      .number()
      .int("Stock must be an integer")
      .nonnegative("Stock cannot be negative"),
  })
  .strict();

export const updateProductSchema = createProductSchema
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field is required",
  });

export const productIdParamsSchema = z.object({
  id: z.string().regex(/^[1-9]\d*$/, "Product ID must be a positive integer"),
});

export const productListQuerySchema = z
  .object({
    page: z.coerce
      .number()
      .int()
      .positive("Page must be greater than 0")
      .default(1),
    limit: z.coerce
      .number()
      .int()
      .min(1, "Limit must be at least 1")
      .max(100, "Limit must be at most 100")
      .default(10),
    search: z
      .string()
      .trim()
      .min(1, "Search cannot be empty")
      .max(100)
      .optional(),
    minPrice: z.coerce.number().int().nonnegative().optional(),
    maxPrice: z.coerce.number().int().nonnegative().optional(),
    minStock: z.coerce.number().int().nonnegative().optional(),
    sortBy: z
      .enum(["name", "price", "stock", "createdAt"])
      .default("createdAt"),
    sortOrder: z.enum(["asc", "desc"]).default("desc"),
  })
  .strict()
  .refine(
    (query) =>
      query.minPrice === undefined ||
      query.maxPrice === undefined ||
      query.minPrice <= query.maxPrice,
    { message: "minPrice cannot be greater than maxPrice", path: ["minPrice"] },
  );
