import { AppError } from "../../errors/app-error.js";
import { prisma } from "../../lib/prisma.js";

import {
  CreateStoreInput,
  UpdateStoreInput,
  StoreListQuery,
} from "./store.types.js";

import { Prisma } from "../../generated/prisma/client.js";

export const getStores = async (query: StoreListQuery) => {
  const { page, limit, search, sortBy, sortOrder } = query;

  const skip = (page - 1) * limit;

  const where: Prisma.StoreWhereInput = {
    ...(search && {
      OR: [
        {
          name: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          code: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          address: {
            contains: search,
            mode: "insensitive",
          },
        },
      ],
    }),
  };

  const orderBy: Prisma.StoreOrderByWithRelationInput =
    sortBy === "name" ? { name: sortOrder } : { createdAt: sortOrder };

  const [stores, total] = await Promise.all([
    prisma.store.findMany({
      where,
      orderBy,
      skip,
      take: limit,
    }),
    prisma.store.count({
      where,
    }),
  ]);

  return {
    data: stores,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const getStoreById = async (id: number) => {
  return await prisma.store.findUnique({
    where: {
      id,
    },
  });
};

export const createStore = async (input: CreateStoreInput) => {
  return prisma.store.create({
    data: {
      name: input.name,
      code: input.code,
      address: input.address,
    },
  });
};

export const updateStore = async (id: number, input: UpdateStoreInput) => {
  const store = await prisma.store.findUnique({
    where: {
      id,
    },
  });

  if (!store) {
    return null;
  }

  return prisma.store.update({
    where: {
      id,
    },
    data: input,
  });
};

export const deleteStore = async (id: number) => {
  const store = await prisma.store.findUnique({
    where: {
      id,
    },
  });

  if (!store) {
    return false;
  }

  return true;
};
