import { Router } from "express";

import { authenticate } from "../../middlewares/auth.middleware.js";

import { requireStoreMember } from "../../middlewares/store-member.middleware.js";

import { requireStoreRole } from "../../middlewares/store-role.middleware.js";

import {
  validateBody,
  validateParams,
  validateQuery,
} from "../../middlewares/validate.middleware.js";

import {
  createOrderSchema,
  orderListQuerySchema,
  orderParamsSchema,
  orderStoreParamsSchema,
  cancelOrderSchema,
} from "./order.schema.js";

import {
  placeOrder,
  confirmOneOrder,
  getAllOrders,
  getOneOrder,
  cancelOneOrder,
} from "./order.controller.js";

const router = Router();

router.use(authenticate);

router.get(
  "/:storeId/orders",
  validateParams(orderStoreParamsSchema),
  requireStoreMember,
  validateQuery(orderListQuerySchema),
  getAllOrders,
);

router.get(
  "/:storeId/orders/:orderId",
  validateParams(orderParamsSchema),
  requireStoreMember,
  getOneOrder,
);

router.post(
  "/:storeId/orders",
  validateParams(orderStoreParamsSchema),
  requireStoreRole("MANAGER", "STAFF"),
  validateBody(createOrderSchema),
  placeOrder,
);

router.post(
  "/:storeId/orders/:orderId/confirm",
  validateParams(orderParamsSchema),
  requireStoreRole("MANAGER", "STAFF"),
  confirmOneOrder,
);

router.post(
  "/:storeId/orders/:orderId/cancel",
  validateParams(orderParamsSchema),
  requireStoreRole("MANAGER"),
  validateBody(cancelOrderSchema),
  cancelOneOrder,
);

export default router;
