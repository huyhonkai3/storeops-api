import { z } from "zod";
import {
  addStoreMemberSchema,
  storeIdParamsSchema,
  storeMemberParamsSchema,
  updateStoreMemberRoleSchema,
} from "./store-member.schema.js";

export type AddStoreMemberInput = z.infer<typeof addStoreMemberSchema>;
export type UpdateStoreMemberRoleInput = z.infer<
  typeof updateStoreMemberRoleSchema
>;
