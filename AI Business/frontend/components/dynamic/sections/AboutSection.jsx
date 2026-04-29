"use client";

import { SectionShell } from "./SectionShell";

export function AboutSection({ content, theme, editable, onChange, onDelete }) {
  const variant  = String(content?.variant || "").toLowerCase();
  const isSplit  = variant.includes("split");
  const isStory  = variant.includes("story") || variant.includes("timeline");

  return (
    <SectionShell id="about" theme={theme} editable={editable} onDelete={onDelete}>
      {editable ? (
        <div className="space-y-3">
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
        <div className={isSplit ? "grid gap-8 md:grid-cols-2 md:items-start" : ""}>
          <div>
            {isStory && (
              <div className="mb-3 text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--site-accent)" }}>
                Our Story
              </div>
            )}
            <h2 className="text-2xl font-semibold tracking-tight md:text-3xl" style={{ color: "var(--site-text)" }}>
              {content?.title}
            </h2>
            <p className="mt-4 leading-relaxed" style={{ color: "var(--site-muted)" }}>
              {content?.description}
            </p>
          </div>
          {isSplit && (
            <div
              className="hidden md:block"
              style={{
                borderRadius: "var(--site-radius)",
                border: "1px solid var(--site-border)",
                background: "linear-gradient(180deg, color-mix(in srgb, var(--site-surface) 82%, transparent), color-mix(in srgb, var(--site-primary) 12%, transparent))",
                minHeight: 200
              }}
            />
          )}
        </div>
      )}
    </SectionShell>
  );
}
