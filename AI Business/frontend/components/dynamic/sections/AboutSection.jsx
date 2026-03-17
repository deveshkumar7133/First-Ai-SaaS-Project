"use client";

import { Button } from "../../Button";

export function AboutSection({ content, editable, onChange, onDelete }) {
  return (
    <section className="rounded-2xl border border-slate-800/70 bg-slate-950/35 p-8 shadow-soft" id="about">
      <div className="flex items-start justify-between gap-3">
        <div className="text-xs text-slate-400">About</div>
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
            rows={5}
            value={content?.description || ""}
            onChange={(e) => onChange?.({ ...content, description: e.target.value })}
            placeholder="Description"
          />
        </div>
      ) : (
        <>
          <h2 className="mt-3 text-2xl font-semibold tracking-tight">{content?.title}</h2>
          <p className="mt-3 text-slate-300/90">{content?.description}</p>
        </>
      )}
    </section>
  );
}

