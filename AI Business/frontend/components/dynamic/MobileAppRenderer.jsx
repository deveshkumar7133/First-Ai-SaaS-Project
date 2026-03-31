"use client";

import { useEffect, useState } from "react";
import { previewCanvasStyle, themeVars } from "../../lib/siteTheme";

function ComponentBlock({ component }) {
  if (!component || typeof component !== "object") return null;
  const type = String(component.type || "").toLowerCase();

  if (type === "header") {
    return (
      <div style={{ marginBottom: 12 }}>
        <div style={{ fontWeight: 800, fontSize: 18, color: "var(--site-text)" }}>{component.title || "Header"}</div>
      </div>
    );
  }

  if (type === "card") {
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
        <div style={{ color: "var(--site-text)", fontSize: 14, fontWeight: 700 }}>{component.title || "Card"}</div>
        {component.content ? (
          <div style={{ color: "var(--site-muted)", marginTop: 6, fontSize: 13, lineHeight: 1.35 }}>{component.content}</div>
        ) : null}
      </div>
    );
  }

  if (type === "input") {
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

  if (type === "button") {
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

  return null;
}

export function MobileAppRenderer({ appSpec, theme }) {
  const themeStyle = previewCanvasStyle(theme);
  const vars = themeVars(theme);
  const screens = Array.isArray(appSpec?.screens) ? appSpec.screens : [];
  const [activeName, setActiveName] = useState(screens?.[0]?.name || "Home");

  useEffect(() => {
    const first = screens?.[0]?.name || "Home";
    setActiveName(first);
  }, [appSpec?._id, screens?.length]);

  const active = screens.find((s) => s.name === activeName) || screens[0];
  const activeComponents = Array.isArray(active?.components) ? active.components : [];

  return (
    <div
      style={{
        ...themeStyle,
        ...vars,
        borderRadius: 22,
        padding: 18
      }}
    >
      <div
        style={{
          margin: "0 auto",
          width: 360,
          maxWidth: "100%",
          borderRadius: 34,
          border: "1px solid var(--site-border)",
          background: "color-mix(in srgb, var(--site-surface) 65%, transparent)",
          boxShadow: "var(--site-shadow)",
          overflow: "hidden"
        }}
      >
        <div style={{ padding: "14px 16px 10px", borderBottom: "1px solid var(--site-border)" }}>
          <div style={{ fontWeight: 900, letterSpacing: -0.2, color: "var(--site-text)" }}>{appSpec?.appName || "App"}</div>
          <div style={{ marginTop: 8, display: "flex", gap: 8, flexWrap: "wrap" }}>
            {screens.map((s) => (
              <span
                key={s.name}
                role="button"
                tabIndex={0}
                onClick={() => setActiveName(s.name)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") setActiveName(s.name);
                }}
                style={{
                  cursor: "pointer",
                  fontSize: 12,
                  padding: "6px 10px",
                  borderRadius: 999,
                  border: s.name === activeName ? "1px solid transparent" : "1px solid var(--site-border)",
                  background: s.name === activeName ? "var(--site-primary)" : "transparent",
                  color: s.name === activeName ? "#0b1020" : "var(--site-muted)",
                  userSelect: "none"
                }}
              >
                {s.name}
              </span>
            ))}
          </div>
        </div>

        <div style={{ padding: 18 }}>
          {screens.length ? (
            <>
              {activeComponents.map((c, idx) => (
                <ComponentBlock key={`${activeName}-${idx}`} component={c} />
              ))}
            </>
          ) : (
            <div style={{ color: "var(--site-muted)", fontSize: 14 }}>No screens yet.</div>
          )}
        </div>
      </div>
    </div>
  );
}

