"use client";

import { sectionSurfaceStyle } from "../../../lib/siteTheme";
import { Button } from "../../Button";

export function ContactSection({ content, theme, editable, onChange, onDelete }) {
  const hours = Array.isArray(content?.hours) ? content.hours : [];
  const variant = String(content?.variant || "").toLowerCase();
  const isMinimal = variant.includes("minimal");

  function setHoursText(text) {
    const list = text
      .split("\n")
      .map((x) => x.trim())
      .filter(Boolean);
    onChange?.({ ...content, hours: list });
  }

  return (
    <section className="p-8" id="contact" style={sectionSurfaceStyle(theme)}>
      <div className="flex items-start justify-between gap-3">
        <div className="text-xs" style={{ opacity: 0.65 }}>
          Contact
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
            rows={3}
            value={content?.description || ""}
            onChange={(e) => onChange?.({ ...content, description: e.target.value })}
            placeholder="Description"
          />
          <div className="grid gap-3 md:grid-cols-2">
            <input
              className="w-full rounded-xl border border-slate-800/70 bg-slate-950/40 px-3 py-2 text-sm text-slate-100"
              value={content?.addressLine || ""}
              onChange={(e) => onChange?.({ ...content, addressLine: e.target.value })}
              placeholder="Address"
            />
            <input
              className="w-full rounded-xl border border-slate-800/70 bg-slate-950/40 px-3 py-2 text-sm text-slate-100"
              value={content?.phone || ""}
              onChange={(e) => onChange?.({ ...content, phone: e.target.value })}
              placeholder="Phone"
            />
            <input
              className="w-full rounded-xl border border-slate-800/70 bg-slate-950/40 px-3 py-2 text-sm text-slate-100"
              value={content?.email || ""}
              onChange={(e) => onChange?.({ ...content, email: e.target.value })}
              placeholder="Email"
            />
          </div>
          <textarea
            className="w-full rounded-xl border border-slate-800/70 bg-slate-950/40 px-3 py-2 text-sm text-slate-100"
            rows={4}
            value={hours.join("\n")}
            onChange={(e) => setHoursText(e.target.value)}
            placeholder={"Hours (one per line)\nMon–Fri: 9am–6pm"}
          />
        </div>
      ) : (
        <>
          <h2 className="mt-3 text-2xl font-semibold tracking-tight" style={{ color: "var(--site-text)" }}>
            {content?.title}
          </h2>
          <p className="mt-3" style={{ color: "var(--site-muted)" }}>
            {content?.description}
          </p>
          <div className={isMinimal ? "mt-6 grid gap-3" : "mt-6 grid gap-4 md:grid-cols-2"}>
            <div
              className="p-5"
              style={{
                borderRadius: "var(--site-radius)",
                border: isMinimal ? "1px dashed var(--site-border)" : "1px solid var(--site-border)",
                background: isMinimal ? "transparent" : "color-mix(in srgb, var(--site-surface) 86%, transparent)"
              }}
            >
              <div className="text-sm font-semibold" style={{ color: "var(--site-text)" }}>
                Details
              </div>
              <div className="mt-3 space-y-1 text-sm" style={{ color: "var(--site-muted)" }}>
                {content?.addressLine ? <div>{content.addressLine}</div> : null}
                {content?.phone ? <div>{content.phone}</div> : null}
                {content?.email ? <div>{content.email}</div> : null}
              </div>
            </div>
            <div
              className="p-5"
              style={{
                borderRadius: "var(--site-radius)",
                border: isMinimal ? "1px dashed var(--site-border)" : "1px solid var(--site-border)",
                background: isMinimal ? "transparent" : "color-mix(in srgb, var(--site-surface) 86%, transparent)"
              }}
            >
              <div className="text-sm font-semibold" style={{ color: "var(--site-text)" }}>
                Hours
              </div>
              <div className="mt-3 space-y-1 text-sm" style={{ color: "var(--site-muted)" }}>
                {hours.map((h) => (
                  <div key={h}>{h}</div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </section>
  );
}

