export function Input({ component }) {
  if (!component) return null;
  return (
    <div style={{ marginBottom: 12 }}>
      <input
        placeholder={component.placeholder || "Input"}
        style={{
          width: "100%",
          borderRadius: "var(--site-radius)",
          border: "1px solid var(--site-border)",
          background: "color-mix(in srgb, var(--site-surface) 88%, transparent)",
          padding: "12px 12px",
          color: "var(--site-text)",
          outline: "none"
        }}
      />
    </div>
  );
}
