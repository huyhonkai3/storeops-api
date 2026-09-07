import { z } from "zod";
import {
  addStoreMemberSchema,
  storeIdParamsSchema,
  storeMemberParamsSchema,
} from "./store-member.schema.js";

export type AddStoreMemberInput = z.infer<typeof addStoreMemberSchema>;
