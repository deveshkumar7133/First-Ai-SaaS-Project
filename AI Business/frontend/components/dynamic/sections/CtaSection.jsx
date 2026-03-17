"use client";

import { Button } from "../../Button";

export function CtaSection({ content, theme, editable, onChange, onDelete }) {
  const primary = theme?.primaryColor || "#6366f1";

  return (
    <section className="rounded-2xl border border-slate-800/70 bg-slate-950/35 p-8 shadow-soft">
      <div className="flex items-start justify-between gap-3">
        <div className="text-xs text-slate-400">CTA</div>
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
        <div className="rounded-2xl border border-slate-800/70 bg-slate-950/40 p-6">
          <div className="text-xl font-semibold">{content?.title}</div>
          <div className="mt-2 text-sm text-slate-300/80">{content?.description}</div>
          <div className="mt-5">
            <a
              href="#contact"
              className="inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold text-slate-950"
              style={{ background: primary }}
            >
              {content?.cta || "Get started"}
            </a>
          </div>
        </div>
      )}
    </section>
  );
}

