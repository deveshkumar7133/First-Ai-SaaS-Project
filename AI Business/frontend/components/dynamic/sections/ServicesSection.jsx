"use client";

import { Button } from "../../Button";

export function ServicesSection({ content, editable, onChange, onDelete }) {
  const items = Array.isArray(content?.items) ? content.items : [];

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
    <section className="rounded-2xl border border-slate-800/70 bg-slate-950/35 p-8 shadow-soft" id="services">
      <div className="flex items-start justify-between gap-3">
        <div className="text-xs text-slate-400">Services</div>
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
          <h2 className="mt-3 text-2xl font-semibold tracking-tight">{content?.title}</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {items.map((it, i) => (
              <div key={i} className="rounded-2xl border border-slate-800/70 bg-slate-950/40 p-5">
                <div className="text-sm font-semibold">{it?.title}</div>
                <div className="mt-2 text-sm text-slate-300/80">{it?.description}</div>
              </div>
            ))}
          </div>
        </>
      )}
    </section>
  );
}

