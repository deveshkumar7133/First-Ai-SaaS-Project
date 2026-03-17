"use client";

import { Button } from "../../Button";

export function HeroSection({ content, theme, editable, onChange, onDelete }) {
  const primary = theme?.primaryColor || "#6366f1";

  return (
    <section className="rounded-2xl border border-slate-800/70 bg-slate-950/35 p-8 shadow-soft">
      <div className="flex items-start justify-between gap-3">
        <div className="text-xs text-slate-400">Hero</div>
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
          <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-50">{content?.headline}</h1>
          <p className="mt-4 max-w-2xl text-lg text-slate-300/90">{content?.subtext}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <a
              href="#contact"
              className="inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold text-slate-950"
              style={{ background: primary }}
            >
              {content?.cta || "Contact"}
            </a>
            <a href="#services" className="inline-flex items-center justify-center rounded-xl border border-slate-800/70 bg-slate-950/40 px-4 py-2 text-sm font-semibold">
              Explore
            </a>
          </div>
        </>
      )}
    </section>
  );
}

