import mongoose from "mongoose";

const SectionSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: true,
      enum: ["hero", "about", "services", "gallery", "testimonials", "faq", "contact", "cta"]
    },
    content: { type: mongoose.Schema.Types.Mixed, required: true }
  },
  { _id: false }
);

const WebsiteSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    siteName: { type: String, required: true, trim: true },
    theme: {
      primaryColor: { type: String, default: "#6366f1" },
      font: { type: String, default: "ui-sans-serif" }
    },
    sections: { type: [SectionSchema], required: true },
    prompt: { type: String, required: true }
  },
  { timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" } }
);

export const Website = mongoose.models.Website || mongoose.model("Website", WebsiteSchema);

