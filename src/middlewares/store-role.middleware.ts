import type { Request, Response, NextFunction } from "express";
import type { StoreMember } from "../generated/prisma/client.js";
import { prisma } from "../lib/prisma.js";
import { AppError } from "../errors/app-error.js";

export const requireStoreRole =
  (...allowedRoles: StoreMember["role"][]) =>
  async (
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

    // Global ADMIN được phép thao tác mọi Store.
    if (req.user.role === "ADMIN") {
      return next();
    }

    const storeId = Number(req.params.storeId);

    const membership = await prisma.storeMember.findUnique({
      where: {
        userId_storeId: {
          userId: req.user.id,
          storeId,
        },
      },
    });

    if (!membership) {
      throw new AppError(
        403,
        "STORE_ACCESS_DENIED",
        "You do not have access to this store",
      );
    }

    if (!allowedRoles.includes(membership.role)) {
      throw new AppError(
        403,
        "INSUFFICIENT_STORE_ROLE",
        "You do not have permission to perform this action",
      );
    }
    next();
  };
