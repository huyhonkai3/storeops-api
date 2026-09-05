import { Request, Response, NextFunction } from "express";

import { AppError } from "../errors/app-error.js";
import { verifyAccessToken } from "../lib/jwt.js";

import { getAuthUserById } from "../modules/auth/auth.service.js";

export const authenticate = async (
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> => {
  const authorization = req.headers.authorization;
  const [scheme, token] = authorization?.split(" ") ?? [];
  if (scheme?.toLowerCase() !== "bearer" || !token) {
    throw new AppError(
      401,
      "AUTHENTICATION_REQUIRED",
      "Authentication required",
    );
  }

  const userId = verifyAccessToken(token);
  const user = await getAuthUserById(userId);

  if (!user) {
    throw new AppError(401, "INVALID_TOKEN", "Invalid access token");
  }

  req.user = user;

  next();
};
