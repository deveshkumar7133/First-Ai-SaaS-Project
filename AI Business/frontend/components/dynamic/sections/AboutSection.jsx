"use client";

import { sectionSurfaceStyle } from "../../../lib/siteTheme";
import { Button } from "../../Button";

export function AboutSection({ content, theme, editable, onChange, onDelete }) {
  const variant = String(content?.variant || "").toLowerCase();
  const isSplit = variant.includes("split");

  return (
    <section className="p-8" id="about" style={sectionSurfaceStyle(theme)}>
      <div className="flex items-start justify-between gap-3">
        <div className="text-xs" style={{ opacity: 0.65 }}>
          About
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
            rows={5}
            value={content?.description || ""}
            onChange={(e) => onChange?.({ ...content, description: e.target.value })}
            placeholder="Description"
          />
        </div>
      ) : (
        <>
          <div className={isSplit ? "mt-3 grid gap-6 md:grid-cols-2 md:items-start" : "mt-3"}>
            <div>
              <h2 className="text-2xl font-semibold tracking-tight" style={{ color: "var(--site-text)" }}>
                {content?.title}
              </h2>
              <p className="mt-3" style={{ color: "var(--site-muted)" }}>
                {content?.description}
              </p>
            </div>
            {isSplit ? (
              <div
                className="hidden md:block"
                style={{
                  borderRadius: "var(--site-radius)",
                  border: "1px solid var(--site-border)",
                  background:
                    "linear-gradient(180deg, color-mix(in srgb, var(--site-surface) 82%, transparent), color-mix(in srgb, var(--site-primary) 12%, transparent))",
                  height: 200
                }}
              />
            ) : null}
          </div>
        </>
      )}
    </section>
  );
}

