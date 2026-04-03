import { z } from "zod";
import OpenAI from "openai";
import { Website } from "../models/Website.js";
import { getUsageForUser, consumePoint } from "../models/Usage.js";
import { mergeWebsiteTheme } from "../utils/themeFromPrompt.js";
import { normalizeLayout, normalizeSections } from "../utils/normalizeWebsiteJson.js";

const inputSchema = z
  .object({
    type: z.enum(["website", "mobile"]).optional(),
    // Backward compatibility: older frontend sends `{ prompt }`
    prompt: z.string().optional(),
    businessType: z.string().optional(),
    features: z.string().optional()
  })
  .refine(
    (v) => (v.prompt && v.prompt.length >= 3) || (v.businessType && v.businessType.length >= 2),
    { message: "Provide `prompt` or `businessType`." }
  );

function buildSystemPrompt() {
  return `You are an AI website generator. Output is ONE JSON object only.
CRITICAL: Do NOT return HTML, React, or CSS source code. Do NOT use markdown or backticks.
Return strict JSON only — no explanation text before or after.`;
}

function buildUserPrompt(prompt) {
  return `You are an AI website generator.

User request:
"${prompt}"

IMPORTANT:
- Do NOT return HTML — ONLY structured JSON.
- Do NOT use fixed templates or generic filler copy.
- Generate a UNIQUE site every time: different layout mode, section mix/order, theme colors, headlines, and body copy.
- Every response must feel different from previous ones (vary creative choices).

LAYOUT:
- Set top-level "layout" to EXACTLY ONE of: "grid" | "split" | "cards" | "modern"
- Pick the layout that best fits the prompt (e.g. dense offers → cards; editorial → split; feature grid → grid).
- Randomize when more than one option fits — do not always pick "modern".

SECTIONS:
- Use types ONLY from: hero, about, services, gallery, testimonials, faq, contact, cta
- Include/exclude types based on relevance. Add testimonials, FAQ, etc. when they fit.
- For "pricing": there is no pricing type — use "services" with plan-like titles/prices described in the text (tiers, packages).
- 5–8 sections total. Hero must be first. Vary middle section order intelligently.
- Optional: model may use either nested "content" objects (preferred) OR flat fields for hero (headline/title, subtext/subtitle, cta) — both are accepted by the app.

THEME:
- "theme" must be an OBJECT (not a string). It must include a design style and a full palette + UI tokens so the frontend can render dynamically (no static design system).
- Choose theme.style from: "modern" | "minimal" | "luxury" | "dark" | "colorful"
- Provide: primaryColor, secondaryColor, accentColor, backgroundColor, surfaceColor, textColor, mutedTextColor, borderColor, font, radius (number, 10–26), shadow (string).
- Do NOT default to indigo #6366f1 unless the prompt asks for purple/indigo.
- Ensure the palette is cohesive and sufficiently contrasted.

SECTION DESIGN VARIATIONS:
- Each section MUST include a "variant" string inside its content to drive design variation. Keep it short and meaningful.
- Examples:
  - hero.content.variant: "centered-gradient" | "split-media" | "poster" | "stacked"
  - services.content.variant: "icon-grid" | "cards" | "compact-list"
  - about.content.variant: "split" | "story" | "timeline"
  - gallery.content.variant: "bento" | "masonry" | "strip"
  - testimonials.content.variant: "cards" | "minimal" | "marquee"
  - faq.content.variant: "accordion" | "two-column"
  - contact.content.variant: "panel" | "minimal"
  - cta.content.variant: "banner" | "card"

Return ONLY valid JSON with this shape (layout is ONE of: grid | split | cards | modern):
{
  "siteName": "string",
  "layout": "modern",
  "theme": {
    "style": "modern",
    "primaryColor": "string",
    "secondaryColor": "string",
    "accentColor": "string",
    "font": "string",
    "backgroundColor": "string",
    "surfaceColor": "string",
    "textColor": "string",
    "mutedTextColor": "string",
    "borderColor": "string",
    "radius": 18,
    "shadow": "0 20px 60px rgba(0,0,0,.35)"
  },
  "sections": [
    {
      "type": "hero",
      "content": {
        "variant": "centered-gradient",
        "headline": "string",
        "subtext": "string",
        "cta": "string"
      }
    }
  ]
}

Section "content" keys (required keys per type — keep arrays non-empty when that section is included):
- hero: headline, subtext, cta
- about: title, description
- services: title, items[{title,description}]
- gallery: title, images[{src,alt}]
- testimonials: title, items[{name,quote,rating}]
- faq: title, items[{question,answer}]
- contact: title, description, addressLine, phone, email, hours (array of strings)
- cta: title, description, cta

Return ONLY JSON.`;
}

function buildMobileSystemPrompt() {
  return `You are an AI mobile app generator.
Output is ONE JSON object only.
CRITICAL: Do NOT return code, markdown, or any text besides the JSON.
Return strict JSON only — no explanation text before or after.`;
}

