"use client";

import { sectionSurfaceStyle } from "../../../lib/siteTheme";
import { Button } from "../../Button";

export function HeroSection({ content, theme, editable, onChange, onDelete }) {
  const primary = theme?.primaryColor || "#6366f1";
  const secondary = theme?.secondaryColor || theme?.accentColor || primary;
  const variant = String(content?.variant || "").toLowerCase();

  const isSplit = variant.includes("split");
  const isPoster = variant.includes("poster") || variant.includes("bold");
  const heroBg =
    variant.includes("gradient") || variant.includes("poster")
      ? `radial-gradient(circle at 20% 15%, ${primary}33, transparent 55%), radial-gradient(circle at 80% 70%, ${secondary}22, transparent 60%)`
      : undefined;

  return (
    <section className="p-8" style={{ ...sectionSurfaceStyle(theme), backgroundImage: heroBg }}>
      <div className="flex items-start justify-between gap-3">
        <div className="text-xs" style={{ opacity: 0.65 }}>
          Hero
        </div>
        {editable ? (
          <Button variant="secondary" type="button" onClick={onDelete}>
            Delete
          </Button>
        ) : null}
      </div>

      {editable ? (
        <div className="mt-4 space-y-3">
          <input
            className="w-full rounded-xl border border-slate-800/70 bg-slate-950/40 px-3 py-2 text-sm text-slate-100"
            value={content?.headline || ""}
            onChange={(e) => onChange?.({ ...content, headline: e.target.value })}
            placeholder="Headline"
          />
          <textarea
            className="w-full rounded-xl border border-slate-800/70 bg-slate-950/40 px-3 py-2 text-sm text-slate-100"
            rows={3}
            value={content?.subtext || ""}
            onChange={(e) => onChange?.({ ...content, subtext: e.target.value })}
            placeholder="Subtext"
          />
          <input
            className="w-full rounded-xl border border-slate-800/70 bg-slate-950/40 px-3 py-2 text-sm text-slate-100"
            value={content?.cta || ""}
            onChange={(e) => onChange?.({ ...content, cta: e.target.value })}
            placeholder="CTA"
          />
        </div>
      ) : (
        <>
          <div className={isSplit ? "mt-3 grid gap-6 md:grid-cols-2 md:items-center" : "mt-3"}>
            <div>
              <h1
                className={isPoster ? "text-5xl font-semibold tracking-tight md:text-6xl" : "text-4xl font-semibold tracking-tight"}
                style={{ color: "var(--site-text)" }}
              >
                {content?.headline}
              </h1>
              <p className="mt-4 max-w-2xl text-lg" style={{ color: "var(--site-muted)" }}>
                {content?.subtext}
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <a
                  href="#contact"
                  className="inline-flex items-center justify-center px-4 py-2 text-sm font-semibold"
                  style={{
                    borderRadius: "var(--site-radius)",
                    background: "var(--site-primary)",
                    color: "#0b1020"
                  }}
                >
                  {content?.cta || "Contact"}
                </a>
                <a
                  href="#services"
                  className="inline-flex items-center justify-center border px-4 py-2 text-sm font-semibold"
                  style={{
                    borderRadius: "var(--site-radius)",
                    borderColor: "var(--site-border)",
                    background: "color-mix(in srgb, var(--site-surface) 70%, transparent)",
                    color: "var(--site-text)"
                  }}
                >
                  Explore
                </a>
              </div>
            </div>
            {isSplit ? (
              <div
                className="hidden md:block"
                style={{
                  borderRadius: "var(--site-radius)",
                  border: "1px solid var(--site-border)",
                  background:
                    "linear-gradient(135deg, color-mix(in srgb, var(--site-primary) 25%, transparent), color-mix(in srgb, var(--site-accent) 18%, transparent))",
                  height: 220
                }}
              />
            ) : null}
          </div>
        </>
      )}
    </section>
  );
}

