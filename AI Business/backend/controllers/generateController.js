import { z } from "zod";
import OpenAI from "openai";
import { getUsageForUser, consumePoint } from "../models/Usage.js";

const inputSchema = z.object({
  businessName: z.string().min(2).max(120),
  businessType: z.string().min(2).max(80),
  city: z.string().min(2).max(80),
  businessDescription: z.string().min(10).max(1200)
});

function buildPrompt(input) {
  const { businessName, businessType, city, businessDescription } = input;
  return `You are a senior product designer + copywriter.
Generate a modern, high-converting website for this business.

Business:
- Name: ${businessName}
- Type: ${businessType}
- City: ${city}
- Description: ${businessDescription}

Goals:
- Feel like a polished modern SaaS/brand.
- Very clear hero with strong value prop + CTA.
- Rich, specific copy (no generic filler).
- Each section text should be detailed and helpful.

Return ONLY valid JSON matching this exact schema (no markdown, no backticks, no comments):
{
  "homepage": {
    "headline": "strong, benefit-driven headline (max ~90 chars)",
    "subheadline": "2–3 sentences explaining who this is for and why it's great",
    "ctaPrimary": "primary action button label",
    "ctaSecondary": "secondary action button label",
    "highlights": [
      "concise bullet about a key benefit",
      "concise bullet about a key benefit",
      "concise bullet about a key benefit"
    ]
  },
  "about": {
    "title": "section title",
    "paragraphs": [
      "1–2 sentences overview in brand voice",
      "1–2 sentences with more detail, proof, or story"
    ]
  },
  "services": {
    "title": "section title",
    "items": [
      { "title": "service name", "description": "2–3 sentence detailed description" },
      { "title": "service name", "description": "2–3 sentence detailed description" },
      { "title": "service name", "description": "2–3 sentence detailed description" }
    ]
  },
  "contact": {
    "title": "section title",
    "description": "short paragraph with a clear invitation to contact or visit",
    "addressLine": "single-line address",
    "phone": "realistic phone format string",
    "email": "realistic email address string",
    "hours": [
      "friendly opening hours line",
      "friendly opening hours line",
      "friendly opening hours line"
    ]
  },
  "seo": {
    "title": "SEO title tag (max ~60 chars)",
    "description": "SEO meta description (max ~155 chars)"
  }
}`;
}

function buildMockContent(input) {
  const { businessName, businessType, city, businessDescription } = input;
  const name = businessName || "Your Business";
  return {
    homepage: {
      headline: `Welcome to ${name}`,
      subheadline: businessDescription?.slice(0, 120) || `${businessType} in ${city}. Quality service, great experience.`,
      ctaPrimary: "Get in touch",
      ctaSecondary: "View our services",
      highlights: [
        `Quality ${businessType} in ${city}`,
        "Friendly service & great value",
        "Visit us today"
      ]
    },
    about: {
      title: `About ${name}`,
      paragraphs: [
        businessDescription || `We are a ${businessType} business based in ${city}, committed to serving our customers with the best experience.`,
        `Located in ${city}, we take pride in what we do and look forward to welcoming you.`
      ]
    },
    services: {
      title: "What we offer",
      items: [
        { title: "Primary services", description: `Our core ${businessType} offerings tailored for you.` },
        { title: "Support & care", description: "Dedicated support to make your experience smooth." },
        { title: "Quality assurance", description: "We maintain high standards in everything we do." }
      ]
    },
    contact: {
      title: "Contact us",
      description: `Reach out to ${name} — we'd love to hear from you.`,
      addressLine: `${name}, ${city}`,
      phone: "+91 XXXXX XXXXX",
      email: "hello@example.com",
      hours: ["Mon–Fri: 9 AM – 6 PM", "Sat: 10 AM – 4 PM", "Sun: Closed"]
    },
    seo: {
      title: `${name} | ${businessType} in ${city}`,
      description: businessDescription?.slice(0, 155) || `${name} - ${businessType} in ${city}. Get in touch today.`
    }
  };
}

export async function generateContent(req, res) {
  try {
    const input = inputSchema.parse(req.body);
    const usage = await getUsageForUser(req.user.id);
    if (usage.pointsLeft <= 0) {
      return res.status(403).json({
        message: "Monthly limit reached. You've used 5/5 free points. Resets next month.",
        pointsUsed: usage.pointsUsed,
        pointsLimit: usage.pointsLimit
      });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    const modelName = process.env.OPENAI_MODEL || "gpt-4o-mini";

    if (!apiKey) {
      console.warn("[generateContent] OPENAI_API_KEY missing — using mock content");
      const content = buildMockContent(input);
      await consumePoint(req.user.id);
      return res.json({ generatedContent: content, mockFallback: true });
    }

    const client = new OpenAI({ apiKey });
    const response = await client.chat.completions.create({
      model: modelName,
      temperature: 0.7,
      messages: [{ role: "user", content: buildPrompt(input) }],
      response_format: { type: "json_object" }
    });
    const raw = response?.choices?.[0]?.message?.content || "{}";
    let json;
    try {
      json = JSON.parse(raw);
    } catch {
      console.error("[generateContent] OpenAI returned invalid JSON, falling back to mock");
      const fallback = buildMockContent(input);
      await consumePoint(req.user.id);
      return res.json({ generatedContent: fallback, mockFallback: true });
    }

    await consumePoint(req.user.id);
    return res.json({ generatedContent: json });
  } catch (err) {
    if (err?.name === "ZodError") return res.status(400).json({ message: "Invalid input", issues: err.issues });
    console.error("[generateContent] Error (using mock fallback):", err?.message || err);
    const input = inputSchema.safeParse(req.body);
    const parsed = input.success ? input.data : {
      businessName: "Sample Business",
      businessType: "General",
      city: "Your City",
      businessDescription: "Sample description for development."
    };
    const usage = await getUsageForUser(req.user.id);
    if (usage.pointsLeft > 0) await consumePoint(req.user.id);
    return res.json({ generatedContent: buildMockContent(parsed), mockFallback: true });
  }
}

