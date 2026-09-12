import type { Request, Response } from "express";

import { AppError } from "../../errors/app-error.js";

import {
  createOrder,
  confirmOrder,
  getOrders,
  getOrderById,
  cancelOrder,
} from "./order.service.js";

import type {
  CreateOrderInput,
  OrderListQueryInput,
  CancelOrderInput,
} from "./order.types.js";

export const placeOrder = async (
  req: Request<{ storeId: string }, {}, CreateOrderInput>,
  res: Response,
): Promise<void> => {
  if (!req.user) {
    throw new AppError(
      401,
      "AUTHENTICATION_REQUIRED",
      "Authentication required",
    );
  }

  const storeId = Number(req.params.storeId);

  const order = await createOrder(storeId, req.body, req.user.id);

  res.status(201).json({
    data: order,
  });
};

export const confirmOneOrder = async (
  req: Request<{ storeId: string; orderId: string }>,
  res: Response,
): Promise<void> => {
  if (!req.user) {
    throw new AppError(
      401,
      "AUTHENTICATION_REQUIRED",
      "Authentication required",
    );
  }
  const storeId = Number(req.params.storeId);
  const orderId = Number(req.params.orderId);
  const order = await confirmOrder(storeId, orderId, req.user.id);

  res.status(200).json({
    data: order,
  });
};

export const getAllOrders = async (
  req: Request<{ storeId: string }>,
  res: Response,
): Promise<void> => {
  const storeId = Number(req.params.storeId);

  const query = res.locals.validatedQuery as OrderListQueryInput;

  const result = await getOrders(storeId, query);

  res.status(200).json(result);
};

export const getOneOrder = async (
  req: Request<{
    storeId: string;
    orderId: string;
  }>,
  res: Response,
): Promise<void> => {
  const storeId = Number(req.params.storeId);

  const orderId = Number(req.params.orderId);

  const order = await getOrderById(storeId, orderId);

  res.status(200).json({
    data: order,
  });
};

export const cancelOneOrder = async (
  req: Request<
    {
      storeId: string;
      orderId: string;
    },
    {},
    CancelOrderInput
  >,
  res: Response,
): Promise<void> => {
  if (!req.user) {
    throw new AppError(
      401,
      "AUTHENTICATION_REQUIRED",
      "Authentication required",
    );
  }

  const storeId = Number(req.params.storeId);

  const orderId = Number(req.params.orderId);

  const order = await cancelOrder(storeId, orderId, req.body, req.user.id);

  res.status(200).json({
    data: order,
  });
};
