import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../errors/app-error.js";
import { StockMovementInput } from "./inventory.types.js";
import { productIdParamsSchema } from "../products/product.schema.js";

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
    const store = prisma.store.findUnique({
      where: {
        id: storeId,
      },
    });
    if (!store) {
      throw new AppError(404, "STORE_NOT_FOUND", "Store not found");
    }

    const product = prisma.product.findUnique({
      where: {
        id: input.productId,
      },
    });
    if (!product) {
      throw new AppError(404, "PRODUCT_NOT_FOUND", "Product not found");
    }

    const inventory = await prisma.inventory.upsert({
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
    const store = await prisma.store.findUnique({
      where: {
        id: storeId,
      },
    });
    if (!store) {
      throw new AppError(404, "STORE_NOT_FOUND", "Store not found");
    }

    const product = await prisma.product.findUnique({
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
      throw new AppError(400, "INSUFFICIENT_STOCK", "Insufficient stock");
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
