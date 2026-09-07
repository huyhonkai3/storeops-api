import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware.js";
import { authorize } from "../../middlewares/authorize.middleware.js";
import { requireStoreMember } from "../../middlewares/store-member.middleware.js";
import { requireStoreRole } from "../../middlewares/store-role.middleware.js";

import {
  validateBody,
  validateParams,
} from "../../middlewares/validate.middleware.js";

import {
  addStoreMemberSchema,
  storeIdParamsSchema,
  storeMemberParamsSchema,
  updateStoreMemberRoleSchema,
} from "./store-member.schema.js";

import {
  addMember,
  getMembers,
  removeMember,
  editMemberRole,
} from "./store-member.controller.js";

const router = Router();

router.use(authenticate);

router.post(
  "/:storeId/members",
  validateParams(storeIdParamsSchema),
  requireStoreRole("MANAGER"),
  validateBody(addStoreMemberSchema),
  addMember,
);

router.get(
  "/:storeId/members",
  validateParams(storeIdParamsSchema),
  requireStoreMember,
  getMembers,
);

router.patch(
  "/:storeId/members/:userId/role",
  validateParams(storeMemberParamsSchema),
  requireStoreRole("MANAGER"),
  validateBody(updateStoreMemberRoleSchema),
  editMemberRole,
);

router.delete(
  "/:storeId/members/:userId",
  validateParams(storeMemberParamsSchema),
  requireStoreRole("MANAGER"),
  removeMember,
);

export default router;
