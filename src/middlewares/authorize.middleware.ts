import type { Request, Response, NextFunction } from "express";

import { AppError } from "../errors/app-error.js";
import type { AuthUser } from "../modules/auth/auth.types.js";

export const authorize =
  (...allowedRoles: AuthUser["role"][]) =>
  (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw new AppError(
        401,
        "AUTHENTICATION_REQUIRED",
        "Authentication required",
      );
    }

    if (!allowedRoles.includes(req.user.role)) {
      throw new AppError(
        403,
        "FORBIDDEN",
        "You do not have permission to perform this action.",
      );
    }
    next();
  };
