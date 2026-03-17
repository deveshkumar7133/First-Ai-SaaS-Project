export function Button({ children, className = "", variant = "primary", ...props }) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-indigo-400/50 disabled:opacity-50 disabled:cursor-not-allowed active:translate-y-[0.5px]";
  const styles =
    variant === "secondary"
      ? "border border-slate-800 bg-slate-950/40 text-slate-100 hover:bg-slate-900/50"
      : "bg-indigo-500 text-slate-950 hover:bg-indigo-400";

  return (
    <button className={`${base} ${styles} ${className}`} {...props}>
      {children}
    </button>
  );
}

