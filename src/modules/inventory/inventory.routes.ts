import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware.js";
import { requireStoreMember } from "../../middlewares/store-member.middleware.js";

import { validateParams } from "../../middlewares/validate.middleware.js";
import {
  storeInventoryParamsSchema,
  inventoryItemParamsSchema,
} from "./inventory.schema.js";

import { getInventory, getOneInventoryItem } from "./inventory.controller.js";

const router = Router();
router.use(authenticate);

router.get(
  "/:storeId/inventory",
  validateParams(storeInventoryParamsSchema),
  requireStoreMember,
  getInventory,
);

router.get(
  "/:storeId/inventory/:productId",
  validateParams(inventoryItemParamsSchema),
  requireStoreMember,
  getOneInventoryItem,
);

export default router;
