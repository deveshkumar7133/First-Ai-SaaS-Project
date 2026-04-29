/**
 * Applies AI "theme" from the website JSON to preview sections (not fixed Tailwind slate).
 */

function withFallback(v, fallback) {
  return typeof v === "string" && v.trim() ? v.trim() : fallback;
}

export function themeVars(theme) {
  const primary = withFallback(theme?.primaryColor, "#6366f1");
  const secondary = withFallback(theme?.secondaryColor, primary);
  const background = withFallback(theme?.backgroundColor, "#0f172a");
  const surface = withFallback(theme?.surfaceColor, "rgba(15, 23, 42, 0.5)");
  const text = withFallback(theme?.textColor, "#f8fafc");
  const muted = withFallback(theme?.mutedTextColor, "rgba(248, 250, 252, 0.78)");
  const border = withFallback(theme?.borderColor, `${primary}55`);
  const accent = withFallback(theme?.accentColor, primary);
  const radius = Number.isFinite(Number(theme?.radius)) ? Number(theme.radius) : 18;
  const shadow = withFallback(theme?.shadow, "0 20px 60px rgba(0,0,0,.35)");

  return {
    "--site-bg": background,
    "--site-surface": surface,
    "--site-text": text,
    "--site-muted": muted,
    "--site-border": border,
    "--site-primary": primary,
    "--site-secondary": secondary,
    "--site-accent": accent,
    "--site-radius": `${Math.max(10, Math.min(26, radius))}px`,
    "--site-shadow": shadow
  };
}

export function previewCanvasStyle(theme) {
  if (!theme) return { background: "#0f172a" };
  return {
    background: theme.backgroundColor || "#0f172a",
    fontFamily: theme.font || undefined
  };
}

export function sectionSurfaceStyle(theme) {
  const primary = theme?.primaryColor || "#6366f1";
  return {
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: theme?.borderColor ?? `${primary}55`,
    backgroundColor: theme?.surfaceColor ?? "rgba(15, 23, 42, 0.5)",
    color: theme?.textColor ?? "#f8fafc",
    borderRadius: `var(--site-radius)`,
    boxShadow: `var(--site-shadow)`
  };
}
