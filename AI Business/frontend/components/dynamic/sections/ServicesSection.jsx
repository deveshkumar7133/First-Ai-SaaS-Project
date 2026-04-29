"use client";

import { SectionShell } from "./SectionShell";
import { Button } from "../../Button";

export function ServicesSection({ content, theme, editable, onChange, onDelete }) {
  const items    = Array.isArray(content?.items) ? content.items : [];
  const variant  = String(content?.variant || "").toLowerCase();
  const isCompact  = variant.includes("compact") || variant.includes("list");
  const isShowcase = variant.includes("showcase") || variant.includes("pricing");
  const cols       = isShowcase ? "md:grid-cols-3" : isCompact ? "" : "md:grid-cols-2";

  function updateItem(i, patch) {
    onChange?.({ ...content, items: items.map((it, idx) => (idx === i ? { ...it, ...patch } : it)) });
  }
  function addItem()    { onChange?.({ ...content, items: [...items, { title: "New item", description: "" }] }); }
  function deleteItem(i){ onChange?.({ ...content, items: items.filter((_, idx) => idx !== i) }); }

  return (
    <SectionShell id="services" theme={theme} editable={editable} onDelete={onDelete}>
      {editable ? (
        <div className="space-y-3">
          <div className="flex gap-2">
            <input
              className="flex-1 rounded-xl border border-slate-800/70 bg-slate-950/40 px-3 py-2 text-sm text-slate-100"
              value={content?.title || ""}
              onChange={(e) => onChange?.({ ...content, title: e.target.value })}
              placeholder="Section title"
            />
            <Button variant="secondary" type="button" onClick={addItem}>+ Add</Button>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {items.map((it, i) => (
              <div key={i} className="rounded-2xl border border-slate-800/70 bg-slate-950/40 p-4">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-xs text-slate-400">Item {i + 1}</span>
                  <Button variant="secondary" type="button" onClick={() => deleteItem(i)}>Remove</Button>
                </div>
                <input
                  className="w-full rounded-xl border border-slate-800/70 bg-slate-950/40 px-3 py-2 text-sm text-slate-100"
                  value={it?.title || ""}
                  onChange={(e) => updateItem(i, { title: e.target.value })}
                  placeholder="Item title"
                />
                <textarea
                  className="mt-2 w-full rounded-xl border border-slate-800/70 bg-slate-950/40 px-3 py-2 text-sm text-slate-100"
                  rows={3}
                  value={it?.description || ""}
                  onChange={(e) => updateItem(i, { description: e.target.value })}
                  placeholder="Item description"
                />
              </div>
            ))}
          </div>
        </div>
      ) : (
        <>
          <h2 className="text-2xl font-semibold tracking-tight md:text-3xl" style={{ color: "var(--site-text)" }}>
            {content?.title}
          </h2>
          <div className={`mt-6 grid gap-4 ${cols}`}>
            {items.map((it, i) => (
              <div
                key={i}
                className={isCompact ? "flex items-start gap-4 py-3" : "p-5"}
                style={
                  isCompact
                    ? { borderBottom: "1px solid var(--site-border)" }
                    : {
                        borderRadius: "var(--site-radius)",
                        border: "1px solid var(--site-border)",
                        background: "color-mix(in srgb, var(--site-surface) 86%, transparent)"
                      }
                }
              >
                {!isCompact && (
                  <div
                    aria-hidden="true"
                    style={{ width: 10, height: 10, borderRadius: 999, background: "var(--site-accent)", flexShrink: 0, marginTop: 4 }}
                  />
                )}
                <div>
                  <div className="text-sm font-semibold" style={{ color: "var(--site-text)" }}>{it?.title}</div>
                  <div className="mt-1.5 text-sm leading-relaxed" style={{ color: "var(--site-muted)" }}>{it?.description}</div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </SectionShell>
  );
}
