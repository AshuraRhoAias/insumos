import { useState } from "react";
import { reportesDisponibles, consumoMensual } from "../data/mockData";
import { money } from "../components/UI";

export default function Reportes() {
  const [activo, setActivo] = useState(reportesDisponibles[0]);
  const maxMonto = Math.max(...consumoMensual.map((m) => m.monto));

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Reportes</h2>
          <p>Indicadores y reportes analíticos sobre consumo, presupuesto y tiempos de atención.</p>
        </div>
      </div>

      <div className="split">
        <div className="card card-pad">
          <div className="toolbar">
            <select className="input" style={{ maxWidth: 180 }}><option>Este mes</option><option>Trimestre</option><option>Año</option></select>
            <select className="input" style={{ maxWidth: 220 }}><option>Todas las dependencias</option><option>SOS</option><option>SSP</option><option>DIF</option></select>
            <div style={{ marginLeft: "auto", display: "flex", gap: 6 }}>
              <button className="btn btn-ghost btn-sm">Exportar PDF</button>
              <button className="btn btn-ghost btn-sm">Exportar Excel</button>
              <button className="btn btn-ghost btn-sm">Exportar CSV</button>
            </div>
          </div>

          <h3 style={{ fontSize: 14 }}>{activo.nombre}</h3>
          <p style={{ fontSize: 13, color: "var(--muted)", marginTop: -6 }}>{activo.descripcion}</p>

          <div style={{ display: "flex", alignItems: "flex-end", gap: 16, height: 200, padding: "14px 4px 0" }}>
            {consumoMensual.map((m) => (
              <div key={m.mes} style={{ flex: 1, textAlign: "center" }}>
                <div
                  style={{ height: `${(m.monto / maxMonto) * 150}px`, background: "var(--accent)", borderRadius: "4px 4px 0 0", marginBottom: 8 }}
                  title={money(m.monto)}
                />
                <div style={{ fontSize: 11, color: "var(--muted)" }}>{m.mes}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="card card-pad">
          <h3 style={{ marginTop: 0, fontSize: 14 }}>Catálogo de reportes</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {reportesDisponibles.map((r) => (
              <button
                key={r.id}
                onClick={() => setActivo(r)}
                className="sidebar-link"
                style={{
                  color: activo.id === r.id ? "var(--primary)" : "var(--ink-soft)",
                  background: activo.id === r.id ? "var(--primary-tint)" : "transparent",
                  border: "1px solid " + (activo.id === r.id ? "var(--primary-tint)" : "transparent"),
                }}
              >
                {r.nombre}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
