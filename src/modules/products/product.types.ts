import { z } from "zod";
import {
  createProductSchema,
  updateProductSchema,
  productListQuerySchema,
} from "./product.schema.js";

export type CreateProductInput = z.infer<typeof createProductSchema>;

export type UpdateProductInput = z.infer<typeof updateProductSchema>;

export type ProductListQuery = z.infer<typeof productListQuerySchema>;
