import { useState } from "react";
import { useLocation } from "react-router-dom";
import { insumos } from "../data/mockData";
import { EstadoBadge, money } from "../components/UI";
import { useData } from "../context/DataContext";

const ESTADOS = ["Todos", "Borrador", "Pendiente", "Aprobada", "Rechazada", "Entregada", "Corrección"];

export default function Solicitudes() {
  const location = useLocation();
  const { solicitudes, carrito, agregarCarrito, actualizarCantidadCarrito, quitarCarrito, crearSolicitud } = useData();
  const [tab, setTab] = useState(location.state?.tab === "nueva" ? "nueva" : "lista");
  const [estadoFiltro, setEstadoFiltro] = useState("Todos");
  const [justificacion, setJustificacion] = useState("");
  const [prioridad, setPrioridad] = useState("Normal");
  const [detalle, setDetalle] = useState(null);
  const [feedback, setFeedback] = useState("");

  const filtradas = solicitudes.filter((s) => estadoFiltro === "Todos" || s.estado === estadoFiltro);
  const total = carrito.reduce((sum, c) => sum + c.precio * c.cantidad, 0);
  const canSend = carrito.length > 0 && justificacion.trim().length >= 20;

  function enviar() {
    if (!canSend) return;
    const nueva = crearSolicitud({ items: carrito, justificacion, prioridad, estado: "Pendiente" });
    setJustificacion("");
    setPrioridad("Normal");
    setFeedback(`Solicitud ${nueva.folio} enviada y turnada a aprobación.`);
    setTab("lista");
    setEstadoFiltro("Todos");
    setTimeout(() => setFeedback(""), 4000);
  }

  function guardarBorrador() {
    if (carrito.length === 0) return;
    const nueva = crearSolicitud({ items: carrito, justificacion, prioridad, estado: "Borrador" });
    setJustificacion("");
    setFeedback(`Borrador ${nueva.folio} guardado.`);
    setTimeout(() => setFeedback(""), 4000);
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Solicitudes</h2>
          <p>Crea nuevas solicitudes de insumos o revisa el estado de las tuyas.</p>
        </div>
      </div>

      {feedback && <div className="toast">✓ {feedback}</div>}

      <div className="tabs">
        <button className={"tab " + (tab === "lista" ? "active" : "")} onClick={() => setTab("lista")}>Mis solicitudes</button>
        <button className={"tab " + (tab === "nueva" ? "active" : "")} onClick={() => setTab("nueva")}>
          Nueva solicitud {carrito.length > 0 && `(${carrito.length})`}
        </button>
      </div>

      {tab === "lista" && (
        <>
          <div className="toolbar">
            {ESTADOS.map((e) => (
              <button
                key={e}
                className={"btn btn-sm " + (estadoFiltro === e ? "btn-primary" : "btn-ghost")}
                onClick={() => setEstadoFiltro(e)}
              >
                {e}
              </button>
            ))}
          </div>
          <div className="card">
            <table>
              <thead>
                <tr><th>Folio</th><th>Fecha</th><th>Prioridad</th><th>Monto</th><th>Estado</th><th></th></tr>
              </thead>
              <tbody>
                {filtradas.map((s) => (
                  <tr key={s.folio}>
                    <td className="mono">{s.folio}</td>
                    <td>{s.fecha}</td>
                    <td>{s.prioridad}</td>
                    <td>{money(s.monto)}</td>
                    <td><EstadoBadge estado={s.estado} /></td>
                    <td><button className="btn btn-ghost btn-sm" onClick={() => setDetalle(s)}>Ver detalle</button></td>
                  </tr>
                ))}
                {filtradas.length === 0 && (
                  <tr><td colSpan={6}><div className="empty-state"><div className="glyph">∅</div>Sin solicitudes en este estado.</div></td></tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      {tab === "nueva" && (
        <div className="split">
          <div className="card card-pad">
            <h3 style={{ marginTop: 0, fontSize: 14 }}>Agregar insumos</h3>
            <div className="grid grid-2">
              {insumos.map((i) => (
                <div key={i.id} className="card card-pad" style={{ boxShadow: "none" }}>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{i.nombre}</div>
                  <div style={{ fontSize: 11.5, color: "var(--muted)", marginBottom: 8 }}>
                    {i.codigo} · Stock: {i.stock} · {money(i.precio)}
                  </div>
                  <button className="btn btn-ghost btn-sm" onClick={() => agregarCarrito(i)} disabled={i.stock === 0}>
                    {i.stock === 0 ? "Sin stock" : "+ Agregar"}
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="card card-pad">
            <h3 style={{ marginTop: 0, fontSize: 14 }}>Carrito de solicitud</h3>
            {carrito.length === 0 && <p style={{ fontSize: 13, color: "var(--muted)" }}>Aún no has agregado insumos.</p>}
            {carrito.map((c) => (
              <div key={c.id} className="kv">
                <span className="k">{c.nombre}</span>
                <span className="v" style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <input
                    type="number"
                    min={1}
                    className="input"
                    style={{ width: 56, padding: "4px 6px" }}
                    value={c.cantidad}
                    onChange={(e) => actualizarCantidadCarrito(c.id, Number(e.target.value))}
                  />
                  {money(c.precio * c.cantidad)}
                  <button type="button" className="btn btn-ghost btn-sm" onClick={() => quitarCarrito(c.id)}>✕</button>
                </span>
              </div>
            ))}
            {carrito.length > 0 && (
              <div className="kv" style={{ borderBottom: "none", fontWeight: 700 }}>
                <span className="k">Total estimado</span><span className="v">{money(total)}</span>
              </div>
            )}

            <div className="field" style={{ marginTop: 14 }}>
              <label>Justificación (mín. 20 caracteres)</label>
              <textarea
                className="input"
                rows={3}
                value={justificacion}
                onChange={(e) => setJustificacion(e.target.value)}
                placeholder="Describe la necesidad de este insumo…"
              />
              <span className="hint">{justificacion.length}/20</span>
            </div>

            <div className="field">
              <label>Prioridad</label>
              <select className="input" value={prioridad} onChange={(e) => setPrioridad(e.target.value)}>
                <option>Normal</option>
                <option>Urgente</option>
                <option>Crítica</option>
              </select>
            </div>

            <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
              <button className="btn btn-ghost" style={{ flex: 1, justifyContent: "center" }} onClick={guardarBorrador} disabled={carrito.length === 0}>
                Guardar borrador
              </button>
              <button className="btn btn-primary" style={{ flex: 1, justifyContent: "center" }} disabled={!canSend} onClick={enviar}>
                Enviar solicitud
              </button>
            </div>
          </div>
        </div>
      )}

      {detalle && (
        <div
          style={{ position: "fixed", inset: 0, background: "rgba(28,36,48,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 20 }}
          onClick={() => setDetalle(null)}
        >
          <div className="card card-pad folio-card" style={{ width: 440 }} onClick={(e) => e.stopPropagation()}>
            <div className="folio-tag">{detalle.folio}</div>
            <h3 style={{ marginTop: 8 }}>{detalle.solicitante}</h3>
            <div className="kv"><span className="k">Dependencia</span><span className="v">{detalle.dependencia} · {detalle.area}</span></div>
            <div className="kv"><span className="k">Fecha</span><span className="v">{detalle.fecha}</span></div>
            <div className="kv"><span className="k">Monto</span><span className="v">{money(detalle.monto)}</span></div>
            <div className="kv"><span className="k">Prioridad</span><span className="v">{detalle.prioridad}</span></div>
            <div className="kv"><span className="k">Estado</span><span className="v"><EstadoBadge estado={detalle.estado} /></span></div>
            {detalle.items && detalle.items.length > 0 && (
              <>
                <h4 style={{ fontSize: 12, marginTop: 14, marginBottom: 6, color: "var(--muted)", textTransform: "uppercase" }}>Insumos</h4>
                {detalle.items.map((it) => (
                  <div key={it.id} className="kv"><span className="k">{it.nombre} ×{it.cantidad}</span><span className="v">{money(it.precio * it.cantidad)}</span></div>
                ))}
              </>
            )}
            <h4 style={{ fontSize: 12, marginTop: 14, marginBottom: 6, color: "var(--muted)", textTransform: "uppercase" }}>Justificación</h4>
            <p style={{ fontSize: 13, margin: 0 }}>{detalle.justificacion}</p>
            <button className="btn btn-ghost" style={{ marginTop: 16 }} onClick={() => setDetalle(null)}>Cerrar</button>
          </div>
        </div>
      )}
    </div>
  );
}
