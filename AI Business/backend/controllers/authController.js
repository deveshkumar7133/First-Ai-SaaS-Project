import bcrypt from "bcryptjs";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { User } from "../models/User.js";
import {
  loginVerificationUserMessage,
  sendLoginVerificationEmail,
  sendPasswordResetEmail
} from "../utils/email.js";

const OTP_TTL_MS = 10 * 60 * 1000;
const RESET_TTL_MS = 30 * 60 * 1000;

function verificationEmailErrorMessage(err) {
  const text = `${err?.message || ""}`;
  if (err?.code === "EAUTH" || /invalid login|username and password not accepted/i.test(text)) {
    return "SMTP login failed. Gmail me normal password nahi chalega; Google App Password use karo.";
  }
  return "Could not send verification email. Check SMTP settings or try again later.";
}

const signupSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email().max(200),
  password: z.string().min(8).max(200)
});

const loginSchema = z.object({
  email: z.string().email().max(200),
  password: z.string().min(8).max(200)
});

const verifyLoginSchema = z.object({
  email: z.string().email().max(200),
  code: z.string().regex(/^\d{6}$/, "Enter the 6-digit code from your email")
});

const forgotPasswordSchema = z.object({
  email: z.string().email().max(200)
});

const resetPasswordSchema = z.object({
  token: z.string().min(20).max(300),
  password: z.string().min(8).max(200)
});

function signToken(user) {
  const secret = process.env.JWT_SECRET;
  const expiresIn = process.env.JWT_EXPIRES_IN || "7d";
  return jwt.sign({ email: user.email }, secret, { subject: String(user._id), expiresIn });
}

function generateOtp() {
  return String(crypto.randomInt(100000, 1000000));
}

function sha256(input) {
  return crypto.createHash("sha256").update(input).digest("hex");
}

export async function signup(req, res) {
  try {
    const { name, email, password } = signupSchema.parse(req.body);
    const existing = await User.findOne({ email });
    if (existing) return res.status(409).json({ message: "Email already in use" });

    const hashed = await bcrypt.hash(password, 12);
    const user = await User.create({ name, email, password: hashed });

    const otp = generateOtp();
    user.loginOtpHash = await bcrypt.hash(otp, 10);
    user.loginOtpExpiresAt = new Date(Date.now() + OTP_TTL_MS);
    await user.save();

    let sendResult;
    try {
      sendResult = await sendLoginVerificationEmail({ to: user.email, code: otp, purpose: "signup" });
    } catch (sendErr) {
      // eslint-disable-next-line no-console
      console.error("sendLoginVerificationEmail:", sendErr);
      await User.deleteOne({ _id: user._id });
      return res.status(502).json({
        message: verificationEmailErrorMessage(sendErr)
      });
    }

    return res.status(201).json({
      requiresVerification: true,
      message: loginVerificationUserMessage(sendResult, { resend: false, signup: true })
    });
  } catch (err) {
    if (err?.name === "ZodError") return res.status(400).json({ message: "Invalid input", issues: err.issues });
    return res.status(500).json({ message: "Signup failed" });
  }
}

/** Step 1: password OK → send email with OTP (no JWT yet). */
export async function login(req, res) {
  try {
    const { email, password } = loginSchema.parse(req.body);
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ message: "Invalid credentials" });

    const otp = generateOtp();
    const loginOtpHash = await bcrypt.hash(otp, 10);
    user.loginOtpHash = loginOtpHash;
    user.loginOtpExpiresAt = new Date(Date.now() + OTP_TTL_MS);
    await user.save();

    let sendResult;
    try {
      sendResult = await sendLoginVerificationEmail({ to: user.email, code: otp });
    } catch (sendErr) {
      // eslint-disable-next-line no-console
      console.error("sendLoginVerificationEmail:", sendErr);
      user.loginOtpHash = undefined;
      user.loginOtpExpiresAt = undefined;
      await user.save();
      return res.status(502).json({
        message: verificationEmailErrorMessage(sendErr)
      });
    }

    return res.json({
      requiresVerification: true,
      message: loginVerificationUserMessage(sendResult, { resend: false })
    });
  } catch (err) {
    if (err?.name === "ZodError") return res.status(400).json({ message: "Invalid input", issues: err.issues });
    return res.status(500).json({ message: "Login failed" });
  }
}

