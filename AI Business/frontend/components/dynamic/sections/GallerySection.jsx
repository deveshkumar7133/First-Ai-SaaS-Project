"use client";

import { sectionSurfaceStyle } from "../../../lib/siteTheme";
import { Button } from "../../Button";

export function GallerySection({ content, theme, editable, onChange, onDelete }) {
  const images = Array.isArray(content?.images) ? content.images : [];
  const variant = String(content?.variant || "").toLowerCase();
  const isBento = variant.includes("bento");
  const isStrip = variant.includes("strip");

  function addImage() {
    onChange?.({ ...content, images: [...images, { src: "image.jpg", alt: "Image description" }] });
  }

  function updateImage(i, patch) {
    onChange?.({ ...content, images: images.map((img, idx) => (idx === i ? { ...img, ...patch } : img)) });
  }

  function removeImage(i) {
    onChange?.({ ...content, images: images.filter((_, idx) => idx !== i) });
  }

  return (
    <section className="p-8" id="gallery" style={sectionSurfaceStyle(theme)}>
      <div className="flex items-start justify-between gap-3">
        <div className="text-xs" style={{ opacity: 0.65 }}>
          Gallery
        </div>
        {editable ? (
          <div className="flex gap-2">
            <Button variant="secondary" type="button" onClick={addImage}>
              Add image
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
            {images.map((img, i) => (
              <div key={i} className="rounded-2xl border border-slate-800/70 bg-slate-950/40 p-4">
                <div className="flex items-center justify-between gap-2">
                  <div className="text-xs text-slate-400">Image {i + 1}</div>
                  <Button variant="secondary" type="button" onClick={() => removeImage(i)}>
                    Remove
                  </Button>
                </div>
                <input
                  className="mt-3 w-full rounded-xl border border-slate-800/70 bg-slate-950/40 px-3 py-2 text-sm text-slate-100"
                  value={img?.src || ""}
                  onChange={(e) => updateImage(i, { src: e.target.value })}
                  placeholder="src"
                />
                <input
                  className="mt-3 w-full rounded-xl border border-slate-800/70 bg-slate-950/40 px-3 py-2 text-sm text-slate-100"
                  value={img?.alt || ""}
                  onChange={(e) => updateImage(i, { alt: e.target.value })}
                  placeholder="alt"
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
          <div
            className={
              isStrip
                ? "mt-6 grid gap-3 md:grid-cols-4"
                : isBento
                  ? "mt-6 grid gap-3 md:grid-cols-4"
                  : "mt-6 grid gap-4 md:grid-cols-3"
            }
          >
            {images.map((img, i) => (
              <div
                key={i}
                className="p-5"
                style={{
                  borderRadius: "var(--site-radius)",
                  border: "1px solid var(--site-border)",
                  background: "color-mix(in srgb, var(--site-surface) 86%, transparent)",
                  gridColumn: isBento && i === 0 ? "span 2 / span 2" : undefined,
                  gridRow: isBento && i === 0 ? "span 2 / span 2" : undefined
                }}
              >
                <div className="text-sm font-semibold" style={{ color: "var(--site-text)" }}>
                  {img?.alt}
                </div>
                <div className="mt-2 text-xs" style={{ color: "var(--site-muted)" }}>
                  {img?.src}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </section>
  );
}

