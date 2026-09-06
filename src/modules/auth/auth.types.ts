import { z } from "zod";

import {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
} from "./auth.schema.js";
import type { User } from "../../generated/prisma/client.js";

export type RegisterInput = z.infer<typeof registerSchema>;

export type LoginInput = z.infer<typeof loginSchema>;

export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>;

export type AuthUser = Pick<User, "id" | "name" | "email" | "role">;
