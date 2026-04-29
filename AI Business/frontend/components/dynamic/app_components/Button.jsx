export function Button({ component }) {
  if (!component) return null;
  return (
    <button
      type="button"
      style={{
        width: "100%",
        borderRadius: "var(--site-radius)",
        padding: "12px 14px",
        fontWeight: 800,
        border: "1px solid transparent",
        background: "var(--site-primary)",
        color: "#0b1020"
      }}
    >
      {component.text || "Button"}
    </button>
  );
}
