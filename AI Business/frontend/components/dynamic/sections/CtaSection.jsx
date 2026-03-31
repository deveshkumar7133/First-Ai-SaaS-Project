"use client";

import { sectionSurfaceStyle } from "../../../lib/siteTheme";
import { Button } from "../../Button";

export function CtaSection({ content, theme, editable, onChange, onDelete }) {
  const primary = theme?.primaryColor || "#6366f1";
  const accent = theme?.accentColor || primary;
  const variant = String(content?.variant || "").toLowerCase();
  const isBanner = variant.includes("banner");

  return (
    <section className="p-8" style={sectionSurfaceStyle(theme)}>
      <div className="flex items-start justify-between gap-3">
        <div className="text-xs" style={{ opacity: 0.65 }}>
          CTA
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
            value={content?.title || ""}
            onChange={(e) => onChange?.({ ...content, title: e.target.value })}
            placeholder="Title"
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
            placeholder="CTA"
          />
        </div>
      ) : (
        <div
          className={isBanner ? "p-6 md:p-7" : "p-6"}
          style={{
            borderRadius: "var(--site-radius)",
            border: "1px solid var(--site-border)",
            background: isBanner
              ? `linear-gradient(135deg, ${primary}22, ${accent}14)`
              : "color-mix(in srgb, var(--site-surface) 86%, transparent)"
          }}
        >
          <div className="text-xl font-semibold" style={{ color: "var(--site-text)" }}>
            {content?.title}
          </div>
          <div className="mt-2 text-sm" style={{ color: "var(--site-muted)" }}>
            {content?.description}
          </div>
          <div className="mt-5">
            <a
              href="#contact"
              className="inline-flex items-center justify-center px-4 py-2 text-sm font-semibold"
              style={{ borderRadius: "var(--site-radius)", background: "var(--site-primary)", color: "#0b1020" }}
            >
              {content?.cta || "Get started"}
            </a>
          </div>
        </div>
      )}
    </section>
  );
}

