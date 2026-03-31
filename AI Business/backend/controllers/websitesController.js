import { z } from "zod";
import { Website } from "../models/Website.js";
import archiver from "archiver";
import { generateFromPrompt } from "./generatePromptController.js";

const createSchema = z.object({
  siteName: z.string().min(2).max(140),
  prompt: z.string().min(10).max(2000),
  theme: z
    .object({
      primaryColor: z.string().min(3).max(32).optional(),
      font: z.string().min(2).max(80).optional()
    })
    .optional(),
  sections: z
    .array(
      z.object({
        type: z.enum(["hero", "about", "services", "gallery", "testimonials", "faq", "contact", "cta"]),
        content: z.any()
      })
    )
    .min(4)
});

export async function createWebsite(req, res) {
  try {
    const { siteName, prompt, theme, sections } = createSchema.parse(req.body);
    const website = await Website.create({
      userId: req.user.id,
      siteName,
      prompt,
      theme: theme || undefined,
      sections
    });
    return res.status(201).json({ website });
  } catch (err) {
    if (err?.name === "ZodError") return res.status(400).json({ message: "Invalid input", issues: err.issues });
    return res.status(500).json({ message: "Create website failed" });
  }
}

const updateSchema = z.object({
  type: z.enum(["website", "mobile"]).optional(),
  siteName: z.string().min(2).max(140).optional(),
  layout: z.enum(["grid", "split", "cards", "modern"]).optional(),
  theme: z.record(z.any()).optional(),
  sections: z
    .array(
      z.object({
        type: z.enum(["hero", "about", "services", "gallery", "testimonials", "faq", "contact", "cta"]),
        content: z.any()
      })
    )
    .optional(),
  mobileSpec: z.any().optional()
});

export async function updateWebsite(req, res) {
  try {
    const patch = updateSchema.parse(req.body);
    const website = await Website.findOneAndUpdate({ _id: req.params.id, userId: req.user.id }, patch, { new: true });
    if (!website) return res.status(404).json({ message: "Website not found" });
    return res.json({ website });
  } catch (err) {
    if (err?.name === "ZodError") return res.status(400).json({ message: "Invalid input", issues: err.issues });
    return res.status(400).json({ message: "Invalid website id" });
  }
}

export async function listWebsites(req, res) {
  try {
    const websites = await Website.find({ userId: req.user.id }).sort({ createdAt: -1 });
    return res.json({ websites });
  } catch {
    return res.status(500).json({ message: "List websites failed" });
  }
}

export async function getWebsite(req, res) {
  try {
    const website = await Website.findOne({ _id: req.params.id, userId: req.user.id });
    if (!website) return res.status(404).json({ message: "Website not found" });
    return res.json({ website });
  } catch {
    return res.status(400).json({ message: "Invalid website id" });
  }
}

export async function regenerateWebsite(req, res) {
  try {
    const existing = await Website.findOne({ _id: req.params.id, userId: req.user.id }).lean();
    if (!existing) return res.status(404).json({ message: "Website not found" });

    // Reuse the exact generator pipeline.
    let captured = null;
    const resMock = {
      status: (code) => ({
        json: (payload) => {
          captured = { code, payload };
        }
      })
    };

    await generateFromPrompt(
      {
        user: req.user,
        body: { type: existing.type || "website", prompt: existing.prompt }
      },
      resMock
    );

    if (!captured) return res.status(500).json({ message: "Regenerate failed" });
    return res.status(captured.code).json(captured.payload);
  } catch (err) {
    return res.status(400).json({ message: "Regenerate failed" });
  }
}

