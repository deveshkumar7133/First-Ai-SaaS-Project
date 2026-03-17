import crypto from "crypto";
import { z } from "zod";
import Razorpay from "razorpay";
import { User } from "../models/User.js";

const keyId = process.env.RAZORPAY_KEY_ID;
const keySecret = process.env.RAZORPAY_KEY_SECRET;

const PRO_AMOUNT_PAISE = 29900; // ₹299
const PRO_DURATION_MONTHS = 1;

const createOrderSchema = z.object({ planId: z.literal("pro") });
const verifySchema = z.object({
  orderId: z.string().min(1),
  paymentId: z.string().min(1),
  signature: z.string().min(1)
});

export async function createOrder(req, res) {
  try {
    if (!keyId || !keySecret) {
      return res.status(503).json({ message: "Payments not configured. Add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET." });
    }
    createOrderSchema.parse(req.body);
    const receipt = `sub_${req.user.id}_${Date.now()}`.slice(0, 40);

    const razorpay = new Razorpay({ key_id: keyId, key_secret: keySecret });
    const order = await razorpay.orders.create({
      amount: PRO_AMOUNT_PAISE,
      currency: "INR",
      receipt
    });

    return res.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId
    });
  } catch (err) {
    if (err?.name === "ZodError") return res.status(400).json({ message: "Invalid input", issues: err.issues });
    console.error("[createOrder]", err?.message || err);
    return res.status(500).json({ message: "Failed to create order" });
  }
}

export async function verifyPayment(req, res) {
  try {
    if (!keySecret) {
      return res.status(503).json({ message: "Payments not configured." });
    }
    const { orderId, paymentId, signature } = verifySchema.parse(req.body);

    const payload = `${orderId}|${paymentId}`;
    const expected = crypto.createHmac("sha256", keySecret).update(payload).digest("hex");
    if (expected !== signature) {
      return res.status(400).json({ message: "Invalid payment signature" });
    }

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const now = new Date();
    const expiresAt = new Date(now);
    expiresAt.setMonth(expiresAt.getMonth() + PRO_DURATION_MONTHS);

    user.plan = "pro";
    user.proExpiresAt = expiresAt;
    await user.save();

    return res.json({
      success: true,
      message: "Pro plan activated",
      proExpiresAt: user.proExpiresAt
    });
  } catch (err) {
    if (err?.name === "ZodError") return res.status(400).json({ message: "Invalid input", issues: err.issues });
    console.error("[verifyPayment]", err?.message || err);
    return res.status(500).json({ message: "Payment verification failed" });
  }
}
