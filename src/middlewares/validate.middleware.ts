import type { NextFunction, Request, Response } from "express";
import { AppError } from "../errors/app-error.js";
import type { z } from "zod";
import { formatError } from "zod/v4/core";

const formatErrors = (issues: z.core.$ZodIssue[]) => {
  return issues.map((issue) => ({
    field: issue.path.join("."),
    message: issue.message,
  }));
};

export const validateBody = (schema: z.ZodType) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      next(
        new AppError(
          400,
          "VALIDATION_FAILED",
          "Validation failed",
          formatErrors(result.error.issues),
        ),
      );
      return;
    }

    req.body = result.data;

    next();
  };
};

export const validateParams = (schema: z.ZodType) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.params);

    if (!result.success) {
      next(
        new AppError(
          400,
          "VALIDATION_FAILED",
          "Validation failed",
          formatErrors(result.error.issues),
        ),
      );
      return;
    }

    next();
  };
};

export const validateQuery = (schema: z.ZodType) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.query);

    if (!result.success) {
      next(
        new AppError(
          400,
          "VALIDATE",
          "Validation failed",
          formatErrors(result.error.issues),
        ),
      );
      return;
    }
    res.locals.validatedQuery = result.data;
    next();
  };
};
