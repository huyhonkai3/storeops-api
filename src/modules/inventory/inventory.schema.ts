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
