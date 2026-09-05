import bcrypt from "bcryptjs";

import { AppError } from "../../errors/app-error.js";
import { prisma } from "../../lib/prisma.js";
import { signAccessToken } from "../../lib/jwt.js";

import type { RegisterInput, LoginInput } from "./auth.types.js";

const SALT_ROUNDS = 10;

export const register = async (input: RegisterInput) => {
  const existingUser = await prisma.user.findUnique({
    where: {
      email: input.email,
    },
  });

  if (existingUser) {
    throw new AppError(409, "EMAIL_ALREADY_EXISTS", "Email already exists");
  }

  const passwordHash = await bcrypt.hash(input.password, SALT_ROUNDS);

  const user = await prisma.user.create({
    data: {
      name: input.name,
      email: input.email,
      passwordHash,
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return user;
};

export const login = async (input: LoginInput) => {
  const user = await prisma.user.findUnique({
    where: {
      email: input.email,
    },
  });

  if (!user) {
    throw new AppError(401, "INVALID_CREDENTIALS", "Invalid credentials");
  }

  const passwordMatches = await bcrypt.compare(
    input.password,
    user.passwordHash,
  );

  if (!passwordMatches) {
    throw new AppError(401, "INVALID_CREDENTIALS", "Invalid credentials");
  }

  const accessToken = signAccessToken(user.id);

  return {
    accessToken,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  };
};
