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

    // 4. Snapshot giá
    const orderItems = input.items.map((item) => {
      const product = productMap.get(item.productId);
      if (!product) {
        throw new AppError(404, "PRODUCT_NOT_FOUND", "Product not found", {
          productId: item.productId,
        });
      }

      return {
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: product.price,
        lineTotal: product.price * item.quantity,
      };
    });

    const totalAmount = orderItems.reduce(
      (total, item) => total + item.lineTotal,
      0,
    );

    // 5. Tạo PENDING Order
    return tx.order.create({
      data: {
        storeId,

        customerId: input.customerId ?? null,

        createdById: userId,

        /*
         * Không cần status: "PENDING"
         * vì schema đã default PENDING.
         */
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
  });
};

export const confirmOrder = async (
  storeId: number,
  orderId: number,
  userId: number,
) => {
  return prisma.$transaction(async (tx) => {
    // 1. Load Order
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

    // 2. Business rule
    if (order.status === "CONFIRMED") {
      throw new AppError(
        400,
        "ORDER_ALREADY_CONFIRMED",
        "Order has already been confirmed",
      );
    }
    if (order.status === "CANCELLED") {
      throw new AppError(
        400,
        "ORDER_CANNOT_BE_CONFIRMED",
        "Cancelled order cannot be confirmed",
      );
    }

    /**
     * 3. Guard state transition
     * Chỉ PENDING mới được CONFIRMED
     */
    const transition = await tx.order.updateMany({
      where: {
        id: orderId,
        storeId,
        status: "PENDING",
      },
      data: {
        status: "CONFIRMED",
      },
    });
    if (transition.count === 0) {
      throw new AppError(
        400,
        "ORDER_STATE_CHANGED",
        "Order state already changed",
      );
    }

    // 4. Deduct inventory
    for (const item of order.items) {
      const updated = await tx.inventory.updateMany({
        where: {
          storeId,
          productId: item.productId,
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
        throw new AppError(
          409,
          "INSUFFICIENT_INVENTORY",
          "Insufficient stock",
          {
            productId: item.productId,
            requested: item.quantity,
          },
        );
      }
    }

    // 5.Audit stock movement
    await tx.inventoryMovement.createMany({
      data: order.items.map((item) => ({
        storeId,
        productId: item.productId,
        userId,
        type: "STOCK_OUT",
        quantity: item.quantity,
        note: `Confirmed order ${order.id}`,
      })),
    });

    // 6. Return confirmed order
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
            email: true,
          },
        },
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });
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

    const previousStatus = order.status;
    const transition = await tx.order.updateMany({
      where: {
        id: orderId,
        storeId,
        // status phải giống lúc vừa đọc
        status: previousStatus,
      },
      data: {
        status: "CANCELLED",
        cancelledAt: new Date(),
        cancelledById: userId,
        cancelReason: input.reason ?? null,
      },
    });
    if (transition.count === 0) {
      throw new AppError(
        409,
        "ORDER_STATE_CHANGED",
        "Order state has already changed",
      );
    }

    if (previousStatus === "CONFIRMED") {
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
      }
    }
  });
};
