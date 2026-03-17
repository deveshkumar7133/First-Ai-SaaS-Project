import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { getUsage } from "../controllers/usageController.js";

const router = Router();

router.get("/usage", requireAuth, getUsage);

export default router;
