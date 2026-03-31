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
    type: { type: String, enum: ["website", "mobile"], default: "website" },
    siteName: { type: String, required: true, trim: true },
    layout: {
      type: String,
      enum: ["grid", "split", "cards", "modern"],
      default: "modern"
    },
    theme: {
      style: { type: String, enum: ["modern", "minimal", "luxury", "dark", "colorful"] },
      primaryColor: { type: String, default: "#6366f1" },
      secondaryColor: { type: String },
      accentColor: { type: String },
      font: { type: String, default: "ui-sans-serif" },
      backgroundColor: { type: String },
      textColor: { type: String },
      mutedTextColor: { type: String },
      borderColor: { type: String },
      surfaceColor: { type: String },
      radius: { type: Number },
      shadow: { type: String }
    },
    // For `type=website`, this stores the generated page sections.
    // For `type=mobile`, keep it empty and store `mobileSpec` below instead.
    sections: { type: [SectionSchema], required: true, default: [] },
    mobileSpec: { type: mongoose.Schema.Types.Mixed, default: undefined },
    prompt: { type: String, required: true }
  },
  { timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" } }
);

export const Website = mongoose.models.Website || mongoose.model("Website", WebsiteSchema);

