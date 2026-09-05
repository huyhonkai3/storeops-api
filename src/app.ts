import express from "express";

import { errorHandler } from "./middlewares/error.middleware.js";
import { notFoundHandler } from "./middlewares/not-found.middleware.js";

import productRoutes from "./modules/products/product.routes.js";
import authRoutes from "./modules/auth/auth.routes.js";

const app = express();

app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.status(200).json({
    status: "ok",
  });
});

app.use("/api/products", productRoutes);
app.use("/api/auth", authRoutes);

// Không route match
app.use(notFoundHandler);

// Error handler
app.use(errorHandler);

export default app;
