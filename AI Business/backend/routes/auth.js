import { Router } from "express";
import {
  forgotPassword,
  login,
  resendLoginOtp,
  resetPassword,
  signup,
  verifyLogin
} from "../controllers/authController.js";

const router = Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/verify-login", verifyLogin);
router.post("/resend-login-otp", resendLoginOtp);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

export default router;

