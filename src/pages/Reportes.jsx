import { useEffect, useMemo, useState } from "react";
import {
  reportesDisponibles,
  todasLasAreas,
  consumoPorPeriodo,
  consumoPorDependencia,
  consumoTotalPorPeriodo,
  sumarSeries,
  demandaInsumo,
  tiempoAtencionPorArea,
  PERIODOS,
} from "../data/mockData";
import { ScopeBanner, money } from "../components/UI";
import { useApp } from "../context/AppContext";
import { useData } from "../context/DataContext";
import { BarChart, chartSeriesToCSV, downloadTextFile } from "../components/Charts";
import { claveDependenciaUsuario, filtrarAreasPorAlcance, filtrarDependenciasPorAlcance, filtrarPorAlcance } from "../utils/alcance";

const MODOS = [
  { id: "total", label: "Todas las áreas (total)" },
  { id: "dependencia", label: "Comparar dependencias" },
  { id: "area", label: "Comparar áreas específicas" },
];

const TIENE_PERIODO = new Set(["RPT-1", "RPT-3"]);

export default function Reportes() {
  const { role, user } = useApp();
  const { insumos, solicitudes: todasSolicitudes, dependencias: todasDependencias } = useData();
  const depClave = claveDependenciaUsuario(todasDependencias, user);
  const solicitudes = filtrarPorAlcance(todasSolicitudes, role, user, depClave);
  const dependencias = filtrarDependenciasPorAlcance(todasDependencias, role, user, depClave);
  const areasVisibles = filtrarAreasPorAlcance(todasLasAreas, role, user, depClave);
  const [activo, setActivo] = useState(reportesDisponibles[0]);
  const [periodo, setPeriodo] = useState("mes");
  const [modo, setModo] = useState("total");
  const [areasElegidas, setAreasElegidas] = useState(todasLasAreas.slice(0, 3).map((a) => a.area));
  const [exportMsg, setExportMsg] = useState("");

  useEffect(() => {
    setAreasElegidas((prev) => {
      const visibles = new Set(areasVisibles.map((a) => a.area));
      const conservadas = prev.filter((a) => visibles.has(a));
      return conservadas.length ? conservadas : areasVisibles.slice(0, 3).map((a) => a.area);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role, depClave]);

  function toggleArea(area) {
    setAreasElegidas((prev) => (prev.includes(area) ? prev.filter((a) => a !== area) : [...prev, area]));
  }

  // ---------- Gráfica + tabla + resumen según el reporte elegido en el catálogo ----------
  const reporte = useMemo(() => {
    if (activo.id === "RPT-1" || activo.id === "RPT-3") {
      let labels, series;
      if (modo === "dependencia") {
        series = dependencias.map((d) => ({ name: d.clave, data: consumoPorDependencia(d.clave, periodo).map((p) => p.monto) }));
        labels = consumoPorDependencia(dependencias[0].clave, periodo).map((p) => p.label);
      } else if (modo === "area") {
        const activas = areasElegidas.length ? areasElegidas : [areasVisibles[0].area];
        series = activas.map((area) => ({ name: area, data: consumoPorPeriodo(periodo, area).map((p) => p.monto) }));
        labels = consumoPorPeriodo(periodo, activas[0]).map((p) => p.label);
      } else {
        const esGlobal = areasVisibles.length === todasLasAreas.length;
        const total = esGlobal ? consumoTotalPorPeriodo(periodo) : sumarSeries(areasVisibles.map((a) => a.area), periodo);
        labels = total.map((p) => p.label);
        series = [{ name: esGlobal ? "Total" : "Total (tu alcance)", data: total.map((p) => p.monto) }];
      }

      const porArea = areasVisibles.map((a) => {
        const serieArea = consumoPorPeriodo(periodo, a.area);
        return { area: a.area, dependencia: a.dependencia, total: serieArea.reduce((s, p) => s + p.monto, 0) };
      }).sort((a, b) => b.total - a.total);

      const cols = ["Área", "Dependencia", `Gasto (${PERIODOS.find((p) => p.id === periodo)?.label.toLowerCase()})`];
      const rows = porArea.map((a) => [a.area, a.dependencia, money(a.total)]);

      let variacion = null;
      if (activo.id === "RPT-3" && labels.length > 1) {
        const data = series[0].data;
        variacion = Math.round(((data[data.length - 1] - data[0]) / data[0]) * 100);
      }

      return {
        labels,
        series,
        cols,
        rows,
        resumen: [
          { label: "Total del periodo", value: money(series.reduce((s, ser) => s + ser.data.reduce((a, b) => a + b, 0), 0)) },
          { label: `Promedio por ${periodo === "dia" ? "día" : periodo === "anio" ? "año" : "mes"}`, value: money(Math.round(series.reduce((s, ser) => s + ser.data.reduce((a, b) => a + b, 0), 0) / labels.length)) },
          ...(variacion !== null ? [{ label: "Variación del periodo", value: `${variacion > 0 ? "+" : ""}${variacion}%` }] : []),
        ],
      };
    }

    if (activo.id === "RPT-2") {
      const ranking = insumos.map((i) => {
        const realUnidades = solicitudes.reduce((sum, s) => sum + (s.items?.find((it) => it.id === i.id)?.cantidad || 0), 0);
        const unidades = demandaInsumo(i.id) + realUnidades;
        return { ...i, unidades, gasto: unidades * i.precio };
      }).sort((a, b) => b.unidades - a.unidades).slice(0, 8);

      return {
        labels: ranking.map((i) => i.codigo),
        series: [{ name: "Unidades solicitadas", data: ranking.map((i) => i.unidades) }],
        cols: ["Insumo", "Categoría", "Unidades solicitadas", "Gasto estimado"],
        rows: ranking.map((i) => [i.nombre, i.categoria, i.unidades, money(i.gasto)]),
        resumen: [
          { label: "Insumos en ranking", value: ranking.length },
          { label: "Gasto total estimado", value: money(ranking.reduce((s, i) => s + i.gasto, 0)) },
        ],
      };
    }

    if (activo.id === "RPT-4") {
      const rows = dependencias.map((d) => {
        const pct = d.presupuesto ? Math.round((d.ejercido / d.presupuesto) * 100) : 0;
        return [d.nombre, money(d.presupuesto), money(d.ejercido), money(d.presupuesto - d.ejercido), `${pct}%`];
      });
      return {
        labels: dependencias.map((d) => d.clave),
        series: [
          { name: "Asignado", data: dependencias.map((d) => d.presupuesto) },
          { name: "Ejercido", data: dependencias.map((d) => d.ejercido) },
        ],
        cols: ["Dependencia", "Asignado", "Ejercido", "Disponible", "% ejercido"],
        rows,
        resumen: [
          { label: "Total asignado", value: money(dependencias.reduce((s, d) => s + d.presupuesto, 0)) },
          { label: "Total ejercido", value: money(dependencias.reduce((s, d) => s + d.ejercido, 0)) },
          { label: "Total disponible", value: money(dependencias.reduce((s, d) => s + (d.presupuesto - d.ejercido), 0)) },
        ],
      };
    }

    if (activo.id === "RPT-5") {
      const datos = areasVisibles.map((a) => {
        const t = tiempoAtencionPorArea(a.area);
        const enTramiteReal = solicitudes.filter((s) => s.area === a.area && (s.estado === "Pendiente" || s.estado === "Corrección"));
        const montoTramite = enTramiteReal.reduce((s, sol) => s + sol.monto, 0);
        return { ...a, ...t, enTramite: t.enTramite + enTramiteReal.length, montoTramite };
      });
      return {
        labels: datos.map((a) => a.area),
        series: [{ name: "Horas promedio", data: datos.map((a) => a.horasPromedio) }],
        cols: ["Área", "Dependencia", "Horas promedio", "En trámite", "Monto en trámite"],
        rows: datos.map((a) => [a.area, a.dependencia, `${a.horasPromedio.toFixed(1)} h`, a.enTramite, money(a.montoTramite)]),
        resumen: [
          { label: "Promedio general", value: `${(datos.reduce((s, a) => s + a.horasPromedio, 0) / datos.length).toFixed(1)} h` },
          { label: "Solicitudes en trámite", value: datos.reduce((s, a) => s + a.enTramite, 0) },
        ],
      };
    }

    if (activo.id === "RPT-6") {
      const criticos = insumos.filter((i) => i.stock < i.minimo).map((i) => ({
        ...i,
        faltante: i.minimo - i.stock,
        valorReposicion: (i.minimo - i.stock) * i.precio,
      }));
      return {
        labels: criticos.map((i) => i.codigo),
        series: [{ name: "Faltante", data: criticos.map((i) => i.faltante) }],
        cols: ["Insumo", "Categoría", "Stock", "Mínimo", "Faltante", "Valor de reposición"],
        rows: criticos.map((i) => [i.nombre, i.categoria, i.stock, i.minimo, i.faltante, money(i.valorReposicion)]),
        resumen: [
          { label: "Insumos en stock crítico", value: criticos.length },
          { label: "Valor total de reposición", value: money(criticos.reduce((s, i) => s + i.valorReposicion, 0)) },
        ],
      };
    }

    // RPT-7: Solicitudes rechazadas
    const rechazadas = solicitudes.filter((s) => s.estado === "Rechazada");
    const porDependencia = {};
    rechazadas.forEach((s) => { porDependencia[s.dependencia] = (porDependencia[s.dependencia] || 0) + 1; });
    return {
      labels: Object.keys(porDependencia).length ? Object.keys(porDependencia) : ["Sin datos"],
      series: [{ name: "Rechazadas", data: Object.keys(porDependencia).length ? Object.values(porDependencia) : [0] }],
      cols: ["Folio", "Solicitante", "Área", "Monto", "Fecha", "Justificación"],
      rows: rechazadas.map((s) => [s.folio, s.solicitante, s.area, money(s.monto), s.fecha, s.justificacion]),
      resumen: [
        { label: "Solicitudes rechazadas", value: rechazadas.length },
        { label: "Monto total rechazado", value: money(rechazadas.reduce((s, r) => s + r.monto, 0)) },
      ],
    };
  }, [activo, periodo, modo, areasElegidas, insumos, solicitudes, dependencias, areasVisibles]);

  function exportar(formato) {
    if (formato === "PDF") {
      window.print();
      return;
    }
    const csv = chartSeriesToCSV(reporte.labels, reporte.series);
    downloadTextFile(`reporte-${activo.id}-${periodo}.csv`, csv, "text/csv");
    setExportMsg(`Exportado como ${formato === "Excel" ? "CSV (compatible con Excel)" : "CSV"}.`);
    setTimeout(() => setExportMsg(""), 3000);
  }

  const mostrarControlesPeriodo = TIENE_PERIODO.has(activo.id);

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Reportes</h2>
          <p>Indicadores y reportes analíticos sobre consumo, presupuesto y tiempos de atención, desglosados por catálogo y por área.</p>
        </div>
      </div>

      <ScopeBanner role={role} />

      {exportMsg && <div className="toast">✓ {exportMsg}</div>}

      <div className="split">
        <div className="card card-pad">
          <div className="toolbar">
            {mostrarControlesPeriodo && (
              <>
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
              </>
            )}
            <div style={{ marginLeft: "auto", display: "flex", gap: 6 }}>
              <button className="btn btn-ghost btn-sm" onClick={() => exportar("PDF")}>Exportar PDF</button>
              <button className="btn btn-ghost btn-sm" onClick={() => exportar("Excel")}>Exportar Excel</button>
              <button className="btn btn-ghost btn-sm" onClick={() => exportar("CSV")}>Exportar CSV</button>
            </div>
          </div>

          {mostrarControlesPeriodo && modo === "area" && (
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 18 }}>
              {areasVisibles.map((a) => (
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

          <h3 style={{ fontSize: 14, marginBottom: 2 }}>{activo.nombre}</h3>
          <p style={{ fontSize: 13, color: "var(--muted)", marginTop: -6 }}>{activo.descripcion}</p>

          <div className="grid grid-3" style={{ marginBottom: 16 }}>
            {reporte.resumen.map((r) => (
              <div key={r.label} className="card card-pad stat-card" style={{ boxShadow: "none" }}>
                <div className="label">{r.label}</div>
                <div className="value" style={{ fontSize: 19 }}>{r.value}</div>
              </div>
            ))}
          </div>

          <BarChart labels={reporte.labels} series={reporte.series} formatValue={activo.id === "RPT-5" ? (n) => `${n} h` : money} />

          <h4 style={{ fontSize: 12.5, marginTop: 24, marginBottom: 10, color: "var(--muted)", textTransform: "uppercase" }}>
            Detalle {activo.id === "RPT-1" || activo.id === "RPT-3" ? "por área" : ""}
          </h4>
          <div className="card" style={{ boxShadow: "none" }}>
            <table>
              <thead>
                <tr>{reporte.cols.map((c) => <th key={c}>{c}</th>)}</tr>
              </thead>
              <tbody>
                {reporte.rows.length === 0 && (
                  <tr><td colSpan={reporte.cols.length}><div className="empty-state"><div className="glyph">∅</div>Sin registros para este reporte.</div></td></tr>
                )}
                {reporte.rows.map((row, i) => (
                  <tr key={i}>
                    {row.map((cell, j) => <td key={j} className={j === 0 ? "mono" : undefined}>{cell}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
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
