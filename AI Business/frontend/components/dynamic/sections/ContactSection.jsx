"use client";

import { SectionShell } from "./SectionShell";

export function ContactSection({ content, theme, editable, onChange, onDelete }) {
  const variant   = String(content?.variant || "").toLowerCase();
  const isSplit   = variant.includes("split");
  const isPanel   = variant.includes("panel") || variant.includes("card");

  return (
    <SectionShell id="contact" theme={theme} editable={editable} onDelete={onDelete}>
      {editable ? (
        <div className="space-y-3">
          {[
            ["title",       "Section title",   "input"],
            ["description", "Description",     "textarea"],
            ["addressLine", "Address",         "input"],
            ["phone",       "Phone",           "input"],
            ["email",       "Email",           "input"],
          ].map(([field, ph, type]) =>
            type === "textarea" ? (
              <textarea
                key={field}
                className="w-full rounded-xl border border-slate-800/70 bg-slate-950/40 px-3 py-2 text-sm text-slate-100"
                rows={3}
                value={content?.[field] || ""}
                onChange={(e) => onChange?.({ ...content, [field]: e.target.value })}
                placeholder={ph}
              />
            ) : (
              <input
                key={field}
                className="w-full rounded-xl border border-slate-800/70 bg-slate-950/40 px-3 py-2 text-sm text-slate-100"
                value={content?.[field] || ""}
                onChange={(e) => onChange?.({ ...content, [field]: e.target.value })}
                placeholder={ph}
              />
            )
          )}
        </div>
      ) : (
        <div className={isSplit ? "grid gap-10 md:grid-cols-2 md:items-start" : ""}>
          {/* Info block */}
          <div
            className={isPanel ? "p-6" : ""}
            style={
              isPanel
                ? {
                    borderRadius: "var(--site-radius)",
                    border: "1px solid var(--site-border)",
                    background: "color-mix(in srgb, var(--site-surface) 86%, transparent)"
                  }
                : {}
            }
          >
            <h2 className="text-2xl font-semibold tracking-tight md:text-3xl" style={{ color: "var(--site-text)" }}>
              {content?.title}
            </h2>
            {content?.description && (
              <p className="mt-3 leading-relaxed" style={{ color: "var(--site-muted)" }}>
                {content.description}
              </p>
            )}
            <dl className="mt-6 space-y-3 text-sm">
              {[
                ["📍", content?.addressLine],
                ["📞", content?.phone],
                ["✉️", content?.email],
              ]
                .filter(([, v]) => v)
                .map(([icon, val]) => (
                  <div key={val} className="flex items-start gap-3">
                    <span>{icon}</span>
                    <dd style={{ color: "var(--site-muted)" }}>{val}</dd>
                  </div>
                ))}
              {Array.isArray(content?.hours) && content.hours.length > 0 && (
                <div className="flex items-start gap-3">
                  <span>🕐</span>
                  <dd>
                    {content.hours.map((h, i) => (
                      <div key={i} style={{ color: "var(--site-muted)" }}>{h}</div>
                    ))}
                  </dd>
                </div>
              )}
            </dl>
          </div>

          {/* Right panel: simple contact form placeholder */}
          {isSplit && (
            <div
              className="p-6"
              style={{
                borderRadius: "var(--site-radius)",
                border: "1px solid var(--site-border)",
                background: "color-mix(in srgb, var(--site-surface) 86%, transparent)"
              }}
            >
              <div className="space-y-3">
                {["Your name", "Your email", "Your message"].map((ph, i) =>
                  i === 2 ? (
                    <textarea
                      key={ph}
                      disabled
                      placeholder={ph}
                      rows={4}
                      className="w-full resize-none rounded-xl px-3 py-2 text-sm"
                      style={{
                        border: "1px solid var(--site-border)",
                        background: "color-mix(in srgb, var(--site-surface) 60%, transparent)",
                        color: "var(--site-muted)"
                      }}
                    />
                  ) : (
                    <input
                      key={ph}
                      disabled
                      placeholder={ph}
                      className="w-full rounded-xl px-3 py-2 text-sm"
                      style={{
                        border: "1px solid var(--site-border)",
                        background: "color-mix(in srgb, var(--site-surface) 60%, transparent)",
                        color: "var(--site-muted)"
                      }}
                    />
                  )
                )}
                <button
                  type="button"
                  disabled
                  className="w-full rounded-xl py-2.5 text-sm font-semibold"
                  style={{ background: "var(--site-primary)", color: "#0b1020" }}
                >
                  Send message
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </SectionShell>
  );
}
