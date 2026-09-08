import type { Request, Response } from "express";
import { AppError } from "../../errors/app-error.js";
import {
  getInventoryItem,
  getStoreInventory,
  stockIn,
  stockOut,
  getInventoryHistory,
} from "./inventory.service.js";
import {
  StockMovementInput,
  InventoryHistoryQueryInput,
} from "./inventory.types.js";

export const getInventory = async (
  req: Request<{ storeId: string }>,
  res: Response,
): Promise<void> => {
  const storeId = Number(req.params.storeId);
  const inventory = await getStoreInventory(storeId);
  res.status(200).json({
    data: inventory,
  });
};

export const getOneInventoryItem = async (
  req: Request<{ storeId: string; productId: string }>,
  res: Response,
): Promise<void> => {
  const storeId = Number(req.params.storeId);
  const productId = Number(req.params.productId);
  const inventory = await getInventoryItem(storeId, productId);
  res.status(200).json({
    data: inventory,
  });
};

export const addStock = async (
  req: Request<{ storeId: string }, {}, StockMovementInput>,
  res: Response,
): Promise<void> => {
  const storeId = Number(req.params.storeId);
  if (!req.user) {
    throw new AppError(
      401,
      "AUTHENTICATION_REQUIRED",
      "Authentication required",
    );
  }
  const result = await stockIn(storeId, req.body, req.user.id);

  res.status(200).json({
    data: result,
  });
};

export const removeStock = async (
  req: Request<{ storeId: string }, {}, StockMovementInput>,
  res: Response,
): Promise<void> => {
  const storeId = Number(req.params.storeId);
  if (!req.user) {
    throw new AppError(
      401,
      "AUTHENTICATION_REQUIRED",
      "Authentication required",
    );
  }
  const result = await stockOut(storeId, req.body, req.user.id);

  res.status(200).json({
    data: result,
  });
};

export const getHistory = async (
  req: Request<{ storeId: string }>,
  res: Response,
): Promise<void> => {
  const storeId = Number(req.params.storeId);
  const query = res.locals.validateQuery as InventoryHistoryQueryInput;
  const history = await getInventoryHistory(storeId, query);
  res.status(200).json(history);
};
