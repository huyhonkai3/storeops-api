import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../errors/app-error.js";
import {
  StockMovementInput,
  InventoryHistoryQueryInput,
} from "./inventory.types.js";
import type { Prisma } from "../../generated/prisma/client.js";

// Lấy tồn kho của 1 cửa hàng
export const getStoreInventory = async (storeId: number) => {
  const store = await prisma.store.findUnique({
    where: {
      id: storeId,
    },
  });
  if (!store) {
    throw new AppError(404, "STORE_NOT_FOUND", "Store not found");
  }

  return prisma.inventory.findMany({
    where: {
      storeId,
    },
    include: {
      product: {
        select: {
          id: true,
          name: true,
          sku: true,
          price: true,
        },
      },
    },
    orderBy: {
      product: {
        name: "asc",
      },
    },
  });
};

// Lấy tồn kho của 1 sản phẩm của 1 store
export const getInventoryItem = async (storeId: number, productId: number) => {
  const inventory = await prisma.inventory.findUnique({
    where: {
      storeId_productId: {
        storeId,
        productId,
      },
    },
    include: {
      product: {
        select: {
          id: true,
          name: true,
          sku: true,
          price: true,
        },
      },
      store: {
        select: {
          id: true,
          name: true,
          code: true,
        },
      },
    },
  });

  if (!inventory) {
    throw new AppError(404, "INVENTORY_NOT_FOUND", "Inventory not found");
  }

  return inventory;
};

export const stockIn = async (
  storeId: number,
  input: StockMovementInput,
  userId: number,
) => {
  return prisma.$transaction(async (tx) => {
    const store = await tx.store.findUnique({
      where: {
        id: storeId,
      },
    });
    if (!store) {
      throw new AppError(404, "STORE_NOT_FOUND", "Store not found");
    }

    const product = await tx.product.findUnique({
      where: {
        id: input.productId,
      },
    });
    if (!product) {
      throw new AppError(404, "PRODUCT_NOT_FOUND", "Product not found");
    }

    const inventory = await tx.inventory.upsert({
      where: {
        storeId_productId: {
          storeId,
          productId: input.productId,
        },
      },
      create: {
        storeId,
        productId: input.productId,
        quantity: input.quantity,
      },
      update: {
        quantity: {
          increment: input.quantity,
        },
      },
    });

    const movement = await tx.inventoryMovement.create({
      data: {
        storeId,
        productId: input.productId,
        userId,
        type: "STOCK_IN",
        quantity: input.quantity,
        note: input.note,
      },
    });

    return {
      inventory,
      movement,
    };
  });
};

export const stockOut = async (
  storeId: number,
  input: StockMovementInput,
  userId: number,
) => {
  return prisma.$transaction(async (tx) => {
    const store = await tx.store.findUnique({
      where: {
        id: storeId,
      },
    });
    if (!store) {
      throw new AppError(404, "STORE_NOT_FOUND", "Store not found");
    }

    const product = await tx.product.findUnique({
      where: {
        id: input.productId,
      },
    });
    if (!product) {
      throw new AppError(404, "PRODUCT_NOT_FOUND", "Product not found");
    }

    const inventory = await tx.inventory.findUnique({
      where: {
        storeId_productId: {
          storeId,
          productId: input.productId,
        },
      },
    });
    if (!inventory) {
      throw new AppError(404, "INVENTORY_NOT_FOUND", "Inventory not found");
    }

    const updated = await tx.inventory.updateMany({
      where: {
        id: inventory.id,
        quantity: {
          gte: input.quantity,
        },
      },

      data: {
        quantity: {
          decrement: input.quantity,
        },
      },
    });

    if (updated.count === 0) {
      throw new AppError(409, "INSUFFICIENT_STOCK", "Insufficient stock");
    }

    const updateInventory = await tx.inventory.findUnique({
      where: {
        id: inventory.id,
      },
    });

    const movement = await tx.inventoryMovement.create({
      data: {
        storeId,
        productId: input.productId,
        userId,
        type: "STOCK_OUT",
        quantity: input.quantity,
        note: input.note,
      },
    });

    return {
      inventory: updateInventory,
      movement,
    };
  });
};

export const getInventoryHistory = async (
  storeId: number,
  query: InventoryHistoryQueryInput,
) => {
  const { page, limit, type, productId, userId, from, to } = query;
  const store = await prisma.store.findUnique({
    where: {
      id: storeId,
    },
  });
  if (!store) {
    throw new AppError(404, "STORE_NOT_FOUND", "Store not found");
  }

  const skip = (page - 1) * limit;
  const where: Prisma.InventoryMovementWhereInput = {
    storeId,

    ...(type && {
      type,
    }),

    ...(productId !== undefined && {
      productId,
    }),

    ...(userId !== undefined && {
      userId,
    }),

    ...(from || to
      ? {
          createdAt: {
            ...(from && {
              gte: from,
            }),
            ...(to && {
              lte: to,
            }),
          },
        }
      : {}),
  };

  const [movements, total] = await Promise.all([
    prisma.inventoryMovement.findMany({
      where,

      skip,
      take: limit,

      orderBy: {
        createdAt: "desc",
      },

      select: {
        id: true,
        type: true,
        quantity: true,
        note: true,
        createdAt: true,

        product: {
          select: {
            id: true,
            name: true,
            sku: true,
          },
        },

        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    }),

    prisma.inventoryMovement.count({
      where,
    }),
  ]);

  return {
    data: movements,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};
