const ALLOWED = new Set(["hero", "about", "services", "gallery", "testimonials", "faq", "contact", "cta"]);
const LAYOUTS = ["grid", "split", "cards", "modern"];

export function normalizeLayout(v) {
  const s = String(v ?? "")
    .toLowerCase()
    .trim()
    .split(/[\/|,\s]+/)
    .find((x) => x && LAYOUTS.includes(x));
  if (s && LAYOUTS.includes(s)) return s;
  const raw = String(v ?? "").toLowerCase();
  if (raw.includes("grid")) return "grid";
  if (raw.includes("split")) return "split";
  if (raw.includes("card")) return "cards";
  if (raw.includes("modern")) return "modern";
  return "modern";
}

function mapRating(n) {
  const x = Number(n);
  if (Number.isFinite(x) && x >= 1 && x <= 5) return x;
  return 5;
}

/**
 * Maps alternate / flat section shapes to { type, content }.
 */
export function normalizeSection(raw) {
  if (!raw || typeof raw !== "object") return null;
  let type = String(raw.type || "").toLowerCase();
  if (type === "pricing") type = "services";
  if (!ALLOWED.has(type)) return null;

  const variantFromRaw = typeof raw.variant === "string" ? raw.variant.trim() : "";
  const rawStr = JSON.stringify(raw);
  const hash = rawStr.split("").reduce((n, c) => n + c.charCodeAt(0), 0);
  const pick = (list) => list[hash % list.length];

  if (raw.content && typeof raw.content === "object" && !Array.isArray(raw.content)) {
    return { type, content: raw.content };
  }

  if (type === "hero") {
    const variant = variantFromRaw || pick(["centered-gradient", "split-media", "poster", "stacked", "layered"]);
    return {
      type: "hero",
      content: {
        headline: String(raw.headline || raw.title || "Welcome").slice(0, 220),
        subtext: String(raw.subtext || raw.subtitle || "").slice(0, 1200),
        cta: String(raw.cta || "Get started").slice(0, 100),
        variant
      }
    };
  }

  if (type === "about") {
    const variant = variantFromRaw || pick(["split", "story", "timeline", "plain", "mosaic"]);
    return {
      type: "about",
      content: {
        title: String(raw.title || "About").slice(0, 160),
        description: String(raw.description || "").slice(0, 2500),
        variant
      }
    };
  }

  if (type === "services" && Array.isArray(raw.items)) {
    const items = raw.items
      .filter((it) => it && typeof it === "object")
      .map((it) => ({
        title: String(it.title || "").slice(0, 140),
        description: String(it.description || it.desc || "").slice(0, 900)
      }))
      .filter((it) => it.title);
    if (!items.length) return null;
    const variant = variantFromRaw || pick(["icon-grid", "cards", "compact-list", "showcase", "stacked"]);
    return {
      type: "services",
      content: {
        title: String(raw.title || "Services").slice(0, 140),
        items,
        variant
      }
    };
  }

  if (type === "gallery" && Array.isArray(raw.images)) {
    const images = raw.images
      .filter((im) => im && typeof im === "object")
      .map((im) => ({
        src: String(im.src || "image.jpg").slice(0, 200),
        alt: String(im.alt || "").slice(0, 200)
      }));
    if (!images.length) return null;
    const variant = variantFromRaw || pick(["bento", "masonry", "strip", "bento", "masonry"]);
    return {
      type: "gallery",
      content: { title: String(raw.title || "Gallery").slice(0, 140), images, variant }
    };
  }

  if (type === "testimonials" && Array.isArray(raw.items)) {
    const items = raw.items
      .filter((it) => it && typeof it === "object")
      .map((it) => ({
        name: String(it.name || "Customer").slice(0, 80),
        quote: String(it.quote || "").slice(0, 500),
        rating: mapRating(it.rating)
      }))
      .filter((it) => it.quote);
    if (!items.length) return null;
    const variant = variantFromRaw || pick(["cards", "minimal", "marquee", "cards", "minimal"]);
    return {
      type: "testimonials",
      content: { title: String(raw.title || "Testimonials").slice(0, 140), items, variant }
    };
  }

  if (type === "faq" && Array.isArray(raw.items)) {
    const items = raw.items
      .filter((it) => it && typeof it === "object")
      .map((it) => ({
        question: String(it.question || "").slice(0, 200),
        answer: String(it.answer || "").slice(0, 1200)
      }))
      .filter((it) => it.question && it.answer);
    if (!items.length) return null;
    const variant = variantFromRaw || pick(["accordion", "two-column", "compact", "accordion"]);
    return {
      type: "faq",
      content: { title: String(raw.title || "FAQ").slice(0, 140), items, variant }
    };
  }

  if (type === "contact") {
    const hours = Array.isArray(raw.hours) ? raw.hours.map((h) => String(h)) : [];
    const variant = variantFromRaw || pick(["panel", "minimal", "split-block", "panel"]);
    return {
      type: "contact",
      content: {
        title: String(raw.title || "Contact").slice(0, 140),
        description: String(raw.description || "").slice(0, 800),
        addressLine: String(raw.addressLine || "").slice(0, 200),
        phone: String(raw.phone || "").slice(0, 40),
        email: String(raw.email || "").slice(0, 120),
        hours,
        variant
      }
    };
  }

  if (type === "cta") {
    const variant = variantFromRaw || pick(["banner", "card", "gradient", "banner"]);
    return {
      type: "cta",
      content: {
        title: String(raw.title || "").slice(0, 160),
        description: String(raw.description || "").slice(0, 800),
        cta: String(raw.cta || "Get started").slice(0, 100),
        variant
      }
    };
  }

  return null;
}

export function normalizeSections(sections) {
  if (!Array.isArray(sections)) return [];
  const out = sections.map((s) => normalizeSection(s)).filter(Boolean);
  let hi = out.findIndex((s) => s.type === "hero");
  if (hi > 0) {
    const [h] = out.splice(hi, 1);
    out.unshift(h);
  }
  if (hi === -1 && out.length > 0) {
    out.unshift({
      type: "hero",
      content: { headline: "Welcome", subtext: "", cta: "Get started" }
    });
  }
  return out;
}
