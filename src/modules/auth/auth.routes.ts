import { Router } from "express";
import { validateBody } from "../../middlewares/validate.middleware.js";

import { registerUser, loginUser, getMe } from "./auth.controller.js";
import { loginSchema, registerSchema } from "./auth.schema.js";
import { authenticate } from "../../middlewares/auth.middleware.js";

const router = Router();

router.post("/register", validateBody(registerSchema), registerUser);
router.post("/login", validateBody(loginSchema), loginUser);
router.get("/me", authenticate, getMe);

export default router;
