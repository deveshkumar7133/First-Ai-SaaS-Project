"use client";

import { useState } from "react";
import { SectionShell } from "./SectionShell";
import { Button } from "../../Button";

export function FaqSection({ content, theme, editable, onChange, onDelete }) {
  const items   = Array.isArray(content?.items) ? content.items : [];
  const variant = String(content?.variant || "").toLowerCase();
  const twoCol  = variant.includes("two") || variant.includes("column");
  const isBoxed = variant.includes("boxed");

  const [open, setOpen] = useState(null);

  function addItem()       { onChange?.({ ...content, items: [...items, { question: "New question", answer: "" }] }); }
  function updateItem(i, patch) { onChange?.({ ...content, items: items.map((it, idx) => (idx === i ? { ...it, ...patch } : it)) }); }
  function removeItem(i)   { onChange?.({ ...content, items: items.filter((_, idx) => idx !== i) }); }

  return (
    <SectionShell id="faq" theme={theme} editable={editable} onDelete={onDelete}>
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
          <div className="space-y-3">
            {items.map((it, i) => (
              <div key={i} className="rounded-2xl border border-slate-800/70 bg-slate-950/40 p-4">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-xs text-slate-400">Q {i + 1}</span>
                  <Button variant="secondary" type="button" onClick={() => removeItem(i)}>Remove</Button>
                </div>
                <input className="w-full rounded-xl border border-slate-800/70 bg-slate-950/40 px-3 py-2 text-sm text-slate-100 mb-2"
                  value={it?.question || ""} onChange={(e) => updateItem(i, { question: e.target.value })} placeholder="Question" />
                <textarea className="w-full rounded-xl border border-slate-800/70 bg-slate-950/40 px-3 py-2 text-sm text-slate-100"
                  rows={3} value={it?.answer || ""} onChange={(e) => updateItem(i, { answer: e.target.value })} placeholder="Answer" />
              </div>
            ))}
          </div>
        </div>
      ) : (
        <>
          <h2 className="text-2xl font-semibold tracking-tight md:text-3xl" style={{ color: "var(--site-text)" }}>
            {content?.title}
          </h2>
          <div className={`mt-6 ${twoCol ? "grid gap-3 md:grid-cols-2" : "space-y-2"}`}>
            {items.map((it, i) => {
              const isOpen = open === i;
              return (
                <div
                  key={i}
                  style={{
                    borderRadius: "var(--site-radius)",
                    border: "1px solid var(--site-border)",
                    background: isBoxed || isOpen
                      ? "color-mix(in srgb, var(--site-surface) 86%, transparent)"
                      : "transparent",
                    overflow: "hidden",
                    transition: "background 0.2s"
                  }}
                >
                  <button
                    type="button"
                    className="flex w-full items-start justify-between gap-4 px-5 py-4 text-left"
                    onClick={() => setOpen(isOpen ? null : i)}
                  >
                    <span className="text-sm font-semibold" style={{ color: "var(--site-text)" }}>{it?.question}</span>
                    <span style={{ color: "var(--site-accent)", fontSize: 18, lineHeight: 1, flexShrink: 0 }}>
                      {isOpen ? "−" : "+"}
                    </span>
                  </button>
                  {(isOpen || twoCol) && (
                    <div className="px-5 pb-4 text-sm leading-relaxed" style={{ color: "var(--site-muted)" }}>
                      {it?.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}
    </SectionShell>
  );
}
