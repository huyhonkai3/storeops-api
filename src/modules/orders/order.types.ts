import type { z } from "zod";

import { createOrderSchema, orderListQuerySchema } from "./order.schema.js";

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type OrderListQueryInput = z.infer<typeof orderListQuerySchema>;
