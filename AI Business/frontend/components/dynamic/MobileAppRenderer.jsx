"use client";

import { useEffect, useState } from "react";
import { previewCanvasStyle, themeVars } from "../../lib/siteTheme";
import { Header } from "./app_components/Header";
import { Card } from "./app_components/Card";
import { Input } from "./app_components/Input";
import { Button } from "./app_components/Button";

const COMPONENTS_MAP = {
  header: Header,
  card: Card,
  input: Input,
  button: Button
};

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
              {activeComponents.map((c, idx) => {
                const type = String(c?.type || "").toLowerCase();
                const Comp = COMPONENTS_MAP[type];
                if (!Comp) return null;
                return <Comp key={`${activeName}-${idx}`} component={c} />;
              })}
            </>
          ) : (
            <div style={{ color: "var(--site-muted)", fontSize: 14 }}>No screens yet.</div>
          )}
        </div>
      </div>
    </div>
  );
}

