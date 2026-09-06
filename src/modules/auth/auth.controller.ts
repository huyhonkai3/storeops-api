import type { Request, Response } from "express";

import { AppError } from "../../errors/app-error.js";

import { register, login, refreshAccessToken, logout } from "./auth.service.js";
import type {
  RegisterInput,
  LoginInput,
  RefreshTokenInput,
} from "./auth.types.js";

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

export const refreshAccessTokenController = async (
  req: Request<{}, {}, RefreshTokenInput>,
  res: Response,
) => {
  const result = await refreshAccessToken(req.body);
  res.status(200).json({
    data: result,
  });
};

export const logoutUser = async (
  req: Request<{}, {}, RefreshTokenInput>,
  res: Response,
): Promise<void> => {
  await logout(req.body);
  res.status(204).send();
};
