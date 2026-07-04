import { estadoBadgeClass } from "../data/mockData";

export function EstadoBadge({ estado }) {
  return <span className={"badge " + estadoBadgeClass(estado)}>{estado}</span>;
}

export function money(n) {
  return n.toLocaleString("es-MX", { style: "currency", currency: "MXN", maximumFractionDigits: 0 });
}

export function ProgressBar({ pct, color }) {
  const clamped = Math.max(0, Math.min(100, pct));
  return (
    <div className="progress-track">
      <div className="progress-fill" style={{ width: `${clamped}%`, background: color }} />
    </div>
  );
}

export function presupuestoColor(pct) {
  if (pct >= 100) return "var(--ink)";
  if (pct >= 95) return "var(--critical)";
  if (pct >= 85) return "var(--warning)";
  if (pct >= 70) return "var(--accent)";
  return "var(--success)";
}
