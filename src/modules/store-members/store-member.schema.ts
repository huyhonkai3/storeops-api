import { z } from "zod";

export const addStoreMemberSchema = z
  .object({
    userId: z
      .number()
      .int("User ID must be an integer")
      .positive("User Id must be a positive integer"),
  })
  .strict();

export const storeIdParamsSchema = z.object({
  storeId: z
    .string()
    .regex(/^[1-9]\d*$/, "Store ID must be a positive integer"),
});

export const storeMemberParamsSchema = z.object({
  storeId: z
    .string()
    .regex(/^[1-9]\d*$/, "Store ID must be a positive integer"),
  userId: z.string().regex(/^[1-9]\d*$/, "User ID must be a positive integer"),
});
