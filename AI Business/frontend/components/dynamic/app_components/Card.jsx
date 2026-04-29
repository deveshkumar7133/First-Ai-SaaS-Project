export function Card({ component }) {
  if (!component) return null;
  return (
    <div
      style={{
        border: "1px solid var(--site-border)",
        background: "color-mix(in srgb, var(--site-surface) 86%, transparent)",
        borderRadius: "var(--site-radius)",
        padding: 14,
        marginBottom: 12
      }}
    >
      <div style={{ color: "var(--site-text)", fontSize: 14, fontWeight: 700 }}>
        {component.title || "Card"}
      </div>
      {component.content ? (
        <div style={{ color: "var(--site-muted)", marginTop: 6, fontSize: 13, lineHeight: 1.35 }}>
          {component.content}
        </div>
      ) : null}
    </div>
  );
}