function buildMobileUserPrompt(input) {
  const { businessType, features, prompt } = input;
  return `Create a mobile app for: ${businessType || "the user-provided business"}

Description:
${prompt || ""}

Optional features:
${features || "none"}

Return ONLY valid JSON matching this exact shape:
{
  "appName": "string",
  "theme": {
    "primaryColor": "string",
    "style": "string",
    "backgroundColor": "string",
    "surfaceColor": "string",
    "textColor": "string",
    "mutedTextColor": "string",
    "borderColor": "string",
    "radius": 18,
    "shadow": "string"
  },
  "screens": [
    {
      "name": "Home|Login|Signup|Profile|Product|Cart|Settings",
      "components": [
        {
          "type": "header|card|input|button",
          "title": "string",
          "content": "string",
          "placeholder": "string",
          "text": "string"
        }
      ]
    }
  ]
}

Screen rules:
- Always include Home, Login, Signup, Profile, Product, Settings in \`screens\`.
- Include Cart only if the input suggests eCommerce (cart, checkout, order, payment, buy, store). Otherwise omit Cart.
- Components should be realistic UI structure; no placeholder text like "lorem ipsum".
- Theme: set \`theme.style\` to one of: "modern" | "minimal" | "luxury" | "dark" | "colorful", and ensure the palette colors work together (good contrast).
- Avoid any text inside images (this is JSON only).`;
}

function normalizeAppSpec(raw, input) {
  const app = raw && typeof raw === "object" ? raw : {};
  const appName = String(app.appName || (input.businessType ? `${input.businessType} App` : "Mobile App")).slice(0, 60);
  const theme = typeof app.theme === "object" && app.theme ? app.theme : {};
  const screens = Array.isArray(app.screens) ? app.screens : [];

  const allowedScreenNames = new Set(["Home", "Login", "Signup", "Profile", "Product", "Cart", "Settings"]);
  const wantsCart = /cart|checkout|payment|order|buy|store/i.test(String(input.features || "") + " " + String(input.prompt || ""));

  function normalizeComponent(c) {
    if (!c || typeof c !== "object") return null;
    const type = String(c.type || "").toLowerCase();
    if (!["header", "card", "input", "button"].includes(type)) return null;
    // Keep only the fields our renderer/codegen expects.
    return {
      type,
      title: typeof c.title === "string" ? c.title.slice(0, 80) : undefined,
      content: typeof c.content === "string" ? c.content.slice(0, 300) : undefined,
      placeholder: typeof c.placeholder === "string" ? c.placeholder.slice(0, 80) : undefined,
      text: typeof c.text === "string" ? c.text.slice(0, 80) : undefined
    };
  }

  function normalizeScreen(s) {
    const name = String(s?.name || "").trim();
    if (!allowedScreenNames.has(name)) return null;
    if (name === "Cart" && !wantsCart) return null;

    const comps = Array.isArray(s?.components) ? s.components : [];
    const normalized = comps.map(normalizeComponent).filter(Boolean);
    if (!normalized.length) return null;
    return { name, components: normalized };
  }

  const normalizedScreens = screens.map(normalizeScreen).filter(Boolean);
  const required = ["Home", "Login", "Signup", "Profile", "Product", "Settings"];
  // Ensure required screens exist.
  for (const r of required) {
    if (!normalizedScreens.some((s) => s.name === r)) {
      normalizedScreens.push({ name: r, components: [{ type: "header", title: `${r}` }] });
    }
  }

  return { appName, theme, screens: normalizedScreens };
}

function buildMock(prompt) {
  const siteName = "AI Generated Website";
  const layouts = ["grid", "split", "cards", "modern"];
  const layout = layouts[[...prompt].reduce((n, c) => n + c.charCodeAt(0), 0) % 4];
  return {
    siteName,
    layout,
    theme: mergeWebsiteTheme({}, prompt),
    sections: [
      {
        type: "hero",
        content: {
          headline: siteName,
          subtext: prompt.slice(0, 160),
          cta: "Get started"
        }
      },
      {
        type: "about",
        content: {
          title: "About",
          description: "A modern website generated from your prompt, ready to customize and publish."
        }
      },
      {
        type: "services",
        content: {
          title: "What we offer",
          items: [
            { title: "Service 1", description: "A clear, outcome-focused offering tailored to your needs." },
            { title: "Service 2", description: "A premium experience with attention to detail and quality." },
            { title: "Service 3", description: "Fast turnaround, reliable delivery, and friendly support." }
          ]
        }
      },
      {
        type: "testimonials",
        content: {
          title: "Loved by customers",
          items: [
            { name: "Customer", quote: "High quality and exactly what I needed.", rating: 5 },
            { name: "Customer", quote: "Great experience from start to finish.", rating: 5 }
          ]
        }
      },
      {
        type: "faq",
        content: {
          title: "FAQ",
          items: [
            { question: "How does this work?", answer: "You provide a prompt, we generate a full website structure you can edit." },
            { question: "Can I edit sections?", answer: "Yes — you can edit, add, delete, and regenerate sections anytime." }
          ]
        }
      },
      {
        type: "contact",
        content: {
          title: "Contact",
          description: "Reach out — we’ll respond quickly.",
          addressLine: "Your city",
          phone: "+91 90000 00000",
          email: "hello@example.com",
          hours: ["Mon–Fri: 9am–6pm", "Sat: 10am–4pm", "Sun: Closed"]
        }
      }
    ]
  };
}

