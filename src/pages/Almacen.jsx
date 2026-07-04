import { useState } from "react";
import { insumos, movimientosAlmacen } from "../data/mockData";

const TIPO_COLOR = {
  Entrada: "var(--success)",
  Salida: "var(--primary)",
  Merma: "var(--danger)",
  "Ajuste (-)": "var(--warning)",
  "Ajuste (+)": "var(--warning)",
  "Devolución": "var(--accent)",
};

export default function Almacen() {
  const [tab, setTab] = useState("entregas");
  const bajos = insumos.filter((i) => i.stock < i.minimo);

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Almacén e inventario</h2>
          <p>Entradas, salidas, ajustes y entregas del inventario físico.</p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="btn btn-ghost">+ Registrar entrada</button>
          <button className="btn btn-primary">+ Registrar movimiento</button>
        </div>
      </div>

      {bajos.length > 0 && (
        <div className="card card-pad" style={{ borderColor: "rgba(192,138,30,0.4)", background: "var(--warning-tint)", marginBottom: 18 }}>
          <strong style={{ fontSize: 13 }}>⚠ {bajos.length} insumo(s) por debajo del stock mínimo:</strong>{" "}
          <span style={{ fontSize: 13 }}>{bajos.map((b) => b.nombre).join(", ")}</span>
        </div>
      )}

      <div className="tabs">
        <button className={"tab " + (tab === "entregas" ? "active" : "")} onClick={() => setTab("entregas")}>Entregas pendientes</button>
        <button className={"tab " + (tab === "inventario" ? "active" : "")} onClick={() => setTab("inventario")}>Inventario general</button>
        <button className={"tab " + (tab === "movimientos" ? "active" : "")} onClick={() => setTab("movimientos")}>Movimientos</button>
      </div>

      {tab === "entregas" && (
        <div className="card">
          <table>
            <thead><tr><th>Folio</th><th>Solicitante</th><th>Insumos</th><th>Acción</th></tr></thead>
            <tbody>
              <tr>
                <td className="mono">SOL-2026-00141</td>
                <td>Karla Ibarra Solís</td>
                <td>Gasolina Magna (vale) ×120</td>
                <td>
                  <button className="btn btn-ghost btn-sm">Generar vale</button>{" "}
                  <button className="btn btn-primary btn-sm">Confirmar entrega</button>
                </td>
              </tr>
              <tr>
                <td className="mono">SOL-2026-00139</td>
                <td>Renata Ojeda Cruz</td>
                <td>Señalamiento vial reflejante ×6</td>
                <td><span className="badge badge-neutral">Ya entregada</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {tab === "inventario" && (
        <div className="card">
          <table>
            <thead><tr><th>Código</th><th>Insumo</th><th>Stock</th><th>Mínimo</th><th>Estado</th></tr></thead>
            <tbody>
              {insumos.map((i) => (
                <tr key={i.id}>
                  <td className="mono">{i.codigo}</td>
                  <td>{i.nombre}</td>
                  <td>{i.stock}</td>
                  <td>{i.minimo}</td>
                  <td>
                    {i.stock === 0
                      ? <span className="badge badge-danger">Agotado</span>
                      : i.stock < i.minimo
                        ? <span className="badge badge-warning">Bajo</span>
                        : <span className="badge badge-success">Suficiente</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === "movimientos" && (
        <div className="card">
          <table>
            <thead><tr><th>ID</th><th>Tipo</th><th>Insumo</th><th>Cantidad</th><th>Referencia</th><th>Fecha</th></tr></thead>
            <tbody>
              {movimientosAlmacen.map((m) => (
                <tr key={m.id}>
                  <td className="mono">{m.id}</td>
                  <td><span style={{ color: TIPO_COLOR[m.tipo] || "var(--ink)", fontWeight: 700, fontSize: 12.5 }}>{m.tipo}</span></td>
                  <td>{m.insumo}</td>
                  <td>{m.cantidad}</td>
                  <td className="mono">{m.referencia}</td>
                  <td>{m.fecha}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
