/**
 * Ensures each build gets a distinct visual identity from the user prompt.
 * Merges model output with keyword heuristics when colors are missing or generic.
 */
const DEFAULT_PRIMARY = "#6366f1";

function inferFromKeywords(prompt) {
  const p = String(prompt).toLowerCase();
  const sets = [
    {
      test: /luxury|spa|gold|premium|boutique|jewelry|wedding/,
      theme: {
        primaryColor: "#c9a227",
        backgroundColor: "#1c1917",
        surfaceColor: "rgba(41, 37, 36, 0.55)",
        textColor: "#fafaf9",
        font: "Georgia, 'Times New Roman', serif"
      }
    },
    {
      test: /gym|fitness|sport|energy|workout|crossfit/,
      theme: {
        primaryColor: "#ea580c",
        backgroundColor: "#0c0a09",
        surfaceColor: "rgba(67, 20, 7, 0.45)",
        textColor: "#fff7ed",
        font: "'Inter', system-ui, sans-serif"
      }
    },
    {
      test: /medical|clinic|health|doctor|dental|hospital/,
      theme: {
        primaryColor: "#0ea5e9",
        backgroundColor: "#0f172a",
        surfaceColor: "rgba(12, 74, 110, 0.35)",
        textColor: "#f0f9ff",
        font: "'Inter', system-ui, sans-serif"
      }
    },
    {
      test: /restaurant|cafe|food|kitchen|chef|dining/,
      theme: {
        primaryColor: "#dc2626",
        backgroundColor: "#1c1917",
        surfaceColor: "rgba(69, 10, 10, 0.4)",
        textColor: "#fef2f2",
        font: "'Inter', system-ui, sans-serif"
      }
    },
    {
      test: /corporate|law|consulting|finance|legal|accounting/,
      theme: {
        primaryColor: "#1e40af",
        backgroundColor: "#020617",
        surfaceColor: "rgba(15, 23, 42, 0.6)",
        textColor: "#f8fafc",
        font: "'Inter', system-ui, sans-serif"
      }
    },
    {
      test: /green|eco|nature|organic|plant|garden/,
      theme: {
        primaryColor: "#16a34a",
        backgroundColor: "#052e16",
        surfaceColor: "rgba(20, 83, 45, 0.4)",
        textColor: "#f0fdf4",
        font: "'Inter', system-ui, sans-serif"
      }
    },
    {
      test: /tech|saas|startup|software|ai|app/,
      theme: {
        primaryColor: "#8b5cf6",
        backgroundColor: "#0f172a",
        surfaceColor: "rgba(49, 46, 129, 0.35)",
        textColor: "#f5f3ff",
        font: "'Inter', system-ui, sans-serif"
      }
    }
  ];
  for (const { test, theme } of sets) {
    if (test.test(p)) return theme;
  }
  return {
    primaryColor: "#6366f1",
    backgroundColor: "#0f172a",
    surfaceColor: "rgba(15, 23, 42, 0.5)",
    textColor: "#f8fafc",
    font: "'Inter', system-ui, sans-serif"
  };
}

/**
 * @param {Record<string, unknown> | null | undefined} modelTheme
 * @param {string} userPrompt
 */
export function mergeWebsiteTheme(modelTheme, userPrompt) {
  const inferred = inferFromKeywords(userPrompt);
  const t = modelTheme && typeof modelTheme === "object" ? modelTheme : {};

  const primary =
    typeof t.primaryColor === "string" && t.primaryColor.trim() && t.primaryColor !== DEFAULT_PRIMARY
      ? t.primaryColor.trim()
      : inferred.primaryColor;

  const secondary = typeof t.secondaryColor === "string" && t.secondaryColor.trim() ? t.secondaryColor.trim() : primary;
  const accent = typeof t.accentColor === "string" && t.accentColor.trim() ? t.accentColor.trim() : secondary;
  const backgroundColor =
    typeof t.backgroundColor === "string" && t.backgroundColor.trim() ? t.backgroundColor.trim() : inferred.backgroundColor;
  const textColor = typeof t.textColor === "string" && t.textColor.trim() ? t.textColor.trim() : inferred.textColor;
  const mutedTextColor =
    typeof t.mutedTextColor === "string" && t.mutedTextColor.trim() ? t.mutedTextColor.trim() : "rgba(248, 250, 252, 0.78)";
  const surfaceColor =
    typeof t.surfaceColor === "string" && t.surfaceColor.trim() ? t.surfaceColor.trim() : inferred.surfaceColor;
  const borderColor =
    typeof t.borderColor === "string" && t.borderColor.trim() ? t.borderColor.trim() : `${primary}55`;
  const font = typeof t.font === "string" && t.font.trim() ? t.font.trim() : inferred.font;
  const radius = Number.isFinite(Number(t.radius)) ? Number(t.radius) : 18;
  const shadow = typeof t.shadow === "string" && t.shadow.trim() ? t.shadow.trim() : "0 20px 60px rgba(0,0,0,.35)";
  const style = typeof t.style === "string" && t.style.trim() ? t.style.trim() : "modern";

  return {
    style,
    primaryColor: primary,
    secondaryColor: secondary,
    accentColor: accent,
    font,
    backgroundColor,
    textColor,
    mutedTextColor,
    borderColor,
    surfaceColor,
    radius,
    shadow
  };
}
