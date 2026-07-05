import { estadoBadgeClass } from "../data/mockData";
import { alcanceDe } from "../utils/alcance";

export function EstadoBadge({ estado }) {
  return <span className={"badge " + estadoBadgeClass(estado)}>{estado}</span>;
}

/** Indica al usuario qué alcance de datos está viendo según su rol activo. */
export function ScopeBanner({ role }) {
  const { label } = alcanceDe(role);
  return (
    <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 16, display: "flex", alignItems: "center", gap: 6 }}>
      <span className="badge badge-neutral">Nivel: {role}</span>
      Mostrando: {label}
    </div>
  );
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
