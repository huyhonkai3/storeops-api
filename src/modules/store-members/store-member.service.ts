import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../errors/app-error.js";

import type { AddStoreMemberInput } from "./store-member.type.js";

export const addStoreMember = async (
  storeId: number,
  input: AddStoreMemberInput,
) => {
  const store = await prisma.store.findUnique({
    where: {
      id: storeId,
    },
  });
  if (!store) {
    throw new AppError(404, "STORE_NOT_FOUND", "Store not found");
  }

  const user = await prisma.user.findUnique({
    where: {
      id: input.userId,
    },
  });
  if (!user) {
    throw new AppError(404, "USER_NOT_FOUND", "User not found");
  }

  const existingMember = await prisma.storeMember.findUnique({
    where: {
      userId_storeId: {
        userId: input.userId,
        storeId,
      },
    },
  });
  if (existingMember) {
    throw new AppError(
      400,
      "STORE_MEMBER_EXISTS",
      "Store member already exists",
    );
  }

  return prisma.storeMember.create({
    data: {
      userId: input.userId,
      storeId,
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      },
    },
  });
};

export const getStoreMembers = async (storeId: number) => {
  const store = await prisma.storeMember.findUnique({
    where: {
      id: storeId,
    },
  });
  if (!store) {
    throw new AppError(404, "STORE_NOT_FOUND", "Store not found");
  }

  return prisma.storeMember.findMany({
    where: {
      storeId,
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};

export const removeStoreMember = async (storeId: number, userId: number) => {
  const membership = await prisma.storeMember.findUnique({
    where: {
      userId_storeId: {
        userId,
        storeId,
      },
    },
  });
  if (!membership) {
    throw new AppError(404, "STORE_MEMBER_NOT_FOUND", "Store member not found");
  }

  return prisma.storeMember.delete({
    where: {
      userId_storeId: {
        userId,
        storeId,
      },
    },
  });
};
