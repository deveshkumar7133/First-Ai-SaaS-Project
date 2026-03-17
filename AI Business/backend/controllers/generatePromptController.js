import { z } from "zod";
import OpenAI from "openai";
import Groq from "groq-sdk";
import { Website } from "../models/Website.js";
import { getUsageForUser, consumePoint } from "../models/Usage.js";

const inputSchema = z.object({
  prompt: z.string().min(10).max(2000)
});

function buildSystemPrompt() {
  return `Return strict JSON only. No markdown. No backticks. No commentary.`;
}

function buildUserPrompt(prompt) {
  return `You are an expert AI website generator.

Your task is to generate a complete business website structure based ONLY on the user prompt.

User prompt:
"${prompt}"

Core requirements:
- Do NOT use fixed templates.
- Decide which sections are needed based on the business.
- Generate 5–8 sections.
- Use only these section types: hero, about, services, gallery, testimonials, faq, contact, cta
- Tone rules: Restaurant → friendly, Gym → energetic, Corporate → professional
- Content must be high quality, professional, realistic, and specific. No placeholders.

Return ONLY valid JSON matching this schema exactly:
{
  "siteName": "string",
  "theme": {
    "primaryColor": "string (hex like #6366f1)",
    "font": "string (css font-family name)"
  },
  "sections": [
    {
      "type": "hero",
      "content": {
        "headline": "string",
        "subtext": "string",
        "cta": "string"
      }
    }
  ]
}

Section content guidance (keep JSON keys consistent and realistic):
- hero.content: headline, subtext, cta
- about.content: title, description
- services.content: title, items[{title,description}]
- gallery.content: title, images[{src,alt}] (use descriptive src strings, not real URLs)
- testimonials.content: title, items[{name,quote,rating}]
- faq.content: title, items[{question,answer}]
- contact.content: title, description, addressLine, phone, email, hours[string]
- cta.content: title, description, cta

Ensure sections flow logically and avoid repeating the same info.
Return JSON only.`;
}

function buildMock(prompt) {
  const siteName = "AI Generated Website";
  return {
    siteName,
    theme: { primaryColor: "#6366f1", font: "ui-sans-serif" },
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

async function callOpenAI({ apiKey, model, prompt }) {
  const client = new OpenAI({ apiKey });
  const resp = await client.chat.completions.create({
    model,
    temperature: 0.7,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: buildSystemPrompt() },
      { role: "user", content: buildUserPrompt(prompt) }
    ]
  });
  return resp?.choices?.[0]?.message?.content || "{}";
}

async function callGroq({ apiKey, model, prompt }) {
  const client = new Groq({ apiKey });
  const resp = await client.chat.completions.create({
    model,
    temperature: 0.7,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: buildSystemPrompt() },
      { role: "user", content: buildUserPrompt(prompt) }
    ]
  });
  return resp?.choices?.[0]?.message?.content || "{}";
}

export async function generateFromPrompt(req, res) {
  try {
    const { prompt } = inputSchema.parse(req.body);

    const usage = await getUsageForUser(req.user.id);
    if (usage.pointsLeft <= 0) {
      return res.status(403).json({
        message: "Monthly limit reached. You've used all your points. Resets next month.",
        pointsUsed: usage.pointsUsed,
        pointsLimit: usage.pointsLimit
      });
    }

    const openaiKey = process.env.OPENAI_API_KEY;
    const groqKey = process.env.GROQ_API_KEY;

    let raw = null;
    if (openaiKey) {
      raw = await callOpenAI({ apiKey: openaiKey, model: process.env.OPENAI_MODEL || "gpt-4.1-mini", prompt });
    } else if (groqKey) {
      raw = await callGroq({ apiKey: groqKey, model: process.env.GROQ_MODEL || "llama-3.3-70b-versatile", prompt });
    } else {
      const mock = buildMock(prompt);
      await consumePoint(req.user.id);
      const website = await Website.create({
        userId: req.user.id,
        siteName: mock.siteName,
        theme: mock.theme,
        sections: mock.sections,
        prompt
      });
      return res.status(201).json({ website, mockFallback: true });
    }

    let json;
    try {
      json = JSON.parse(raw || "{}");
    } catch {
      json = buildMock(prompt);
    }

    if (!json?.siteName || !Array.isArray(json?.sections) || json.sections.length < 4) {
      json = buildMock(prompt);
    }

    await consumePoint(req.user.id);
    const website = await Website.create({
      userId: req.user.id,
      siteName: String(json.siteName).slice(0, 140),
      theme: json.theme || { primaryColor: "#6366f1", font: "ui-sans-serif" },
      sections: json.sections,
      prompt
    });

    return res.status(201).json({ website, mockFallback: !openaiKey && !groqKey });
  } catch (err) {
    if (err?.name === "ZodError") return res.status(400).json({ message: "Invalid input", issues: err.issues });
    console.error("[generateFromPrompt]", err?.message || err);
    return res.status(500).json({ message: "Prompt generation failed" });
  }
}

