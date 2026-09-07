import type { Request, Response, NextFunction } from "express";

import { prisma } from "../lib/prisma.js";

import { AppError } from "../errors/app-error.js";
import { ne } from "zod/v4/locales";

export const requireStoreMember = async (
  req: Request<{ storeId: string }>,
  _res: Response,
  next: NextFunction,
): Promise<void> => {
  if (!req.user) {
    throw new AppError(
      401,
      "AUTHENTICATION_REQUIRED",
      "Authentication required",
    );
  }

  // Global ADMIN có quyền truy cập vào mọi store
  if (req.user.role === "ADMIN") {
    next();
    return;
  }

  const storeId = Number(req.params.storeId);

  const membership = await prisma.storeMember.findUnique({
    where: {
      userId_storeId: {
        userId: req.user.id,
        storeId: storeId,
      },
    },
  });

  if (!membership) {
    throw new AppError(403, "FORBIDDEN", "You are not a member of this store");
  }

  next();
};