// OpenAI is used via `openai` package (see generateFromPrompt)

export async function generateFromPrompt(req, res) {
  try {
    const body = typeof req.body === "string" ? { prompt: req.body } : req.body;
    const input = inputSchema.parse(body);
    const type = input.type || "website";
    const businessType = input.businessType || "";
    const features = input.features || "";
    const prompt = input.prompt || (businessType ? `${businessType}. Features: ${features || "none"}` : "");

    const usage = await getUsageForUser(req.user.id);
    if (usage.pointsLeft <= 0) {
      return res.status(403).json({
        message: "Monthly limit reached. You've used all your points. Resets next month.",
        pointsUsed: usage.pointsUsed,
        pointsLimit: usage.pointsLimit
      });
    }

    const openaiKey = process.env.OPENAI_API_KEY;
    const openaiModel = process.env.OPENAI_MODEL || "gpt-4o-mini";

    let raw = null;
    let usedProvider = "none";
    let usedMock = false;

    if (openaiKey) {
      try {
        const client = new OpenAI({ apiKey: openaiKey });

        const messages =
          type === "mobile"
            ? [
                { role: "system", content: buildMobileSystemPrompt() },
                { role: "user", content: buildMobileUserPrompt({ businessType, features, prompt }) }
              ]
            : [
                { role: "system", content: buildSystemPrompt() },
                { role: "user", content: buildUserPrompt(prompt) }
              ];

        const resp = await client.chat.completions.create({
          model: openaiModel,
          temperature: 0.9,
          messages,
          response_format: { type: "json_object" }
        });
        raw = resp?.choices?.[0]?.message?.content || null;
        usedProvider = "openai";
      } catch (e) {
        console.error("[generateFromPrompt] OpenAI failed, will use mock fallback:", e?.message || e);
      }
    }

    if (!raw) usedMock = true;
    if (!raw) raw = JSON.stringify(type === "mobile" ? { appName: "Mobile App", theme: mergeWebsiteTheme({}, prompt), screens: [] } : buildMock(prompt));

    let json;
    try {
      json = JSON.parse(raw || "{}");
    } catch {
      json = type === "mobile" ? { appName: "Mobile App", theme: mergeWebsiteTheme({}, prompt), screens: [] } : buildMock(prompt);
    }

    await consumePoint(req.user.id);

    if (type === "mobile") {
      const normalizedApp = normalizeAppSpec(json, { businessType, features, prompt });
      const mergedTheme = mergeWebsiteTheme(normalizedApp.theme, prompt);

      const website = await Website.create({
        userId: req.user.id,
        type: "mobile",
        siteName: String(normalizedApp.appName).slice(0, 140),
        layout: "modern",
        theme: mergedTheme,
        sections: [],
        mobileSpec: normalizedApp,
        prompt
      });

      return res.status(201).json({ website, mockFallback: usedMock, provider: usedProvider });
    }

    // Website path
    let websiteJson = json;
    if (!websiteJson?.siteName || !Array.isArray(websiteJson?.sections)) {
      websiteJson = buildMock(prompt);
    }

    websiteJson.theme = mergeWebsiteTheme(websiteJson.theme, prompt);
    websiteJson.layout = normalizeLayout(websiteJson.layout);
    websiteJson.sections = normalizeSections(websiteJson.sections);

    if (websiteJson.sections.length < 4) {
      const m = buildMock(prompt);
      websiteJson.siteName = m.siteName;
      websiteJson.layout = normalizeLayout(m.layout);
      websiteJson.sections = normalizeSections(m.sections);
    }

    const website = await Website.create({
      userId: req.user.id,
      siteName: String(websiteJson.siteName).slice(0, 140),
      layout: websiteJson.layout,
      theme: websiteJson.theme,
      sections: websiteJson.sections,
      prompt
    });

    return res.status(201).json({ website, mockFallback: usedMock, provider: usedProvider });
  } catch (err) {
    if (err?.name === "ZodError") return res.status(400).json({ message: "Invalid input", issues: err.issues });
    console.error("[generateFromPrompt]", err?.message || err);
    return res.status(500).json({
      message: "Prompt generation failed",
      detail: process.env.NODE_ENV === "production" ? undefined : String(err?.message || err)
    });
  }
}

