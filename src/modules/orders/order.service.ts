import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../errors/app-error.js";

import type { Prisma } from "../../generated/prisma/client.js";

import type {
  CreateOrderInput,
  OrderListQueryInput,
  CancelOrderInput,
} from "./order.types.js";

export const createOrder = async (
  storeId: number,
  input: CreateOrderInput,
  userId: number,
) => {
  return prisma.$transaction(async (tx) => {
    // 1. Store phải tồn tại
    const store = await tx.store.findUnique({
      where: {
        id: storeId,
      },
      select: {
        id: true,
      },
    });

    if (!store) {
      throw new AppError(404, "STORE_NOT_FOUND", "Store not found");
    }

    // 2. Nếu có customer thì customer phải thuộc đúng store
    if (input.customerId !== undefined) {
      const customer = await tx.customer.findFirst({
        where: {
          id: input.customerId,
          storeId,
        },
        select: {
          id: true,
        },
      });

      if (!customer) {
        throw new AppError(
          404,
          "CUSTOMER_NOT_FOUND",
          "Customer not found in this store",
        );
      }
    }

    const productIds = input.items.map((item) => item.productId);

    // 3. Lấy Product
    const products = await tx.product.findMany({
      where: {
        id: {
          in: productIds,
        },
      },
      select: {
        id: true,
        name: true,
        sku: true,
        price: true,
      },
    });

    const productMap = new Map(
      products.map((product) => [product.id, product]),
    );

    // 4. Lấy Inventory của store
    const inventories = await tx.inventory.findMany({
      where: {
        storeId,
        productId: {
          in: productIds,
        },
      },
      select: {
        id: true,
        productId: true,
        quantity: true,
      },
    });

    const inventoryMap = new Map(
      inventories.map((inventory) => [inventory.productId, inventory]),
    );

    // 5. Validate Product + Inventory + Stock
    // đồng thời snapshot price
    const orderItems = input.items.map((item) => {
      const product = productMap.get(item.productId);

      if (!product) {
        throw new AppError(404, "PRODUCT_NOT_FOUND", "Product not found", {
          productId: item.productId,
        });
      }

      const inventory = inventoryMap.get(item.productId);

      if (!inventory) {
        throw new AppError(
          404,
          "INVENTORY_NOT_FOUND",
          "Product is not available in this store",
          {
            productId: item.productId,
          },
        );
      }

      if (inventory.quantity < item.quantity) {
        throw new AppError(409, "INSUFFICIENT_STOCK", "Insufficient stock", {
          productId: item.productId,
          available: inventory.quantity,
          requested: item.quantity,
        });
      }

      return {
        productId: item.productId,
        quantity: item.quantity,

        // Không lấy giá từ client
        unitPrice: product.price,

        lineTotal: product.price * item.quantity,
      };
    });

    const totalAmount = orderItems.reduce(
      (total, item) => total + item.lineTotal,
      0,
    );

    // 6. Tạo Order + OrderItem
    const order = await tx.order.create({
      data: {
        storeId,
        customerId: input.customerId ?? null,

        createdById: userId,

        // Order này đã trừ kho nên được CONFIRMED
        status: "CONFIRMED",

        totalAmount,

        items: {
          create: orderItems,
        },
      },

      include: {
        customer: {
          select: {
            id: true,
            name: true,
            phone: true,
          },
        },

        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },

        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                sku: true,
              },
            },
          },
        },
      },
    });

    // 7. Decrease inventory
    for (const item of input.items) {
      const updated = await tx.inventory.updateMany({
        where: {
          storeId,
          productId: item.productId,

          // Guard chống stock âm
          quantity: {
            gte: item.quantity,
          },
        },

        data: {
          quantity: {
            decrement: item.quantity,
          },
        },
      });

      if (updated.count === 0) {
        throw new AppError(409, "INSUFFICIENT_STOCK", "Insufficient stock", {
          productId: item.productId,
        });
      }
    }

    // 8. Ghi Inventory History
    await tx.inventoryMovement.createMany({
      data: input.items.map((item) => ({
        storeId,
        productId: item.productId,

        userId,

        orderId: order.id,

        type: "STOCK_OUT",

        quantity: item.quantity,

        note: `Order #${order.id}`,
      })),
    });

    return order;
  });
};

