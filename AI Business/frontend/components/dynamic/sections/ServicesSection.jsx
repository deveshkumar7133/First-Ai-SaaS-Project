"use client";

import { sectionSurfaceStyle } from "../../../lib/siteTheme";
import { Button } from "../../Button";

export function ServicesSection({ content, theme, editable, onChange, onDelete }) {
  const items = Array.isArray(content?.items) ? content.items : [];
  const variant = String(content?.variant || "").toLowerCase();
  const isCompact = variant.includes("compact") || variant.includes("list");
  const isIconGrid = variant.includes("icon") || variant.includes("icons");

  function updateItem(i, patch) {
    const next = items.map((it, idx) => (idx === i ? { ...it, ...patch } : it));
    onChange?.({ ...content, items: next });
  }

  function addItem() {
    onChange?.({
      ...content,
      items: [...items, { title: "New item", description: "" }]
    });
  }

  function deleteItem(i) {
    onChange?.({
      ...content,
      items: items.filter((_, idx) => idx !== i)
    });
  }

  return (
    <section className="p-8" id="services" style={sectionSurfaceStyle(theme)}>
      <div className="flex items-start justify-between gap-3">
        <div className="text-xs" style={{ opacity: 0.65 }}>
          Services
        </div>
        {editable ? (
          <div className="flex gap-2">
            <Button variant="secondary" type="button" onClick={addItem}>
              Add item
            </Button>
            <Button variant="secondary" type="button" onClick={onDelete}>
              Delete
            </Button>
          </div>
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
          <div className="grid gap-3 md:grid-cols-2">
            {items.map((it, i) => (
              <div key={i} className="rounded-2xl border border-slate-800/70 bg-slate-950/40 p-4">
                <div className="flex items-center justify-between gap-2">
                  <div className="text-xs text-slate-400">Item {i + 1}</div>
                  <Button variant="secondary" type="button" onClick={() => deleteItem(i)}>
                    Remove
                  </Button>
                </div>
                <input
                  className="mt-3 w-full rounded-xl border border-slate-800/70 bg-slate-950/40 px-3 py-2 text-sm text-slate-100"
                  value={it?.title || ""}
                  onChange={(e) => updateItem(i, { title: e.target.value })}
                  placeholder="Item title"
                />
                <textarea
                  className="mt-3 w-full rounded-xl border border-slate-800/70 bg-slate-950/40 px-3 py-2 text-sm text-slate-100"
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
          <h2 className="mt-3 text-2xl font-semibold tracking-tight" style={{ color: "var(--site-text)" }}>
            {content?.title}
          </h2>
          <div className={isCompact ? "mt-6 grid gap-3" : "mt-6 grid gap-4 md:grid-cols-2"}>
            {items.map((it, i) => (
              <div
                key={i}
                className={isCompact ? "p-4" : "p-5"}
                style={{
                  borderRadius: "var(--site-radius)",
                  border: "1px solid var(--site-border)",
                  background: "color-mix(in srgb, var(--site-surface) 86%, transparent)"
                }}
              >
                <div className="flex items-start gap-3">
                  {isIconGrid ? (
                    <div
                      aria-hidden="true"
                      style={{
                        width: 12,
                        height: 12,
                        marginTop: 4,
                        borderRadius: 999,
                        background: "var(--site-accent)"
                      }}
                    />
                  ) : null}
                  <div>
                    <div className="text-sm font-semibold" style={{ color: "var(--site-text)" }}>
                      {it?.title}
                    </div>
                    <div className="mt-2 text-sm" style={{ color: "var(--site-muted)" }}>
                      {it?.description}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </section>
  );
}

