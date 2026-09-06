import { z } from "zod";
import {
  createStoreSchema,
  updateStoreSchema,
  storeListQuerySchema,
} from "./store.schema.js";

export type CreateStoreInput = z.infer<typeof createStoreSchema>;
export type UpdateStoreInput = z.infer<typeof updateStoreSchema>;
export type StoreListQuery = z.infer<typeof storeListQuerySchema>;
