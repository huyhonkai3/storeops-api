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
  validateQuery,
} from "../../middlewares/validate.middleware.js";

const router = Router();

router.use(authenticate);

router.get("/", validateQuery(storeListQuerySchema), getAllStores);
router.get("/:id", validateQuery(storeIdParamsSchema), getOneStore);

router.post("/", authorize("ADMIN"), validateBody(createStoreSchema), addStore);
router.put(
  "/:id",
  authorize("ADMIN"),
  validateBody(updateStoreSchema),
  editStore,
);
router.delete(
  "/:id",
  authorize("ADMIN"),
  validateBody(storeIdParamsSchema),
  removeStore,
);

export default router;