export const getOrders = async (
  storeId: number,
  query: OrderListQueryInput,
) => {
  const store = await prisma.store.findUnique({
    where: {
      id: storeId,
    },
    select: {
      id: true,
    },
  });

  if (!store) {
    throw new AppError(404, "STORE_NOT_FOUND", "Store not found");
  }

  const { page, limit, status, customerId, from, to } = query;

  const skip = (page - 1) * limit;

  const where: Prisma.OrderWhereInput = {
    storeId,

    ...(status && {
      status,
    }),

    ...(customerId !== undefined && {
      customerId,
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

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,

      skip,
      take: limit,

      orderBy: {
        createdAt: "desc",
      },

      select: {
        id: true,
        status: true,
        totalAmount: true,
        createdAt: true,
        cancelledAt: true,

        customer: {
          select: {
            id: true,
            name: true,
            phone: true,
          },
        },

        createdBy: {
          select: {
            id: true,
            name: true,
          },
        },

        _count: {
          select: {
            items: true,
          },
        },
      },
    }),

    prisma.order.count({
      where,
    }),
  ]);

  return {
    data: orders,

    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const getOrderById = async (storeId: number, orderId: number) => {
  const order = await prisma.order.findFirst({
    where: {
      id: orderId,
      storeId,
    },

    include: {
      customer: true,

      createdBy: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },

      cancelledBy: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },

      items: {
        include: {
          product: {
            select: {
              id: true,
              name: true,
              sku: true,
            },
          },
        },
      },
    },
  });

  if (!order) {
    throw new AppError(404, "ORDER_NOT_FOUND", "Order not found");
  }

  return order;
};

export const cancelOrder = async (
  storeId: number,
  orderId: number,
  input: CancelOrderInput,
  userId: number,
) => {
  return prisma.$transaction(async (tx) => {
    // 1. Lấy Order + items
    const order = await tx.order.findFirst({
      where: {
        id: orderId,
        storeId,
      },

      select: {
        id: true,
        status: true,

        items: {
          select: {
            productId: true,
            quantity: true,
          },
        },
      },
    });

    if (!order) {
      throw new AppError(404, "ORDER_NOT_FOUND", "Order not found");
    }

    // 2. Check state để trả error rõ ràng
    if (order.status === "CANCELLED") {
      throw new AppError(
        409,
        "ORDER_ALREADY_CANCELLED",
        "Order has already been cancelled",
      );
    }

    if (order.status !== "CONFIRMED") {
      throw new AppError(
        409,
        "ORDER_CANNOT_BE_CANCELLED",
        "Only confirmed orders can be cancelled",
      );
    }

    /*
     * 3. Atomic state transition
     *
     * Đây là guard chống double cancellation.
     */
    const transition = await tx.order.updateMany({
      where: {
        id: orderId,
        storeId,

        // Quan trọng
        status: "CONFIRMED",
      },

      data: {
        status: "CANCELLED",

        cancelledAt: new Date(),

        cancelledById: userId,

        cancelReason: input.reason ?? null,
      },
    });

    /*
     * Request khác có thể đã cancel Order
     * ngay sau lúc chúng ta đọc Order.
     */
    if (transition.count === 0) {
      throw new AppError(
        409,
        "ORDER_STATE_CHANGED",
        "Order state has already changed",
      );
    }

    // 4. Restore inventory
    for (const item of order.items) {
      await tx.inventory.upsert({
        where: {
          storeId_productId: {
            storeId,
            productId: item.productId,
          },
        },

        create: {
          storeId,
          productId: item.productId,
          quantity: item.quantity,
        },

        update: {
          quantity: {
            increment: item.quantity,
          },
        },
      });
    }

    // 5. Audit Inventory History
    await tx.inventoryMovement.createMany({
      data: order.items.map((item) => ({
        storeId,

        productId: item.productId,

        userId,

        orderId,

        type: "STOCK_IN",

        quantity: item.quantity,

        note: `Cancelled order #${orderId}`,
      })),
    });

    // 6. Return updated order
    return tx.order.findUnique({
      where: {
        id: orderId,
      },

      include: {
        customer: {
          select: {
            id: true,
            name: true,
            phone: true,
          },
        },

        createdBy: {
          select: {
            id: true,
            name: true,
          },
        },

        cancelledBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },

        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                sku: true,
              },
            },
          },
        },
      },
    });
  });
};
