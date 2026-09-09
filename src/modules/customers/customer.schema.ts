import z from "zod";

export const createCustomerSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(120, "Name must be at most 120 characters"),
  phone: z
    .string()
    .trim()
    .regex(/^\+?[0-9]\d{8,15}$/, "Phone number is invalid"),
  email: z
    .string()
    .trim()
    .email("Invalid email address")
    .transform((email) => email.toLowerCase())
    .optional(),
  address: z
    .string()
    .trim()
    .max(255, "Address must be at most 255 characters")
    .optional(),
});

export const updateCustomerSchema = createCustomerSchema
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field is required",
  });

export const customerParamsSchema = z.object({
  storeId: z
    .string()
    .regex(/^[1-9]\d*$/, "Store ID must be a positive integer"),
  customerId: z
    .string()
    .regex(/^[1-9]\d*$/, "Customer ID must be a positive integer"),
});

export const customerStoreParamsSchema = z.object({
  storeId: z
    .string()
    .regex(/^[1-9]\d*$/, "Store ID must be a positive integer"),
});

export const customerListQuerySchema = z
  .object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().min(1).max(100).default(10),
    search: z.string().trim().min(1).max(100).optional(),
    sortBy: z.enum(["name", "createdAt"]).default("createdAt"),
    sortOrder: z.enum(["asc", "desc"]).default("asc"),
  })
  .strict();
