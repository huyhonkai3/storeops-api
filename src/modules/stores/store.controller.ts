import type { Request, Response } from "express";
import { AppError } from "../../errors/app-error.js";

import {
  getStores,
  getStoreById,
  createStore,
  updateStore,
  deleteStore,
} from "./store.service.js";

import type {
  CreateStoreInput,
  UpdateStoreInput,
  StoreListQuery,
} from "./store.types.js";

export const getAllStores = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const query = res.locals.validatedQuery as StoreListQuery;
  const stores = await getStores(query);
  res.json(stores);
};

export const getOneStore = async (
  req: Request<{ id: string }>,
  res: Response,
): Promise<void> => {
  const id = Number(req.params.id);
  const store = await getStoreById(id);
  if (!store) {
    throw new AppError(404, "STORE_NOT_FOUND", "Store not found");
  }
  res.status(200).json(store);
};

export const addStore = async (
  req: Request<{}, {}, CreateStoreInput>,
  res: Response,
): Promise<void> => {
  const store = await createStore(req.body);
  res.status(201).json(store);
};

export const editStore = async (
  req: Request<{ id: string }, {}, UpdateStoreInput>,
  res: Response,
): Promise<void> => {
  const id = Number(req.params.id);
  const store = await updateStore(id, req.body);
  if (!store) {
    throw new AppError(404, "STORE_NOT_FOUND", "Store not found");
  }
  res.status(200).json(store);
};

export const removeStore = async (
  req: Request<{ id: string }>,
  res: Response,
): Promise<void> => {
  const id = Number(req.params.id);
  const deleted = await deleteStore(id);
  if (!deleted) {
    throw new AppError(404, "STORE_NOT_FOUND", "Store not found");
  }
  res.status(200).json(deleted);
};
