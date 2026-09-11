import express from "express";

import { errorHandler } from "./middlewares/error.middleware.js";
import { notFoundHandler } from "./middlewares/not-found.middleware.js";

import productRoutes from "./modules/products/product.routes.js";
import authRoutes from "./modules/auth/auth.routes.js";
import storeRoutes from "./modules/stores/store.routes.js";
import storeMemberRoutes from "./modules/store-members/store-member.routes.js";
import inventoryRoutes from "./modules/inventory/inventory.routes.js";
import customerRoutes from "./modules/customers/customer.routes.js";
import orderRoutes from "./modules/orders/order.routes.js";

const app = express();

app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.status(200).json({
    status: "ok",
  });
});

app.use("/api/products", productRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/stores", storeRoutes);
app.use("/api/store", storeMemberRoutes);
app.use("/api/stores", inventoryRoutes);
app.use("/api/stores", customerRoutes);
app.use("/api/stores", orderRoutes);

// Không route match
app.use(notFoundHandler);

// Error handler
app.use(errorHandler);

export default app;
