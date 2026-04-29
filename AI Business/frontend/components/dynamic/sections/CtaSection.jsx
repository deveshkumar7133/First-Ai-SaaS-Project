"use client";

import { SectionShell } from "./SectionShell";

export function CtaSection({ content, theme, editable, onChange, onDelete }) {
  const primary = theme?.primaryColor || "#6366f1";
  const accent  = theme?.accentColor  || primary;
  const variant = String(content?.variant || "").toLowerCase();
  const isBanner   = variant.includes("banner");
  const isGradient = variant.includes("gradient");
  const isSplit    = variant.includes("split");

  const innerBg = isBanner || isGradient
    ? `linear-gradient(135deg, ${primary}28, ${accent}18)`
    : "color-mix(in srgb, var(--site-surface) 86%, transparent)";

  return (
    <SectionShell id="cta" theme={theme} editable={editable} onDelete={onDelete}>
      {editable ? (
        <div className="space-y-3">
          <input
            className="w-full rounded-xl border border-slate-800/70 bg-slate-950/40 px-3 py-2 text-sm text-slate-100"
            value={content?.title || ""}
            onChange={(e) => onChange?.({ ...content, title: e.target.value })}
            placeholder="CTA title"
          />
          <textarea
            className="w-full rounded-xl border border-slate-800/70 bg-slate-950/40 px-3 py-2 text-sm text-slate-100"
            rows={3}
            value={content?.description || ""}
            onChange={(e) => onChange?.({ ...content, description: e.target.value })}
            placeholder="Description"
          />
          <input
            className="w-full rounded-xl border border-slate-800/70 bg-slate-950/40 px-3 py-2 text-sm text-slate-100"
            value={content?.cta || ""}
            onChange={(e) => onChange?.({ ...content, cta: e.target.value })}
            placeholder="Button label"
          />
        </div>
      ) : (
        <div
          className={isBanner || isGradient ? "px-6 py-8 md:px-10 md:py-10" : "p-6"}
          style={{ borderRadius: "var(--site-radius)", border: "1px solid var(--site-border)", background: innerBg }}
        >
          <div className={isSplit ? "flex flex-col gap-6 md:flex-row md:items-center md:justify-between" : "text-center"}>
            <div className={isSplit ? "max-w-xl" : "mx-auto max-w-2xl"}>
              <h2
                className={isBanner ? "text-2xl font-bold tracking-tight md:text-3xl" : "text-2xl font-semibold tracking-tight"}
                style={{ color: "var(--site-text)" }}
              >
                {content?.title}
              </h2>
              {content?.description && (
                <p className="mt-3 text-sm leading-relaxed" style={{ color: "var(--site-muted)" }}>
                  {content.description}
                </p>
              )}
            </div>
            <div className={isSplit ? "flex-shrink-0" : "mt-6 flex justify-center"}>
              <a
                href="#contact"
                className="inline-flex items-center justify-center px-6 py-3 text-sm font-semibold"
                style={{ borderRadius: "var(--site-radius)", background: "var(--site-primary)", color: "#0b1020" }}
              >
                {content?.cta || "Get started"}
              </a>
            </div>
          </div>
        </div>
      )}
    </SectionShell>
  );
}
