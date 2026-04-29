"use client";

import { SectionShell } from "./SectionShell";

export function GallerySection({ content, theme, editable, onChange, onDelete }) {
  const images  = Array.isArray(content?.images) ? content.images : [];
  const variant = String(content?.variant || "").toLowerCase();
  const isBento   = variant.includes("bento");
  const isMasonry = variant.includes("masonry");
  const isStrip   = variant.includes("strip");
  const cols      = isStrip ? "grid-cols-4 md:grid-cols-6" : "grid-cols-2 md:grid-cols-3";

  return (
    <SectionShell id="gallery" theme={theme} editable={editable} onDelete={onDelete}>
      {editable ? (
        <div className="space-y-2">
          <input
            className="w-full rounded-xl border border-slate-800/70 bg-slate-950/40 px-3 py-2 text-sm text-slate-100"
            value={content?.title || ""}
            onChange={(e) => onChange?.({ ...content, title: e.target.value })}
            placeholder="Gallery title"
          />
          <p className="text-xs text-slate-400">Gallery images are AI-specified — edit via the JSON export.</p>
        </div>
      ) : (
        <>
          <h2 className="text-2xl font-semibold tracking-tight md:text-3xl" style={{ color: "var(--site-text)" }}>
            {content?.title}
          </h2>
          {isBento ? (
            /* Bento: first image large, rest small */
            <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-3">
              {images.map((img, i) => (
                <div
                  key={i}
                  className={i === 0 ? "col-span-2 md:col-span-2" : ""}
                  style={{
                    borderRadius: "var(--site-radius)",
                    border: "1px solid var(--site-border)",
                    background: `linear-gradient(135deg,
                      color-mix(in srgb, var(--site-primary) ${20 + (i * 8) % 20}%, transparent),
                      color-mix(in srgb, var(--site-accent)  ${12 + (i * 6) % 16}%, transparent))`,
                    aspectRatio: i === 0 ? "16/7" : "4/3",
                    display: "flex",
                    alignItems: "flex-end",
                    padding: "10px 12px",
                    overflow: "hidden"
                  }}
                >
                  <span className="text-xs font-medium" style={{ color: "var(--site-muted)" }}>{img?.alt}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className={`mt-6 grid gap-3 ${cols}`}>
              {images.map((img, i) => (
                <div
                  key={i}
                  style={{
                    borderRadius: "var(--site-radius)",
                    border: "1px solid var(--site-border)",
                    background: `linear-gradient(135deg,
                      color-mix(in srgb, var(--site-primary) ${16 + (i * 7) % 18}%, transparent),
                      color-mix(in srgb, var(--site-secondary) ${10 + (i * 5) % 14}%, transparent))`,
                    aspectRatio: isStrip ? "1/1" : isMasonry && i % 3 === 1 ? "3/4" : "4/3",
                    display: "flex",
                    alignItems: "flex-end",
                    padding: "8px 10px",
                    overflow: "hidden"
                  }}
                >
                  <span className="text-xs" style={{ color: "var(--site-muted)" }}>{img?.alt}</span>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </SectionShell>
  );
}
