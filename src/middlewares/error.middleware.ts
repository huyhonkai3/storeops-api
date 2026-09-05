import type { NextFunction, Request, Response } from "express";

import { Prisma } from "../generated/prisma/client.js";
import { AppError } from "../errors/app-error.js";

export const errorHandler = (
  error: unknown,
  _req: Request,
  res: Response,
  next: NextFunction,
): void => {
  if (res.headersSent) {
    next(error);
    return;
  }

  if (error instanceof AppError) {
    res.status(error.statusCode).json({
      code: error.code,
      message: error.message,
      ...(error.details !== undefined && {
        details: error.details,
      }),
    });
    return;
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2002") {
      res.status(409).json({
        error: {
          code: "RESOURCE_ALREADY_EXISTS",
          message: "A resource with this unique value already exists",
        },
      });
      return;
    }
  }

  console.error(error);

  res.status(500).json({
    error: {
      code: "INTERNAL_SERVER_ERROR",
      message: "Internal server error",
    },
  });
};