/** Step 2: email + OTP → issue JWT. */
export async function verifyLogin(req, res) {
  try {
    const { email, code } = verifyLoginSchema.parse(req.body);
    const user = await User.findOne({ email });
    if (!user?.loginOtpHash || !user.loginOtpExpiresAt) {
      return res.status(400).json({ message: "No pending login. Sign in with email and password first." });
    }
    if (Date.now() > user.loginOtpExpiresAt.getTime()) {
      user.loginOtpHash = undefined;
      user.loginOtpExpiresAt = undefined;
      await user.save();
      return res.status(401).json({ message: "Code expired. Log in again to get a new code." });
    }

    const match = await bcrypt.compare(code, user.loginOtpHash);
    if (!match) return res.status(401).json({ message: "Invalid code" });

    user.loginOtpHash = undefined;
    user.loginOtpExpiresAt = undefined;
    await user.save();

    const token = signToken(user);
    return res.json({
      token,
      user: { id: user._id, name: user.name, email: user.email, createdAt: user.createdAt }
    });
  } catch (err) {
    if (err?.name === "ZodError") return res.status(400).json({ message: "Invalid input", issues: err.issues });
    return res.status(500).json({ message: "Verification failed" });
  }
}

/** Resend OTP after password check (same as login step 1). */
export async function resendLoginOtp(req, res) {
  try {
    const { email, password } = loginSchema.parse(req.body);
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ message: "Invalid credentials" });

    const otp = generateOtp();
    user.loginOtpHash = await bcrypt.hash(otp, 10);
    user.loginOtpExpiresAt = new Date(Date.now() + OTP_TTL_MS);
    await user.save();

    let sendResult;
    try {
      sendResult = await sendLoginVerificationEmail({ to: user.email, code: otp });
    } catch (sendErr) {
      // eslint-disable-next-line no-console
      console.error("sendLoginVerificationEmail:", sendErr);
      user.loginOtpHash = undefined;
      user.loginOtpExpiresAt = undefined;
      await user.save();
      return res.status(502).json({
        message: verificationEmailErrorMessage(sendErr)
      });
    }

    return res.json({
      message: loginVerificationUserMessage(sendResult, { resend: true })
    });
  } catch (err) {
    if (err?.name === "ZodError") return res.status(400).json({ message: "Invalid input", issues: err.issues });
    return res.status(500).json({ message: "Could not resend code" });
  }
}

/** Request password reset link (always returns ok). */
export async function forgotPassword(req, res) {
  try {
    const { email } = forgotPasswordSchema.parse(req.body);
    const user = await User.findOne({ email: email.toLowerCase().trim() });

    // Always return success to avoid user enumeration.
    if (!user) {
      return res.json({ ok: true, message: "If that email exists, we sent a reset link." });
    }

    const rawToken = crypto.randomBytes(32).toString("hex");
    user.resetPasswordTokenHash = sha256(rawToken);
    user.resetPasswordExpiresAt = new Date(Date.now() + RESET_TTL_MS);
    await user.save();

    const appUrl = process.env.APP_URL || process.env.CLIENT_ORIGIN || "http://localhost:3000";
    const resetUrl = `${appUrl.replace(/\/$/, "")}/reset-password?token=${encodeURIComponent(rawToken)}`;

    try {
      await sendPasswordResetEmail({ to: user.email, resetUrl });
    } catch (sendErr) {
      // eslint-disable-next-line no-console
      console.error("sendPasswordResetEmail:", sendErr);
      // still return ok
    }

    return res.json({ ok: true, message: "If that email exists, we sent a reset link." });
  } catch (err) {
    if (err?.name === "ZodError") return res.status(400).json({ message: "Invalid input", issues: err.issues });
    return res.status(500).json({ message: "Forgot password failed" });
  }
}

/** Reset password using token from email. */
export async function resetPassword(req, res) {
  try {
    const { token, password } = resetPasswordSchema.parse(req.body);
    const tokenHash = sha256(token);
    const user = await User.findOne({
      resetPasswordTokenHash: tokenHash,
      resetPasswordExpiresAt: { $gt: new Date() }
    });
    if (!user) return res.status(401).json({ message: "Invalid or expired reset link" });

    user.password = await bcrypt.hash(password, 12);
    user.resetPasswordTokenHash = undefined;
    user.resetPasswordExpiresAt = undefined;
    await user.save();

    return res.json({ ok: true, message: "Password reset successfully. Please log in." });
  } catch (err) {
    if (err?.name === "ZodError") return res.status(400).json({ message: "Invalid input", issues: err.issues });
    return res.status(500).json({ message: "Reset password failed" });
  }
}
