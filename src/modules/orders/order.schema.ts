import { z } from "zod";

export const orderStoreParamsSchema = z.object({
  storeId: z
    .string()
    .regex(/^[1-9]\d*$/, "Store ID must be a positive integer"),
});

export const orderParamsSchema = z.object({
  storeId: z
    .string()
    .regex(/^[1-9]\d*$/, "Store ID must be a positive integer"),
  orderId: z
    .string()
    .regex(/^[1-9]\d*$/, "Order ID must be a positive integer"),
});

export const orderItemSchema = z
  .object({
    productId: z
      .number()
      .int("Product ID must be an integer")
      .positive("Product ID must be a positive integer"),
    quantity: z
      .number()
      .int("Quantity must be an integer")
      .positive("Quantity must be a positive integer"),
  })
  .strict();

export const createOrderSchema = z
  .object({
    customerId: z.number().int().positive().optional(),

    items: z
      .array(orderItemSchema)
      .min(1, "Order must contain at least one item")
      .max(50, "Order cannot contain more than 50 items"),
  })
  .strict()
  .superRefine((data, ctx) => {
    const productIds = new Set<number>();
    data.items.forEach((item, index) => {
      if (productIds.has(item.productId)) {
        ctx.addIssue({
          code: "custom",
          path: ["items", index, "productId"],
          message: "Duplicate productId is not allowed",
        });
      }

      productIds.add(item.productId);
    });
  });

export const orderListQuerySchema = z
  .object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().min(1).max(100).default(10),
    status: z.enum(["PENDING", "CONFIRMED", "CANCELLED"]).optional(),
    customerId: z.coerce.number().int().positive().optional(),
    from: z.coerce.date().optional(),
    to: z.coerce.date().optional(),
  })
  .strict()
  .refine((query) => !query.from || !query.to || query.from <= query.to, {
    message: "from cannot be after to",
    path: ["from"],
  });

export const cancelOrderSchema = z
  .object({
    reason: z
      .string()
      .trim()
      .min(3, "Cancel reason must be at least 3 characters")
      .max(255, "Cancel reason must be at most 255 characters")
      .optional(),
  })
  .strict();
