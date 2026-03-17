export function Card({ children, className = "" }) {
  return (
    <div className={`rounded-2xl border border-slate-800/70 bg-slate-950/35 shadow-soft ${className}`}>
      {children}
    </div>
  );
}

