import { useState } from "react";
import { Link } from "react-router-dom";
import { useData } from "../context/DataContext";
import { TRAMITE_TIPOS } from "../data/mockData";
import { EstadoBadge, money } from "../components/UI";

function terminaEnAlmacen(tramiteTipoId) {
  const def = TRAMITE_TIPOS.find((t) => t.id === tramiteTipoId);
  return def ? def.cadena[def.cadena.length - 1] === "Almacén" : true;
}

const TIPO_COLOR = {
  Entrada: "var(--success)",
  Salida: "var(--primary)",
  Merma: "var(--danger)",
  "Ajuste (-)": "var(--warning)",
  "Ajuste (+)": "var(--warning)",
  "Devolución": "var(--accent)",
};

export default function Almacen() {
  const { insumos, movimientos, solicitudes, documentos, confirmarEntrega, registrarMovimiento, actualizarInsumo } = useData();
  const [tab, setTab] = useState("entregas");
  const [feedback, setFeedback] = useState("");
  const [form, setForm] = useState({ tipo: "Entrada", insumoId: insumos[0]?.id ?? "", cantidad: 1, referencia: "" });
  const [showForm, setShowForm] = useState(false);
  const [editando, setEditando] = useState(null);
  const [editForm, setEditForm] = useState(null);

  const bajos = insumos.filter((i) => i.stock < i.minimo);
  const pendientesEntrega = solicitudes.filter((s) => s.estado === "Aprobada" && terminaEnAlmacen(s.tipo));

  function oficioDe(folio) {
    return documentos.find((d) => d.tipo === "Oficio de requerimiento" && d.solicitudFolio === folio);
  }

  function entregar(folio) {
    const res = confirmarEntrega(folio);
    if (res?.ok) {
      setFeedback(`Entrega de ${folio} confirmada. Stock e inventario actualizados.`);
    } else {
      setFeedback(`⚠ ${res?.reason || "No se pudo confirmar la entrega."}`);
    }
    setTimeout(() => setFeedback(""), 4000);
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

  function iniciarEdicion(insumo) {
    setEditando(insumo.id);
    setEditForm({ nombre: insumo.nombre, categoria: insumo.categoria, unidad: insumo.unidad, stock: insumo.stock, minimo: insumo.minimo, precio: insumo.precio, proveedor: insumo.proveedor });
  }

  function guardarEdicion(id) {
    actualizarInsumo(id, {
      ...editForm,
      stock: Number(editForm.stock),
      minimo: Number(editForm.minimo),
      precio: Number(editForm.precio),
    });
    setEditando(null);
    setFeedback("Insumo actualizado.");
    setTimeout(() => setFeedback(""), 3000);
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
        <div className="card table-wrap scroll-y" style={{ maxHeight: 460 }}>
          <table>
            <thead><tr><th>Folio</th><th>Solicitante</th><th>Monto</th><th>Oficio de requerimiento</th><th>Acción</th></tr></thead>
            <tbody>
              {pendientesEntrega.length === 0 && (
                <tr><td colSpan={5}><div className="empty-state"><div className="glyph">∅</div>No hay entregas pendientes.</div></td></tr>
              )}
              {pendientesEntrega.map((s) => {
                const oficio = oficioDe(s.folio);
                const firmado = oficio?.estado === "Firmado";
                return (
                  <tr key={s.folio}>
                    <td className="mono">{s.folio}</td>
                    <td>{s.solicitante}</td>
                    <td>{money(s.monto)}</td>
                    <td>
                      {oficio ? (
                        <>
                          <EstadoBadge estado={oficio.estado} />{" "}
                          {oficio.cadena && (
                            <span style={{ fontSize: 11, color: "var(--muted)" }}>
                              ({oficio.estado === "Firmado" ? `${oficio.cadena.length}/${oficio.cadena.length}` : `${oficio.pasoActual + 1}/${oficio.cadena.length} · ${oficio.cadena[oficio.pasoActual]}`})
                            </span>
                          )}
                        </>
                      ) : <span className="badge badge-neutral">Sin generar</span>}
                    </td>
                    <td>
                      {!firmado && (
                        <Link to="/oficios" className="btn btn-ghost btn-sm" style={{ marginRight: 6 }}>Ir a firmar</Link>
                      )}
                      <button className="btn btn-primary btn-sm" disabled={!firmado} title={!firmado ? "El oficio de requerimiento debe firmarse primero" : undefined} onClick={() => entregar(s.folio)}>
                        Confirmar entrega
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {tab === "inventario" && (
        <div className="card table-wrap scroll-y" style={{ maxHeight: 460 }}>
          <table>
            <thead><tr><th>Código</th><th>Insumo</th><th>Stock</th><th>Mínimo</th><th>Estado</th><th></th></tr></thead>
            <tbody>
              {insumos.map((i) => (
                editando === i.id ? (
                  <tr key={i.id}>
                    <td className="mono">{i.codigo}</td>
                    <td colSpan={4}>
                      <div className="grid grid-4" style={{ marginBottom: 8 }}>
                        <input className="input" value={editForm.nombre} onChange={(e) => setEditForm({ ...editForm, nombre: e.target.value })} />
                        <input className="input" value={editForm.categoria} onChange={(e) => setEditForm({ ...editForm, categoria: e.target.value })} />
                        <input type="number" className="input" value={editForm.stock} onChange={(e) => setEditForm({ ...editForm, stock: e.target.value })} placeholder="Stock" />
                        <input type="number" className="input" value={editForm.minimo} onChange={(e) => setEditForm({ ...editForm, minimo: e.target.value })} placeholder="Mínimo" />
                        <input type="number" className="input" value={editForm.precio} onChange={(e) => setEditForm({ ...editForm, precio: e.target.value })} placeholder="Precio" />
                        <input className="input" value={editForm.proveedor} onChange={(e) => setEditForm({ ...editForm, proveedor: e.target.value })} placeholder="Proveedor" />
                      </div>
                      <button className="btn btn-primary btn-sm" onClick={() => guardarEdicion(i.id)}>Guardar</button>{" "}
                      <button className="btn btn-ghost btn-sm" onClick={() => setEditando(null)}>Cancelar</button>
                    </td>
                  </tr>
                ) : (
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
                    <td><button className="btn btn-ghost btn-sm" onClick={() => iniciarEdicion(i)}>Editar</button></td>
                  </tr>
                )
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === "movimientos" && (
        <div className="card table-wrap scroll-y" style={{ maxHeight: 460 }}>
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
