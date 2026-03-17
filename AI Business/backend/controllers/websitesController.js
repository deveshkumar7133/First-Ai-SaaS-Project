import { z } from "zod";
import { Website } from "../models/Website.js";
import archiver from "archiver";

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
  siteName: z.string().min(2).max(140).optional(),
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
    .min(1)
    .optional()
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
      body{margin:0;font-family:${font},system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial;color:#e5e7eb;background:#020617}
      a{color:inherit}
      .container{max-width:1040px;margin:0 auto;padding:0 20px}
      .nav{position:sticky;top:0;background:rgba(2,6,23,.82);backdrop-filter:blur(10px);border-bottom:1px solid rgba(148,163,184,.18);z-index:10}
      .navInner{display:flex;align-items:center;justify-content:space-between;padding:14px 0}
      .brand{font-weight:700;letter-spacing:-.02em}
      .pill{display:inline-flex;align-items:center;border:1px solid rgba(148,163,184,.18);border-radius:999px;padding:4px 10px;color:rgba(226,232,240,.75);font-size:12px}
      .hero{padding:72px 0;border-bottom:1px solid rgba(148,163,184,.14);background:radial-gradient(circle at 30% 20%, rgba(99,102,241,.18), transparent 55%),radial-gradient(circle at 70% 60%, rgba(56,189,248,.12), transparent 50%)}
      h1{margin:14px 0 0;font-size:44px;line-height:1.05;letter-spacing:-.03em}
      .sub{margin:14px 0 0;color:rgba(226,232,240,.75);font-size:18px;max-width:60ch}
      .btnRow{display:flex;gap:10px;flex-wrap:wrap;margin-top:22px}
      .btn{display:inline-flex;align-items:center;justify-content:center;border-radius:14px;padding:10px 14px;font-weight:700;font-size:14px;border:1px solid rgba(148,163,184,.18);background:rgba(15,23,42,.55)}
      .btnPrimary{background:${primary};color:#0b1020;border-color:transparent}
      .grid3{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:14px;margin-top:28px}
      .card{border-radius:18px;background:rgba(15,23,42,.55);border:1px solid rgba(148,163,184,.18);padding:16px}
      .cardTitle{font-weight:700}
      .cardDesc{margin-top:8px;color:rgba(226,232,240,.75);font-size:14px;line-height:1.5}
      section{padding:52px 0}
      h2{margin:0;font-size:24px;letter-spacing:-.02em}
      .muted{color:rgba(226,232,240,.75);margin-top:8px}
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

export async function exportWebsite(req, res) {
  try {
    const website = await Website.findOne({ _id: req.params.id, userId: req.user.id }).lean();
    if (!website) return res.status(404).json({ message: "Website not found" });

    const format = String(req.query.format || "zip").toLowerCase();
    if (format === "html") {
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

    const html = renderStaticHtml(website);
    archive.append(html, { name: "index.html" });

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

