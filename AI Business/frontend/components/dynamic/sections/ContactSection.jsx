"use client";

import { Button } from "../../Button";

export function ContactSection({ content, editable, onChange, onDelete }) {
  const hours = Array.isArray(content?.hours) ? content.hours : [];

  function setHoursText(text) {
    const list = text
      .split("\n")
      .map((x) => x.trim())
      .filter(Boolean);
    onChange?.({ ...content, hours: list });
  }

  return (
    <section className="rounded-2xl border border-slate-800/70 bg-slate-950/35 p-8 shadow-soft" id="contact">
      <div className="flex items-start justify-between gap-3">
        <div className="text-xs text-slate-400">Contact</div>
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
          <h2 className="mt-3 text-2xl font-semibold tracking-tight">{content?.title}</h2>
          <p className="mt-3 text-slate-300/90">{content?.description}</p>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-slate-800/70 bg-slate-950/40 p-5">
              <div className="text-sm font-semibold">Details</div>
              <div className="mt-3 space-y-1 text-sm text-slate-300/80">
                {content?.addressLine ? <div>{content.addressLine}</div> : null}
                {content?.phone ? <div>{content.phone}</div> : null}
                {content?.email ? <div>{content.email}</div> : null}
              </div>
            </div>
            <div className="rounded-2xl border border-slate-800/70 bg-slate-950/40 p-5">
              <div className="text-sm font-semibold">Hours</div>
              <div className="mt-3 space-y-1 text-sm text-slate-300/80">
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

