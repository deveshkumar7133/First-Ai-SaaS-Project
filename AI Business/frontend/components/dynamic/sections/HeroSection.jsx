"use client";

import { SectionShell } from "./SectionShell";

export function HeroSection({ content, theme, editable, onChange, onDelete }) {
  const primary = theme?.primaryColor || "#6366f1";
  const secondary = theme?.secondaryColor || theme?.accentColor || primary;
  const variant = String(content?.variant || "").toLowerCase();

  const isSplit     = variant.includes("split");
  const isPoster    = variant.includes("poster") || variant.includes("fullscreen");
  const isStacked   = variant.includes("stacked") || variant.includes("layered");
  const hasGradient = variant.includes("gradient") || isPoster || isStacked;

  const bgImage = hasGradient
    ? `radial-gradient(circle at 18% 12%, ${primary}40, transparent 52%),
       radial-gradient(circle at 82% 75%, ${secondary}28, transparent 58%)`
    : undefined;

  return (
    <SectionShell id="hero" theme={theme} editable={editable} onDelete={onDelete} style={{ backgroundImage: bgImage }}>
      {editable ? (
        <div className="space-y-3">
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
            placeholder="CTA button label"
          />
        </div>
      ) : (
        <div className={isSplit ? "grid gap-8 md:grid-cols-2 md:items-center" : isPoster ? "py-8 text-center" : ""}>
          <div>
            <h1
              className={
                isPoster
                  ? "text-5xl font-bold tracking-tight md:text-7xl"
                  : isStacked
                  ? "text-4xl font-semibold tracking-tight md:text-5xl"
                  : "text-4xl font-semibold tracking-tight"
              }
              style={{ color: "var(--site-text)" }}
            >
              {content?.headline || content?.title}
            </h1>
            <p
              className={isPoster ? "mx-auto mt-5 max-w-2xl text-lg" : "mt-4 max-w-2xl text-lg"}
              style={{ color: "var(--site-muted)" }}
            >
              {content?.subtext || content?.subtitle}
            </p>
            <div className={isPoster ? "mt-7 flex justify-center gap-3" : "mt-6 flex flex-wrap gap-3"}>
              <a
                href="#contact"
                className="inline-flex items-center justify-center px-5 py-2.5 text-sm font-semibold"
                style={{ borderRadius: "var(--site-radius)", background: "var(--site-primary)", color: "#0b1020" }}
              >
                {content?.cta || "Get started"}
              </a>
              <a
                href="#services"
                className="inline-flex items-center justify-center border px-5 py-2.5 text-sm font-semibold"
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
          {isSplit && (
            <div
              className="hidden md:block"
              style={{
                borderRadius: "var(--site-radius)",
                border: "1px solid var(--site-border)",
                background: `linear-gradient(135deg,
                  color-mix(in srgb, var(--site-primary) 22%, transparent),
                  color-mix(in srgb, var(--site-accent) 16%, transparent))`,
                minHeight: 240
              }}
            />
          )}
        </div>
      )}
    </SectionShell>
  );
}
