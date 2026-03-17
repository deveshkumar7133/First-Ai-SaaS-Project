import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { createOrder, verifyPayment } from "../controllers/paymentController.js";

const router = Router();

router.post("/create-order", requireAuth, createOrder);
router.post("/verify-payment", requireAuth, verifyPayment);

export default router;
