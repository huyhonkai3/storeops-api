import { z } from "zod";
import {
  stockMovementSchema,
  inventoryHistoryQuerySchema,
} from "./inventory.schema.js";

export type StockMovementInput = z.infer<typeof stockMovementSchema>;
export type InventoryHistoryQueryInput = z.infer<
  typeof inventoryHistoryQuerySchema
>;
