import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware.js";
import { authorize } from "../../middlewares/authorize.middleware.js";
import {
  getAllStores,
  getOneStore,
  addStore,
  editStore,
  removeStore,
} from "./store.controller.js";
import {
  createStoreSchema,
  updateStoreSchema,
  storeIdParamsSchema,
  storeListQuerySchema,
} from "./store.schema.js";
import {
  validateBody,
  validateParams,
  validateQuery,
} from "../../middlewares/validate.middleware.js";
import { validate } from "zod/v4/core";

const router = Router();

router.use(authenticate);

router.get("/", validateQuery(storeListQuerySchema), getAllStores);
router.get("/:id", validateParams(storeIdParamsSchema), getOneStore);

router.post("/", authorize("ADMIN"), validateBody(createStoreSchema), addStore);
router.patch(
  "/:id",
  authorize("ADMIN"),
  validateBody(updateStoreSchema),
  editStore,
);
router.delete(
  "/:id",
  authorize("ADMIN"),
  validateParams(storeIdParamsSchema),
  removeStore,
);

export default router;
