import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../errors/app-error.js";

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
