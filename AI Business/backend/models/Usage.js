import mongoose from "mongoose";
import { User } from "./User.js";

const FREE_POINTS_PER_MONTH = 5;
const PRO_POINTS_PER_MONTH = 50;

const UsageSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    month: { type: String, required: true, index: true }, // "YYYY-MM"
    pointsUsed: { type: Number, required: true, default: 0 }
  },
  { timestamps: true }
);

UsageSchema.index({ userId: 1, month: 1 }, { unique: true });

export const Usage = mongoose.models.Usage || mongoose.model("Usage", UsageSchema);

export function getCurrentMonth() {
  const now = new Date();
  return `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}`;
}

export async function getPointsLimitForUser(userId) {
  const user = await User.findById(userId).select("plan proExpiresAt").lean();
  if (!user) return FREE_POINTS_PER_MONTH;
  if (user.plan === "pro" && user.proExpiresAt && new Date(user.proExpiresAt) > new Date()) {
    return PRO_POINTS_PER_MONTH;
  }
  return FREE_POINTS_PER_MONTH;
}

export async function getUsageForUser(userId) {
  const month = getCurrentMonth();
  let doc = await Usage.findOne({ userId, month });
  if (!doc) doc = await Usage.create({ userId, month, pointsUsed: 0 });
  const pointsLimit = await getPointsLimitForUser(userId);
  const pointsUsed = doc.pointsUsed;
  const pointsLeft = Math.max(0, pointsLimit - pointsUsed);
  return { pointsUsed, pointsLimit, pointsLeft, month };
}

export async function consumePoint(userId) {
  const month = getCurrentMonth();
  let doc = await Usage.findOne({ userId, month });
  if (!doc) doc = await Usage.create({ userId, month, pointsUsed: 0 });
  const limit = await getPointsLimitForUser(userId);
  if (doc.pointsUsed >= limit) return false;
  doc.pointsUsed += 1;
  await doc.save();
  return true;
}

export { FREE_POINTS_PER_MONTH };
