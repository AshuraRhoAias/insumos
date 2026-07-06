import { useEffect, useRef, useState } from "react";
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

const NUM_TOKEN = /-?[\d,]*\d(\.\d+)?/;

/**
 * Anima el primer número dentro de un valor ya formateado ("$13,150,000",
 * "69%", "1.4 d"…) contando desde el valor previo. El resto del texto
 * (símbolo de moneda, unidad, signo) se conserva tal cual.
 */
export function AnimatedNumber({ value, duration = 700 }) {
  const str = String(value);
  const match = str.match(NUM_TOKEN);
  const [display, setDisplay] = useState(str);
  const prevRef = useRef(0);

  useEffect(() => {
    if (!match) {
      setDisplay(str);
      return;
    }
    const raw = match[0];
    const target = parseFloat(raw.replace(/,/g, ""));
    if (Number.isNaN(target)) {
      setDisplay(str);
      return;
    }
    const from = prevRef.current;
    const decimals = raw.includes(".") ? raw.split(".")[1].length : 0;
    const start = performance.now();
    let frame;

    function tick(now) {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      const current = from + (target - from) * eased;
      const formatted = decimals > 0
        ? current.toFixed(decimals)
        : Math.round(current).toLocaleString("en-US");
      setDisplay(str.slice(0, match.index) + formatted + str.slice(match.index + raw.length));
      if (t < 1) frame = requestAnimationFrame(tick);
      else prevRef.current = target;
    }

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [str]);

  return display;
}

export function presupuestoColor(pct) {
  if (pct >= 100) return "var(--ink)";
  if (pct >= 95) return "var(--critical)";
  if (pct >= 85) return "var(--warning)";
  if (pct >= 70) return "var(--accent)";
  return "var(--success)";
}
