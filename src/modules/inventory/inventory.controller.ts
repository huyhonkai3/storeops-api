import type { Request, Response } from "express";
import { getInventoryItem, getStoreInventory } from "./inventory.service.js";

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