function escapeHtml(str) {
  return String(str || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function renderStaticHtml(website) {
  const name = escapeHtml(website.siteName);
  const sections = Array.isArray(website.sections) ? website.sections : [];
  const theme = website.theme || {};
  const primary = escapeHtml(theme.primaryColor || "#6366f1");
  const secondary = escapeHtml(theme.secondaryColor || theme.accentColor || primary);
  const bg = escapeHtml(theme.backgroundColor || "#020617");
  const textColor = escapeHtml(theme.textColor || "#e5e7eb");
  const muted = escapeHtml(theme.mutedTextColor || "rgba(226,232,240,.75)");
  const surface = escapeHtml(theme.surfaceColor || "rgba(15,23,42,.55)");
  const borderColor = escapeHtml(theme.borderColor || `${theme.primaryColor || "#6366f1"}55`);
  const font = escapeHtml(theme.font || "ui-sans-serif");

  const hero = sections.find((s) => s.type === "hero")?.content || {};
  const about = sections.find((s) => s.type === "about")?.content || {};
  const services = sections.find((s) => s.type === "services")?.content || {};
  const gallery = sections.find((s) => s.type === "gallery")?.content || {};
  const testimonials = sections.find((s) => s.type === "testimonials")?.content || {};
  const faq = sections.find((s) => s.type === "faq")?.content || {};
  const contact = sections.find((s) => s.type === "contact")?.content || {};

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <title>${name}</title>
    <style>
      :root{color-scheme:dark}
      body{margin:0;font-family:${font},system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial;color:${textColor};background:${bg}}
      a{color:inherit}
      .container{max-width:1040px;margin:0 auto;padding:0 20px}
      .nav{position:sticky;top:0;background:rgba(2,6,23,.82);backdrop-filter:blur(10px);border-bottom:1px solid rgba(148,163,184,.18);z-index:10}
      .navInner{display:flex;align-items:center;justify-content:space-between;padding:14px 0}
      .brand{font-weight:700;letter-spacing:-.02em}
      .pill{display:inline-flex;align-items:center;border:1px solid ${borderColor};border-radius:999px;padding:4px 10px;color:${muted};font-size:12px}
      .hero{padding:72px 0;border-bottom:1px solid ${borderColor};background:radial-gradient(circle at 30% 20%, ${primary}33, transparent 55%),radial-gradient(circle at 70% 60%, ${secondary}22, transparent 50%)}
      h1{margin:14px 0 0;font-size:44px;line-height:1.05;letter-spacing:-.03em}
      .sub{margin:14px 0 0;color:${muted};font-size:18px;max-width:60ch}
      .btnRow{display:flex;gap:10px;flex-wrap:wrap;margin-top:22px}
      .btn{display:inline-flex;align-items:center;justify-content:center;border-radius:14px;padding:10px 14px;font-weight:700;font-size:14px;border:1px solid ${borderColor};background:${surface}}
      .btnPrimary{background:${primary};color:#0b1020;border-color:transparent}
      .grid3{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:14px;margin-top:28px}
      .card{border-radius:18px;background:${surface};border:1px solid ${borderColor};padding:16px}
      .cardTitle{font-weight:700}
      .cardDesc{margin-top:8px;color:${muted};font-size:14px;line-height:1.5}
      section{padding:52px 0}
      h2{margin:0;font-size:24px;letter-spacing:-.02em}
      .muted{color:${muted};margin-top:8px}
      .grid2{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px;margin-top:16px}
      .list{display:flex;flex-direction:column;gap:8px;margin-top:12px;color:rgba(226,232,240,.8)}
      .footer{border-top:1px solid rgba(148,163,184,.14);padding:26px 0;color:rgba(226,232,240,.65);font-size:13px}
      @media (max-width:900px){.grid3{grid-template-columns:1fr}.grid2{grid-template-columns:1fr}h1{font-size:34px}}
    </style>
  </head>
  <body>
    <div class="nav">
      <div class="container navInner">
        <div class="brand">${name}</div>
        <div class="pill">Generated from prompt</div>
      </div>
    </div>

    <div class="hero">
      <div class="container">
        <div class="pill">AI website</div>
        <h1>${escapeHtml(hero?.headline || `Welcome to ${website.siteName}`)}</h1>
        <p class="sub">${escapeHtml(hero?.subtext || "")}</p>
        <div class="btnRow">
          <a class="btn btnPrimary" href="#contact">${escapeHtml(hero?.cta || "Contact")}</a>
          <a class="btn" href="#services">Explore</a>
        </div>
      </div>
    </div>

    <section id="about">
      <div class="container">
        <h2>${escapeHtml(about?.title || `About ${website.siteName}`)}</h2>
        <div class="muted">A quick introduction and what makes us different.</div>
        <div class="list">
          <div>${escapeHtml(about?.description || "")}</div>
        </div>
      </div>
    </section>

    <section id="services">
      <div class="container">
        <h2>${escapeHtml(services?.title || "Services")}</h2>
        <div class="muted">Clear, simple packages designed for quick decisions.</div>
        <div class="grid2">
          ${(Array.isArray(services?.items) ? services.items : [])
            .slice(0, 12)
            .map(
              (s) =>
                `<div class="card"><div class="cardTitle">${escapeHtml(s?.title || "")}</div><div class="cardDesc">${escapeHtml(
                  s?.description || ""
                )}</div></div>`
            )
            .join("")}
        </div>
      </div>
    </section>

    ${
      Array.isArray(gallery?.images) && gallery.images.length
        ? `<section id="gallery"><div class="container"><h2>${escapeHtml(gallery?.title || "Gallery")}</h2><div class="muted">A quick look.</div><div class="grid3">${
            gallery.images
              .slice(0, 6)
              .map((img) => `<div class="card"><div class="cardTitle">${escapeHtml(img?.alt || "Image")}</div><div class="cardDesc">${escapeHtml(img?.src || "")}</div></div>`)
              .join("")
          }</div></div></section>`
        : ""
    }

    ${
      Array.isArray(testimonials?.items) && testimonials.items.length
        ? `<section id="testimonials"><div class="container"><h2>${escapeHtml(
            testimonials?.title || "Testimonials"
          )}</h2><div class="grid2">${
            testimonials.items
              .slice(0, 6)
              .map(
                (t) =>
                  `<div class="card"><div class="cardTitle">${escapeHtml(t?.name || "Customer")}</div><div class="cardDesc">${escapeHtml(
                    t?.quote || ""
                  )}</div></div>`
              )
              .join("")
          }</div></div></section>`
        : ""
    }

    ${
      Array.isArray(faq?.items) && faq.items.length
        ? `<section id="faq"><div class="container"><h2>${escapeHtml(faq?.title || "FAQ")}</h2><div class="list">${
            faq.items
              .slice(0, 10)
              .map(
                (f) =>
                  `<div class="card"><div class="cardTitle">${escapeHtml(f?.question || "")}</div><div class="cardDesc">${escapeHtml(
                    f?.answer || ""
                  )}</div></div>`
              )
              .join("")
          }</div></div></section>`
        : ""
    }

    <section id="contact">
      <div class="container">
        <h2>${escapeHtml(contact?.title || "Contact")}</h2>
        <div class="muted">${escapeHtml(contact?.description || "")}</div>
        <div class="grid2">
          <div class="card">
            <div class="cardTitle">Details</div>
            <div class="cardDesc" style="margin-top:10px">
              <div>${escapeHtml(contact?.addressLine || "")}</div>
              <div style="margin-top:6px">${escapeHtml(contact?.phone || "")}</div>
              <div style="margin-top:6px">${escapeHtml(contact?.email || "")}</div>
            </div>
          </div>
          <div class="card">
            <div class="cardTitle">Hours</div>
            <div class="cardDesc" style="margin-top:10px">
              ${(Array.isArray(contact?.hours) ? contact.hours : []).slice(0, 10).map((h) => `<div>${escapeHtml(h)}</div>`).join("")}
            </div>
          </div>
        </div>
      </div>
    </section>

    <div class="footer">
      <div class="container">Generated with InstantSite AI • Exported project</div>
    </div>
  </body>
</html>`;
}

function renderMobileReactNativeCode(website) {
  const app = website.mobileSpec || {};
  const theme = website.theme || {};
  const appJson = JSON.stringify(app, null, 2);
  const themeJson = JSON.stringify(theme, null, 2);

  // Keep this file dependency-free: it is intended for Expo/React Native projects.
  return `import React, { useMemo, useState } from "react";
import { SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

const app = ${appJson};
const theme = ${themeJson};

const radius = typeof theme.radius === "number" ? theme.radius : 18;
const primary = theme.primaryColor || "#6366f1";
const bg = theme.backgroundColor || "#0f172a";
const surface = theme.surfaceColor || "rgba(15, 23, 42, 0.5)";
const text = theme.textColor || "#f8fafc";
const muted = theme.mutedTextColor || "rgba(248, 250, 252, 0.78)";
const border = theme.borderColor || \`\${primary}55\`;

function Component({ c }: { c: any }) {
  const type = String(c?.type || "").toLowerCase();

  if (type === "header") {
    return (
      <View style={{ marginBottom: 12 }}>
        <Text style={{ fontSize: 18, fontWeight: "800", color: text }}>{c?.title || "Header"}</Text>
      </View>
    );
  }

  if (type === "card") {
    return (
      <View
        style={{
          borderWidth: 1,
          borderColor: border,
          backgroundColor: surface,
          borderRadius: radius,
          padding: 14,
          marginBottom: 12
        }}
      >
        <Text style={{ color: text, fontSize: 14, fontWeight: "700" }}>{c?.title || "Card"}</Text>
        {c?.content ? <Text style={{ color: muted, marginTop: 6, fontSize: 13, lineHeight: 18 }}>{c.content}</Text> : null}
      </View>
    );
  }

  if (type === "input") {
    return (
      <View style={{ marginBottom: 12 }}>
        <TextInput
          placeholder={c?.placeholder || "Input"}
          placeholderTextColor={muted}
          style={{
            width: "100%",
            borderRadius: radius,
            borderWidth: 1,
            borderColor: border,
            backgroundColor: surface,
            paddingVertical: 12,
            paddingHorizontal: 12,
            color: text
          }}
        />
      </View>
    );
  }

  if (type === "button") {
    return (
      <TouchableOpacity
        style={{
          width: "100%",
          borderRadius: radius,
          paddingVertical: 12,
          paddingHorizontal: 14,
          backgroundColor: primary,
          alignItems: "center"
        }}
      >
        <Text style={{ color: "#0b1020", fontWeight: "800" }}>{c?.text || "Button"}</Text>
      </TouchableOpacity>
    );
  }

  return null;
}

export default function App() {
  const screens = Array.isArray(app?.screens) ? app.screens : [];
  const initial = screens?.[0]?.name || "Home";
  const [active, setActive] = useState(initial);

  const activeScreen = useMemo(() => screens.find((s: any) => s?.name === active) || screens[0], [screens, active]);
  const components = Array.isArray(activeScreen?.components) ? activeScreen.components : [];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.brand}>{app?.appName || "Mobile App"}</Text>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabs}>
          {screens.map((s: any) => (
            <TouchableOpacity
              key={s?.name}
              onPress={() => setActive(s?.name)}
              style={{
                paddingVertical: 8,
                paddingHorizontal: 12,
                borderRadius: 999,
                marginRight: 10,
                backgroundColor: s?.name === active ? primary : "transparent",
                borderWidth: s?.name === active ? 0 : 1,
                borderColor: s?.name === active ? "transparent" : border
              }}
            >
              <Text style={{ color: s?.name === active ? "#0b1020" : muted, fontWeight: "700", fontSize: 12 }}>
                {s?.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={{ marginTop: 14 }}>
          {components.map((c: any, idx: number) => (
            <Component key={idx} c={c} />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: bg },
  scroll: { padding: 16, paddingBottom: 40 },
  brand: { fontSize: 16, fontWeight: "900", color: text },
  tabs: { marginTop: 12, paddingBottom: 8 }
});
`;
}

export async function exportWebsite(req, res) {
  try {
    const website = await Website.findOne({ _id: req.params.id, userId: req.user.id }).lean();
    if (!website) return res.status(404).json({ message: "Website not found" });

    const format = String(req.query.format || "zip").toLowerCase();
    if (format === "html") {
      if (website.type === "mobile") {
        res.setHeader("Content-Type", "text/plain; charset=utf-8");
        return res.send(renderMobileReactNativeCode(website));
      }
      res.setHeader("Content-Type", "text/html; charset=utf-8");
      return res.send(renderStaticHtml(website));
    }
    if (format === "json") {
      return res.json({ website });
    }

    const zipName = `${String(website.siteName || "website")
      .toLowerCase()
      .replaceAll(/[^a-z0-9]+/g, "-")
      .replaceAll(/(^-|-$)/g, "") || "website"}-export.zip`;

    res.setHeader("Content-Type", "application/zip");
    res.setHeader("Content-Disposition", `attachment; filename="${zipName}"`);

    const archive = archiver("zip", { zlib: { level: 9 } });
    archive.on("error", (err) => {
      // eslint-disable-next-line no-console
      console.error("[exportWebsite] archive error:", err);
      if (!res.headersSent) res.status(500).json({ message: "Export failed" });
    });

    archive.pipe(res);

    if (website.type === "mobile") {
      const code = renderMobileReactNativeCode(website);
      archive.append(code, { name: "App.tsx" });
      archive.append(JSON.stringify({ appName: website.siteName, prompt: website.prompt, type: website.type }, null, 2), { name: "meta.json" });
      archive.append(
        `# Exported from InstantSite AI\n\n- Project: ${website.siteName}\n- Type: ${website.type}\n- Prompt: ${website.prompt}\n\nOpen Expo with \`App.tsx\`.\n`,
        { name: "README.md" }
      );
    } else {
      const html = renderStaticHtml(website);
      archive.append(html, { name: "index.html" });
    }

    const contentJson = JSON.stringify(website, null, 2);
    archive.append(contentJson, { name: "website.json" });

    archive.append(
      `# Exported from InstantSite AI\n\n- Site: ${website.siteName}\n- Prompt: ${website.prompt}\n\nOpen \`index.html\` in your browser.\n`,
      { name: "README.md" }
    );

    await archive.finalize();
  } catch (err) {
    return res.status(400).json({ message: "Invalid website id" });
  }
}

