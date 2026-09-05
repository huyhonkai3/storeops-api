import { z } from "zod";

import { registerSchema, loginSchema } from "./auth.schema.js";
import type { User } from "../../generated/prisma/client.js";

export type RegisterInput = z.infer<typeof registerSchema>;

export type LoginInput = z.infer<typeof loginSchema>;

export type AuthUser = Pick<User, "id" | "name" | "email" | "role">;
