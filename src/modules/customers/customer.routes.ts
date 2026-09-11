import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware.js";
import { requireStoreMember } from "../../middlewares/store-member.middleware.js";
import { requireStoreRole } from "../../middlewares/store-role.middleware.js";

import {
  validateBody,
  validateParams,
  validateQuery,
} from "../../middlewares/validate.middleware.js";

import {
  createCustomerSchema,
  updateCustomerSchema,
  customerParamsSchema,
  customerStoreParamsSchema,
  customerListQuerySchema,
} from "./customer.schema.js";

import {
  addCustomer,
  getAllCustomers,
  getOneCustomer,
  editCustomer,
  removeCustomer,
} from "./customer.controller.js";
import { get } from "https";

const router = Router();

router.use(authenticate);

router.get(
  "/:storeId/customers",
  validateParams(customerStoreParamsSchema),
  requireStoreMember,
  validateQuery(customerListQuerySchema),
  getAllCustomers,
);

router.get(
  "/:storeId/customer/:customerId",
  validateParams(customerParamsSchema),
  requireStoreMember,
  getOneCustomer,
);

router.post(
  "/:storeId/customers",
  validateParams(customerStoreParamsSchema),
  requireStoreRole("MANAGER", "STAFF"),
  validateBody(createCustomerSchema),
  addCustomer,
);

router.patch(
  "/:storeId/customers/:customerId",
  validateParams(customerParamsSchema),
  requireStoreRole("MANAGER", "STAFF"),
  validateBody(updateCustomerSchema),
  editCustomer,
);

router.delete(
  "/:storeId/customers/:customerId",
  validateParams(customerParamsSchema),
  requireStoreRole("MANAGER"),
  removeCustomer,
);

export default router;
