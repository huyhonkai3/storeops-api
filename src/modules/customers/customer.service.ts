import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../errors/app-error.js";
import { Prisma } from "../../generated/prisma/client.js";

import type {
  CreateCustomerInput,
  UpdateCustomerInput,
  CustomerListQueryInput,
} from "./customer.types.js";

export const getCustomers = async (
  storeId: number,
  query: CustomerListQueryInput,
) => {
  const store = await prisma.store.findUnique({
    where: {
      id: storeId,
    },
  });
  if (!store) {
    throw new AppError(400, "STORE_NOT_FOUND", "Store not found");
  }

  const { page, limit, search, sortBy, sortOrder } = query;
  const skip = (page - 1) * limit;
  const where: Prisma.CustomerWhereInput = {
    storeId,

    ...(search && {
      OR: [
        {
          name: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          phone: {
            contains: search,
          },
        },
        {
          email: {
            contains: search,
            mode: "insensitive",
          },
        },
      ],
    }),
  };

  const [customers, total] = await Promise.all([
    prisma.customer.findMany({
      where,
      skip,
      take: limit,
      orderBy: {
        [sortBy]: sortOrder,
      },
    }),

    prisma.customer.count({ where }),
  ]);

  return {
    data: customers,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const getCustomerById = async (storeId: number, customerId: number) => {
  const customer = await prisma.customer.findUnique({
    where: {
      id: customerId,
      storeId,
    },
  });
  if (!customer) {
    throw new AppError(400, "CUSTOMER_NOT_FOUND", "Customer not found");
  }
  return customer;
};

export const createCustomer = async (
  storeId: number,
  input: CreateCustomerInput,
) => {
  const store = await prisma.store.findUnique({
    where: {
      id: storeId,
    },
  });
  if (!store) {
    throw new AppError(400, "STORE_NOT_FOUND", "Store not found");
  }

  const existingCustomer = await prisma.customer.findUnique({
    where: {
      storeId_phone: {
        storeId,
        phone: input.phone,
      },
    },
  });
  if (existingCustomer) {
    throw new AppError(
      400,
      "CUSTOMER_ALREADY_EXISTS",
      "Customer already exists",
    );
  }

  return prisma.customer.create({
    data: {
      storeId,
      name: input.name,
      phone: input.phone,
      email: input.email,
      address: input.address,
    },
  });
};

export const updateCustomer = async (
  storeId: number,
  customerId: number,
  input: UpdateCustomerInput,
) => {
  const customer = await prisma.customer.findUnique({
    where: {
      id: customerId,
      storeId,
    },
  });
  if (!customer) {
    throw new AppError(400, "CUSTOMER_NOT_FOUND", "Customer not found");
  }

  if (input.phone && input.phone !== customer.phone) {
    const duplicate = await prisma.customer.findUnique({
      where: {
        storeId_phone: {
          storeId,
          phone: input.phone,
        },
      },
    });
    if (duplicate) {
      throw new AppError(
        400,
        "CUSTOMER_PHONE_ALREADY_EXISTS",
        "Customer phone already exists in this store",
      );
    }
  }

  return prisma.customer.update({
    where: {
      id: customerId,
    },
    data: input,
  });
};

export const deleteCustomer = async (
  storeId: number,
  customerId: number,
): Promise<void> => {
  const customer = await prisma.customer.findUnique({
    where: {
      id: customerId,
      storeId,
    },
  });
  if (!customer) {
    throw new AppError(400, "CUSTOMER_NOT_FOUND", "Customer not found");
  }

  await prisma.customer.delete({
    where: {
      id: customerId,
    },
  });
};
