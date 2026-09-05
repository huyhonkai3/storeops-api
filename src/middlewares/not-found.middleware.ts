import type { NextFunction, Request, Response } from "express";
import { AppError } from "../errors/app-error.js";

export const notFoundHandler = (
  req: Request,
  _res: Response,
  next: NextFunction,
): void => {
  next(
    new AppError(
      404,
      "NOT_FOUND",
      `Route ${req.method} ${req.originalUrl} not found`,
    ),
  );
};
