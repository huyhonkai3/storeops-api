import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware.js";
import { authorize } from "../../middlewares/authorize.middleware.js";
import { requireStoreMember } from "../../middlewares/store-member.middleware.js";

import {
  validateBody,
  validateParams,
} from "../../middlewares/validate.middleware.js";

import {
  addStoreMemberSchema,
  storeIdParamsSchema,
  storeMemberParamsSchema,
} from "./store-member.schema.js";

import {
  addMember,
  getMembers,
  removeMember,
} from "./store-member.controller.js";

const router = Router();

router.use(authenticate);

router.post(
  "/:storeId/members",
  authorize("ADMIN"),
  validateParams(storeIdParamsSchema),
  validateBody(addStoreMemberSchema),
  addMember,
);

router.get(
  "/:storeId/members",
  validateParams(storeIdParamsSchema),
  requireStoreMember,
  getMembers,
);

router.delete(
  "/:storeId/members/:userId",
  authorize("ADMIN"),
  validateParams(storeMemberParamsSchema),
  removeMember,
);

export default router;
