import { useState } from "react";
import { useData } from "../context/DataContext";
import { money } from "../components/UI";

const TIPO_COLOR = {
  Entrada: "var(--success)",
  Salida: "var(--primary)",
  Merma: "var(--danger)",
  "Ajuste (-)": "var(--warning)",
  "Ajuste (+)": "var(--warning)",
  "Devolución": "var(--accent)",
};

export default function Almacen() {
  const { insumos, movimientos, solicitudes, confirmarEntrega, registrarMovimiento } = useData();
  const [tab, setTab] = useState("entregas");
  const [feedback, setFeedback] = useState("");
  const [form, setForm] = useState({ tipo: "Entrada", insumoId: insumos[0]?.id ?? "", cantidad: 1, referencia: "" });
  const [showForm, setShowForm] = useState(false);

  const bajos = insumos.filter((i) => i.stock < i.minimo);
  const pendientesEntrega = solicitudes.filter((s) => s.estado === "Aprobada");

  function entregar(folio) {
    confirmarEntrega(folio);
    setFeedback(`Entrega de ${folio} confirmada. Stock e inventario actualizados.`);
    setTimeout(() => setFeedback(""), 3500);
  }

  function submitMovimiento(tipoForzado) {
    const tipo = tipoForzado || form.tipo;
    if (!form.insumoId || form.cantidad <= 0) return;
    registrarMovimiento({ tipo, insumoId: form.insumoId, cantidad: Number(form.cantidad), referencia: form.referencia });
    setFeedback(`Movimiento de ${tipo.toLowerCase()} registrado.`);
    setForm({ tipo: "Entrada", insumoId: insumos[0]?.id ?? "", cantidad: 1, referencia: "" });
    setShowForm(false);
    setTimeout(() => setFeedback(""), 3500);
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Almacén e inventario</h2>
          <p>Entradas, salidas, ajustes y entregas del inventario físico.</p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="btn btn-ghost" onClick={() => { setForm((f) => ({ ...f, tipo: "Entrada" })); setShowForm((s) => !s); }}>
            + Registrar entrada
          </button>
          <button className="btn btn-primary" onClick={() => { setForm((f) => ({ ...f, tipo: "Salida" })); setShowForm((s) => !s); }}>
            + Registrar movimiento
          </button>
        </div>
      </div>

      {feedback && <div className="toast">✓ {feedback}</div>}

      {showForm && (
        <div className="card card-pad" style={{ marginBottom: 18 }}>
          <h3 style={{ marginTop: 0, fontSize: 14 }}>Nuevo movimiento</h3>
          <div className="grid grid-4">
            <div className="field">
              <label>Tipo</label>
              <select className="input" value={form.tipo} onChange={(e) => setForm({ ...form, tipo: e.target.value })}>
                {["Entrada", "Salida", "Merma", "Ajuste (+)", "Ajuste (-)", "Devolución"].map((t) => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div className="field">
              <label>Insumo</label>
              <select className="input" value={form.insumoId} onChange={(e) => setForm({ ...form, insumoId: e.target.value })}>
                {insumos.map((i) => <option key={i.id} value={i.id}>{i.nombre}</option>)}
              </select>
            </div>
            <div className="field">
              <label>Cantidad</label>
              <input type="number" min={1} className="input" value={form.cantidad} onChange={(e) => setForm({ ...form, cantidad: e.target.value })} />
            </div>
            <div className="field">
              <label>Referencia</label>
              <input className="input" placeholder="OC-0000" value={form.referencia} onChange={(e) => setForm({ ...form, referencia: e.target.value })} />
            </div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button className="btn btn-primary" onClick={() => submitMovimiento()}>Registrar</button>
            <button className="btn btn-ghost" onClick={() => setShowForm(false)}>Cancelar</button>
          </div>
        </div>
      )}

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
            <thead><tr><th>Folio</th><th>Solicitante</th><th>Monto</th><th>Acción</th></tr></thead>
            <tbody>
              {pendientesEntrega.length === 0 && (
                <tr><td colSpan={4}><div className="empty-state"><div className="glyph">∅</div>No hay entregas pendientes.</div></td></tr>
              )}
              {pendientesEntrega.map((s) => (
                <tr key={s.folio}>
                  <td className="mono">{s.folio}</td>
                  <td>{s.solicitante}</td>
                  <td>{money(s.monto)}</td>
                  <td>
                    <button className="btn btn-ghost btn-sm">Generar vale</button>{" "}
                    <button className="btn btn-primary btn-sm" onClick={() => entregar(s.folio)}>Confirmar entrega</button>
                  </td>
                </tr>
              ))}
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
              {movimientos.map((m) => (
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
