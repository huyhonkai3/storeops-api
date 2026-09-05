import type { Request, Response } from "express";

import { AppError } from "../../errors/app-error.js";

import { register, login } from "./auth.service.js";
import type { RegisterInput, LoginInput } from "./auth.types.js";

export const registerUser = async (
  req: Request<{}, {}, RegisterInput>,
  res: Response,
) => {
  const user = await register(req.body);
  res.status(201).json({
    data: user,
  });
};

export const loginUser = async (
  req: Request<{}, {}, LoginInput>,
  res: Response,
) => {
  const result = await login(req.body);
  res.status(200).json({
    data: result,
  });
};

export const getMe = async (req: Request, res: Response): Promise<void> => {
  if (!req.user) {
    throw new AppError(
      401,
      "AUTHENTICATION_REQUIRED",
      "Authentication required",
    );
  }

  res.status(200).json({
    data: req.user,
  });
};
