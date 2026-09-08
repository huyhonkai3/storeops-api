import { z } from "zod";
import { stockMovementSchema } from "./inventory.schema.js";

export type StockMovementInput = z.infer<typeof stockMovementSchema>;
