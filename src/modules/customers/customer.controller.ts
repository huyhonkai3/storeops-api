import type { Request, Response } from "express";

import {
  getCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  deleteCustomer,
} from "./customer.service.js";

import {
  CreateCustomerInput,
  UpdateCustomerInput,
  CustomerListQueryInput,
} from "./customer.types.js";

export const getAllCustomers = async (
  req: Request<{ storeId: string }>,
  res: Response,
): Promise<void> => {
  const storeId = Number(req.params.storeId);
  const query = res.locals.validatedQuery as CustomerListQueryInput;
  const result = await getCustomers(storeId, query);
  res.status(200).json(result);
};

export const getOneCustomer = async (
  req: Request<{ storeId: string; customerId: string }>,
  res: Response,
): Promise<void> => {
  const storeId = Number(req.params.storeId);
  const customerId = Number(req.params.customerId);
  const customer = await getCustomerById(storeId, customerId);
  res.status(200).json({ data: customer });
};

export const addCustomer = async (
  req: Request<{ storeId: string }, {}, CreateCustomerInput>,
  res: Response,
): Promise<void> => {
  const storeId = Number(req.params.storeId);
  const customer = await createCustomer(storeId, req.body);
  res.status(201).json({ data: customer });
};

export const editCustomer = async (
  req: Request<
    { storeId: string; customerId: string },
    {},
    UpdateCustomerInput
  >,
  res: Response,
): Promise<void> => {
  const storeId = Number(req.params.storeId);
  const customerId = Number(req.params.customerId);
  const customer = await updateCustomer(storeId, customerId, req.body);
  res.status(200).json({ data: customer });
};

export const removeCustomer = async (
  req: Request<{ storeId: string; customerId: string }>,
  res: Response,
): Promise<void> => {
  const storeId = Number(req.params.storeId);
  const customerId = Number(req.params.customerId);
  await deleteCustomer(storeId, customerId);
  res.status(204).send();
};
