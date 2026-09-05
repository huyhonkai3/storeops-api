import { Router } from "express";
import { validateBody } from "../../middlewares/validate.middleware.js";
import { registerUser } from "./auth.controller.js";
import { registerSchema } from "./auth.schema.js";
const router = Router();
router.post("/register", validateBody(registerSchema), registerUser);
export default router;
