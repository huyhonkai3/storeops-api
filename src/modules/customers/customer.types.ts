import { z } from "zod";
import {
  createCustomerSchema,
  updateCustomerSchema,
  customerParamsSchema,
  customerStoreParamsSchema,
  customerListQuerySchema,
} from "./customer.schema.js";

export type CreateCustomerInput = z.infer<typeof createCustomerSchema>;
export type UpdateCustomerInput = z.infer<typeof updateCustomerSchema>;
export type CustomerListQueryInput = z.infer<typeof customerListQuerySchema>;
