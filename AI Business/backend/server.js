import "dotenv/config";
import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.js";
import generateRoutes from "./routes/generate.js";
import websiteRoutes from "./routes/websites.js";
import usageRoutes from "./routes/usage.js";
import paymentRoutes from "./routes/payment.js";
import { connectDb } from "./config/db.js";
import { isSMTPConfigured, verifySMTPOnStartup } from "./utils/email.js";

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN || "http://localhost:3000",
    credentials: false
  })
);
app.use(express.json({ limit: "1mb" }));

app.get("/health", (req, res) => res.json({ ok: true }));

app.use("/auth", authRoutes);
app.use("/", usageRoutes);
app.use("/", paymentRoutes);
app.use("/", generateRoutes);
app.use("/", websiteRoutes);

const port = process.env.PORT || 8080;

async function start() {
  await connectDb(process.env.MONGODB_URI);
  if (process.env.NODE_ENV === "production" && !isSMTPConfigured()) {
    // eslint-disable-next-line no-console
    console.warn(
      "[email] Production mode but SMTP is not configured — OTP will only print in logs. Set SMTP_SERVICE=gmail + SMTP_USER + SMTP_PASS + EMAIL_FROM."
    );
  }
  await verifySMTPOnStartup();
  app.listen(port, () => {
    // eslint-disable-next-line no-console
    console.log(`API listening on :${port}`);
  });
}

start().catch((err) => {
  // eslint-disable-next-line no-console
  console.error("Failed to start server:", err);
  process.exit(1);
});

