import "dotenv/config";
import jwt from "jsonwebtoken";
import { AppError } from "../errors/app-error.js";

const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;

const ACCESS_TOKEN_EXPIRES_IN = "15m" as const;

export const REFRESH_TOKEN_TTL_SECONDS = 7 * 24 * 60 * 60;

if (!JWT_ACCESS_SECRET) {
  throw new Error("JWT_ACCESS_SECRET is not defined");
}

if (!JWT_REFRESH_SECRET) {
  throw new Error("JWT_REFRESH_SECRET is not defined");
}

export const signAccessToken = (userId: number) => {
  return jwt.sign({}, JWT_ACCESS_SECRET, {
    algorithm: "HS256",
    subject: String(userId),
    expiresIn: ACCESS_TOKEN_EXPIRES_IN,
  });
};

export const verifyAccessToken = (token: string): number => {
  const payload = jwt.verify(token, JWT_ACCESS_SECRET, {
    algorithms: ["HS256"],
  });

  if (typeof payload === "string" || !payload.sub) {
    throw new AppError(401, "INVALID_TOKEN", "Invalid access token");
  }

  const userId = Number(payload.sub);

  if (!Number.isInteger(userId) || userId <= 0) {
    throw new AppError(401, "INVALID_TOKEN", "Invalid access token");
  }

  return userId;
};

export const signRefreshToken = (userId: number) => {
  return jwt.sign({}, JWT_REFRESH_SECRET, {
    algorithm: "HS256",
    subject: String(userId),
    expiresIn: REFRESH_TOKEN_TTL_SECONDS,
  });
};

export const verifyRefreshToken = (token: string): number => {
  const payload = jwt.verify(token, JWT_REFRESH_SECRET, {
    algorithms: ["HS256"],
  });

  if (typeof payload === "string" || !payload.sub) {
    throw new AppError(401, "INVALID_TOKEN", "Invalid refresh token");
  }

  const userId = Number(payload.sub);

  if (!Number.isInteger(userId) || userId <= 0) {
    throw new AppError(401, "INVALID_TOKEN", "Invalid refresh token");
  }

  return userId;
};
