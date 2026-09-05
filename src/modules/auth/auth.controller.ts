import type { Request, Response } from "express";
import { register } from "./auth.service.js";
import type { RegisterInput } from "./auth.types.js";

export const registerUser = async (
  req: Request<{}, {}, RegisterInput>,
  res: Response,
) => {
  const user = await register(req.body);
  res.status(201).json({
    data: user,
  });
};
