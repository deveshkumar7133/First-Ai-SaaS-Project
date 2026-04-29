"use client";

import { SectionShell } from "./SectionShell";
import { Button } from "../../Button";

export function TestimonialsSection({ content, theme, editable, onChange, onDelete }) {
  const items    = Array.isArray(content?.items) ? content.items : [];
  const variant  = String(content?.variant || "").toLowerCase();
  const isMinimal   = variant.includes("minimal");
  const isMarquee   = variant.includes("marquee") || variant.includes("avatar");
  const isSpotlight = variant.includes("spotlight");
  const cols = isMarquee ? "md:grid-cols-3" : isSpotlight ? "" : "md:grid-cols-2";

  function addItem()      { onChange?.({ ...content, items: [...items, { name: "Customer", role: "", quote: "", rating: 5 }] }); }
  function updateItem(i, patch) { onChange?.({ ...content, items: items.map((it, idx) => (idx === i ? { ...it, ...patch } : it)) }); }
  function removeItem(i)  { onChange?.({ ...content, items: items.filter((_, idx) => idx !== i) }); }

  function Stars({ rating }) {
    return (
      <div className="flex gap-0.5">
        {[1,2,3,4,5].map((n) => (
          <span key={n} style={{ color: n <= (rating || 5) ? "var(--site-accent)" : "var(--site-border)", fontSize: 13 }}>★</span>
        ))}
      </div>
    );
  }

  return (
    <SectionShell id="testimonials" theme={theme} editable={editable} onDelete={onDelete}>
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
                  <span className="text-xs text-slate-400">Testimonial {i + 1}</span>
                  <Button variant="secondary" type="button" onClick={() => removeItem(i)}>Remove</Button>
                </div>
                <input className="w-full rounded-xl border border-slate-800/70 bg-slate-950/40 px-3 py-2 text-sm text-slate-100 mb-2"
                  value={it?.name || ""} onChange={(e) => updateItem(i, { name: e.target.value })} placeholder="Name" />
                <input className="w-full rounded-xl border border-slate-800/70 bg-slate-950/40 px-3 py-2 text-sm text-slate-100 mb-2"
                  value={it?.role || ""} onChange={(e) => updateItem(i, { role: e.target.value })} placeholder="Role (optional)" />
                <textarea className="w-full rounded-xl border border-slate-800/70 bg-slate-950/40 px-3 py-2 text-sm text-slate-100"
                  rows={3} value={it?.quote || ""} onChange={(e) => updateItem(i, { quote: e.target.value })} placeholder="Quote" />
              </div>
            ))}
          </div>
        </div>
      ) : (
        <>
          <h2 className="text-2xl font-semibold tracking-tight md:text-3xl" style={{ color: "var(--site-text)" }}>
            {content?.title}
          </h2>
          {isSpotlight && items[0] ? (
            <div className="mt-6 p-6" style={{ borderRadius: "var(--site-radius)", border: "1px solid var(--site-border)", background: "color-mix(in srgb, var(--site-surface) 86%, transparent)" }}>
              <p className="text-xl italic leading-relaxed" style={{ color: "var(--site-text)" }}>"{items[0].quote}"</p>
              <div className="mt-4 flex items-center gap-3">
                <Stars rating={items[0].rating} />
                <div className="text-sm font-semibold" style={{ color: "var(--site-text)" }}>{items[0].name}</div>
                {items[0].role && <div className="text-sm" style={{ color: "var(--site-muted)" }}>{items[0].role}</div>}
              </div>
            </div>
          ) : (
            <div className={`mt-6 grid gap-4 ${cols}`}>
              {items.map((it, i) => (
                <div
                  key={i}
                  className={isMinimal ? "py-4" : "p-5"}
                  style={{
                    borderRadius: "var(--site-radius)",
                    border: isMinimal ? "none" : "1px solid var(--site-border)",
                    borderBottom: isMinimal ? "1px solid var(--site-border)" : undefined,
                    background: isMinimal ? "transparent" : "color-mix(in srgb, var(--site-surface) 86%, transparent)"
                  }}
                >
                  <Stars rating={it.rating} />
                  <p className="mt-3 text-sm leading-relaxed" style={{ color: "var(--site-muted)" }}>"{it.quote}"</p>
                  <div className="mt-3">
                    <div className="text-sm font-semibold" style={{ color: "var(--site-text)" }}>{it.name}</div>
                    {it.role && <div className="text-xs mt-0.5" style={{ color: "var(--site-muted)" }}>{it.role}</div>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </SectionShell>
  );
}
