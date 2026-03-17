"use client";

import Editor from "@monaco-editor/react";

export function MonacoCodeViewer({ value, language = "json", height = "60vh", onChange }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-800/70 bg-slate-950/40">
      <Editor
        height={height}
        defaultLanguage={language}
        value={value}
        onChange={onChange}
        options={{
          minimap: { enabled: false },
          fontSize: 12,
          scrollBeyondLastLine: false,
          wordWrap: "on"
        }}
        theme="vs-dark"
      />
    </div>
  );
}

