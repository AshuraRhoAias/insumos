import { useMemo, useState } from "react";
import {
  reportesDisponibles,
  dependencias,
  todasLasAreas,
  consumoPorPeriodo,
  consumoPorDependencia,
  consumoTotalPorPeriodo,
  PERIODOS,
} from "../data/mockData";
import { money } from "../components/UI";
import { BarChart, chartSeriesToCSV, downloadTextFile } from "../components/Charts";

const MODOS = [
  { id: "total", label: "Todas las áreas (total)" },
  { id: "dependencia", label: "Comparar dependencias" },
  { id: "area", label: "Comparar áreas específicas" },
];

export default function Reportes() {
  const [activo, setActivo] = useState(reportesDisponibles[0]);
  const [periodo, setPeriodo] = useState("mes");
  const [modo, setModo] = useState("total");
  const [areasElegidas, setAreasElegidas] = useState(todasLasAreas.slice(0, 3).map((a) => a.area));
  const [exportMsg, setExportMsg] = useState("");

  function toggleArea(area) {
    setAreasElegidas((prev) => (prev.includes(area) ? prev.filter((a) => a !== area) : [...prev, area]));
  }

  const { labels, series } = useMemo(() => {
    if (modo === "dependencia") {
      const s = dependencias.map((d) => ({
        name: d.clave,
        data: consumoPorDependencia(d.clave, periodo).map((p) => p.monto),
      }));
      const lbls = consumoPorDependencia(dependencias[0].clave, periodo).map((p) => p.label);
      return { labels: lbls, series: s };
    }
    if (modo === "area") {
      const activas = areasElegidas.length ? areasElegidas : [todasLasAreas[0].area];
      const s = activas.map((area) => ({
        name: area,
        data: consumoPorPeriodo(periodo, area).map((p) => p.monto),
      }));
      const lbls = consumoPorPeriodo(periodo, activas[0]).map((p) => p.label);
      return { labels: lbls, series: s };
    }
    const total = consumoTotalPorPeriodo(periodo);
    return { labels: total.map((p) => p.label), series: [{ name: "Total", data: total.map((p) => p.monto) }] };
  }, [modo, periodo, areasElegidas]);

  const totalPeriodo = series.reduce((sum, s) => sum + s.data.reduce((a, b) => a + b, 0), 0);
  const promedio = totalPeriodo / labels.length;

  function exportar(formato) {
    if (formato === "PDF") {
      window.print();
      return;
    }
    const csv = chartSeriesToCSV(labels, series);
    const ext = formato === "Excel" ? "csv" : "csv";
    downloadTextFile(`reporte-${activo.id}-${periodo}.${ext}`, csv, "text/csv");
    setExportMsg(`Exportado como ${formato === "Excel" ? "CSV (compatible con Excel)" : "CSV"}.`);
    setTimeout(() => setExportMsg(""), 3000);
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Reportes</h2>
          <p>Indicadores y reportes analíticos sobre consumo, presupuesto y tiempos de atención.</p>
        </div>
      </div>

      {exportMsg && <div className="toast">✓ {exportMsg}</div>}

      <div className="split">
        <div className="card card-pad">
          <div className="toolbar">
            <select className="input" style={{ maxWidth: 180 }} value={periodo} onChange={(e) => setPeriodo(e.target.value)}>
              {PERIODOS.map((p) => (
                <option key={p.id} value={p.id}>{p.label}</option>
              ))}
            </select>
            <select className="input" style={{ maxWidth: 240 }} value={modo} onChange={(e) => setModo(e.target.value)}>
              {MODOS.map((m) => (
                <option key={m.id} value={m.id}>{m.label}</option>
              ))}
            </select>
            <div style={{ marginLeft: "auto", display: "flex", gap: 6 }}>
              <button className="btn btn-ghost btn-sm" onClick={() => exportar("PDF")}>Exportar PDF</button>
              <button className="btn btn-ghost btn-sm" onClick={() => exportar("Excel")}>Exportar Excel</button>
              <button className="btn btn-ghost btn-sm" onClick={() => exportar("CSV")}>Exportar CSV</button>
            </div>
          </div>

          {modo === "area" && (
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 18 }}>
              {todasLasAreas.map((a) => (
                <button
                  key={a.area}
                  type="button"
                  className={"chip-toggle" + (areasElegidas.includes(a.area) ? " active" : "")}
                  onClick={() => toggleArea(a.area)}
                >
                  {a.area} <span style={{ opacity: 0.6 }}>· {a.dependencia}</span>
                </button>
              ))}
            </div>
          )}

          <h3 style={{ fontSize: 14, marginBottom: 2 }}>
            {activo.nombre} — {MODOS.find((m) => m.id === modo)?.label}
          </h3>
          <p style={{ fontSize: 13, color: "var(--muted)", marginTop: -6 }}>{activo.descripcion}</p>

          <div className="grid grid-2" style={{ marginBottom: 16 }}>
            <div className="card card-pad stat-card" style={{ boxShadow: "none" }}>
              <div className="label">Total del periodo</div>
              <div className="value" style={{ fontSize: 20 }}>{money(totalPeriodo)}</div>
            </div>
            <div className="card card-pad stat-card" style={{ boxShadow: "none" }}>
              <div className="label">Promedio por {periodo === "dia" ? "día" : periodo === "anio" ? "año" : "mes"}</div>
              <div className="value" style={{ fontSize: 20 }}>{money(Math.round(promedio))}</div>
            </div>
          </div>

          <BarChart labels={labels} series={series} formatValue={money} />
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
