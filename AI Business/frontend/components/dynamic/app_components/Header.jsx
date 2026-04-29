export function Header({ component }) {
  if (!component) return null;
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ fontWeight: 800, fontSize: 18, color: "var(--site-text)" }}>
        {component.title || "Header"}
      </div>
    </div>
  );
}
