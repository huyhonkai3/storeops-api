import { z } from "zod";
import { productIdParamsSchema } from "../products/product.schema.js";

export const storeInventoryParamsSchema = z.object({
  storeId: z
    .string()
    .regex(/^[1-9]\d*$/, "Store ID must be a positive integer"),
});

export const inventoryItemParamsSchema = z.object({
  storeId: z
    .string()
    .regex(/^[1-9]\d*$/, "Store ID must be a positive integer"),
  productId: z
    .string()
    .regex(/^[1-9]\d*$/, "Product ID must be a positive integer"),
});

export const stockMovementSchema = z
  .object({
    productId: z
      .number()
      .int("Product ID must be a positive integer")
      .positive("Product ID must be positive"),
    quantity: z
      .number()
      .int("Quantity must be a positive integer")
      .positive("Quantity must be greater than 0"),
    note: z
      .string()
      .trim()
      .max(255, "Note must be at most 255 characters")
      .optional(),
  })
  .strict();
