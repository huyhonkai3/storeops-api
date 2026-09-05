import { Router } from "express";

import { authenticate } from "../../middlewares/auth.middleware.js";
import { authorize } from "../../middlewares/authorize.middleware.js";

import {
  validateBody,
  validateParams,
  validateQuery,
} from "../../middlewares/validate.middleware.js";

import {
  addProduct,
  getAllProducts,
  getOneProduct,
  editProduct,
  removeProduct,
} from "./product.controller.js";

import {
  createProductSchema,
  productIdParamsSchema,
  updateProductSchema,
  productListQuerySchema,
} from "./product.schema.js";

const router = Router();

// Tất cả Product API yêu cầu đăng nhập.
router.use(authenticate);

// USER và ADMIN đều được đọc Product.
router.get("/", validateQuery(productListQuerySchema), getAllProducts);
router.get("/:id", validateParams(productIdParamsSchema), getOneProduct);

// Chỉ ADMIN được thay đổi Product.
router.post(
  "/",
  authorize("ADMIN"),
  validateBody(createProductSchema),
  addProduct,
);
router.patch(
  "/:id",
  authorize("ADMIN"),
  validateParams(productIdParamsSchema),
  validateBody(updateProductSchema),
  editProduct,
);
router.delete(
  "/:id",
  authorize("ADMIN"),
  validateParams(productIdParamsSchema),
  removeProduct,
);

export default router;
