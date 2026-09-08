import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware.js";
import { requireStoreMember } from "../../middlewares/store-member.middleware.js";

import {
  validateBody,
  validateParams,
  validateQuery,
} from "../../middlewares/validate.middleware.js";
import {
  storeInventoryParamsSchema,
  inventoryItemParamsSchema,
  stockMovementSchema,
  inventoryHistoryQuerySchema,
} from "./inventory.schema.js";

import {
  getInventory,
  getOneInventoryItem,
  addStock,
  removeStock,
  getHistory,
} from "./inventory.controller.js";
import { requireStoreRole } from "../../middlewares/store-role.middleware.js";

const router = Router();
router.use(authenticate);

router.get(
  "/:storeId/inventory",
  validateParams(storeInventoryParamsSchema),
  requireStoreMember,
  getInventory,
);

router.post(
  "/:storeId/inventory/stock-in",
  validateParams(storeInventoryParamsSchema),
  requireStoreRole("MANAGER", "STAFF"),
  validateBody(stockMovementSchema),
  addStock,
);
router.post(
  "/:storeId/inventory/stock-out",
  validateParams(storeInventoryParamsSchema),
  requireStoreRole("MANAGER", "STAFF"),
  validateBody(stockMovementSchema),
  removeStock,
);

router.get(
  "/:storeId/inventory/history",
  validateParams(storeInventoryParamsSchema),
  requireStoreMember,
  validateQuery(inventoryHistoryQuerySchema),
  getHistory,
);

router.get(
  "/:storeId/inventory/:productId",
  validateParams(inventoryItemParamsSchema),
  requireStoreMember,
  getOneInventoryItem,
);

export default router;
