import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    loginOtpHash: { type: String },
    loginOtpExpiresAt: { type: Date },
    resetPasswordTokenHash: { type: String },
    resetPasswordExpiresAt: { type: Date },
    plan: { type: String, enum: ["free", "pro"], default: "free" },
    proExpiresAt: { type: Date }
  },
  { timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" } }
);

export const User = mongoose.models.User || mongoose.model("User", UserSchema);

