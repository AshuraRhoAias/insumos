import { useState } from "react";
import { EstadoBadge, money, ProgressBar, presupuestoColor } from "../components/UI";
import { useApp } from "../context/AppContext";
import { useData } from "../context/DataContext";

const NUEVA_INICIAL = { clave: "", nombre: "", titular: "", presupuesto: 0 };

export default function Dependencias() {
  const { role } = useApp();
  const { dependencias, crearDependencia, actualizarDependencia, cambiarEstadoDependencia, agregarSubarea } = useData();
  const [selectedId, setSelectedId] = useState(dependencias[0]?.id);
  const [query, setQuery] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [nueva, setNueva] = useState(NUEVA_INICIAL);
  const [editando, setEditando] = useState(false);
  const [edit, setEdit] = useState({ titular: "", presupuesto: 0 });
  const [feedback, setFeedback] = useState("");
  const canManage = role === "Administrador";

  const selected = dependencias.find((d) => d.id === selectedId) || dependencias[0];
  const filtered = dependencias.filter((d) =>
    d.nombre.toLowerCase().includes(query.toLowerCase()) || d.clave.toLowerCase().includes(query.toLowerCase())
  );

  function crear() {
    if (!nueva.clave.trim() || !nueva.nombre.trim()) return;
    const creada = crearDependencia({ ...nueva, presupuesto: Number(nueva.presupuesto) });
    setSelectedId(creada.id);
    setNueva(NUEVA_INICIAL);
    setShowForm(false);
    setFeedback(`Dependencia ${creada.nombre} creada.`);
    setTimeout(() => setFeedback(""), 3500);
  }

  function iniciarEdicion() {
    setEdit({ titular: selected.titular, presupuesto: selected.presupuesto });
    setEditando(true);
  }

  function guardarEdicion() {
    actualizarDependencia(selected.id, { titular: edit.titular, presupuesto: Number(edit.presupuesto) });
    setEditando(false);
    setFeedback("Dependencia actualizada.");
    setTimeout(() => setFeedback(""), 3000);
  }

  function nuevaSubarea() {
    const nombre = window.prompt("Nombre de la nueva área:");
    if (nombre && nombre.trim()) {
      agregarSubarea(selected.id, nombre.trim());
      setFeedback(`Área "${nombre.trim()}" agregada a ${selected.clave}.`);
      setTimeout(() => setFeedback(""), 3500);
    }
  }

  function toggleSuspension() {
    cambiarEstadoDependencia(selected.id, selected.estado === "Suspendida" ? "Activa" : "Suspendida");
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Dependencias y áreas</h2>
          <p>Estructura organizacional: dependencias, direcciones, áreas y subáreas.</p>
        </div>
        {canManage && (
          <button className="btn btn-primary" onClick={() => setShowForm((s) => !s)}>
            {showForm ? "Cerrar formulario" : "+ Nueva dependencia"}
          </button>
        )}
      </div>

      {feedback && <div className="toast">✓ {feedback}</div>}

      {showForm && (
        <div className="card card-pad" style={{ marginBottom: 18 }}>
          <h3 style={{ marginTop: 0, fontSize: 14 }}>Alta de dependencia</h3>
          <div className="grid grid-3">
            <div className="field"><label>Clave</label><input className="input" value={nueva.clave} onChange={(e) => setNueva({ ...nueva, clave: e.target.value.toUpperCase() })} /></div>
            <div className="field"><label>Nombre</label><input className="input" value={nueva.nombre} onChange={(e) => setNueva({ ...nueva, nombre: e.target.value })} /></div>
            <div className="field"><label>Titular</label><input className="input" value={nueva.titular} onChange={(e) => setNueva({ ...nueva, titular: e.target.value })} /></div>
            <div className="field"><label>Presupuesto asignado</label><input type="number" className="input" value={nueva.presupuesto} onChange={(e) => setNueva({ ...nueva, presupuesto: e.target.value })} /></div>
          </div>
          <button className="btn btn-primary" disabled={!nueva.clave.trim() || !nueva.nombre.trim()} onClick={crear}>Guardar dependencia</button>
        </div>
      )}

      <div className="split">
        <div className="card">
          <div className="card-pad" style={{ paddingBottom: 12 }}>
            <input
              className="input"
              placeholder="Buscar por nombre o clave…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <table>
            <thead>
              <tr>
                <th>Clave</th>
                <th>Dependencia</th>
                <th>Titular</th>
                <th>Presupuesto</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((d) => (
                <tr key={d.id} onClick={() => { setSelectedId(d.id); setEditando(false); }} style={{ cursor: "pointer", background: selected?.id === d.id ? "var(--surface-sunken)" : undefined }}>
                  <td className="mono">{d.clave}</td>
                  <td>{d.nombre}</td>
                  <td>{d.titular}</td>
                  <td>{money(d.presupuesto)}</td>
                  <td><EstadoBadge estado={d.estado} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {selected && (
          <div className="card card-pad">
            <h3 style={{ marginTop: 0, fontSize: 14 }}>{selected.nombre}</h3>
            <div className="kv"><span className="k">Clave</span><span className="v mono">{selected.clave}</span></div>

            {editando ? (
              <>
                <div className="field"><label>Titular</label><input className="input" value={edit.titular} onChange={(e) => setEdit({ ...edit, titular: e.target.value })} /></div>
                <div className="field"><label>Presupuesto</label><input type="number" className="input" value={edit.presupuesto} onChange={(e) => setEdit({ ...edit, presupuesto: e.target.value })} /></div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button className="btn btn-primary btn-sm" onClick={guardarEdicion}>Guardar</button>
                  <button className="btn btn-ghost btn-sm" onClick={() => setEditando(false)}>Cancelar</button>
                </div>
              </>
            ) : (
              <div className="kv"><span className="k">Titular</span><span className="v">{selected.titular}</span></div>
            )}

            <div className="kv"><span className="k">Estado</span><span className="v"><EstadoBadge estado={selected.estado} /></span></div>
            <div className="kv"><span className="k">Áreas</span><span className="v">{selected.areas.length}</span></div>

            <div style={{ marginTop: 16 }}>
              <div className="kv" style={{ border: "none", paddingBottom: 4 }}>
                <span className="k">Presupuesto ejercido</span>
                <span className="v">{Math.round((selected.ejercido / (selected.presupuesto || 1)) * 100)}%</span>
              </div>
              <ProgressBar
                pct={(selected.ejercido / (selected.presupuesto || 1)) * 100}
                color={presupuestoColor((selected.ejercido / (selected.presupuesto || 1)) * 100)}
              />
              <div style={{ fontSize: 11.5, color: "var(--muted)", marginTop: 6 }}>
                {money(selected.ejercido)} de {money(selected.presupuesto)}
              </div>
            </div>

            <h4 style={{ fontSize: 12.5, marginTop: 20, marginBottom: 8, color: "var(--muted)", textTransform: "uppercase" }}>
              Áreas registradas
            </h4>
            <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13 }}>
              {selected.areas.map((a) => <li key={a}>{a}</li>)}
            </ul>

            {canManage && !editando && (
              <div style={{ display: "flex", gap: 8, marginTop: 18, flexWrap: "wrap" }}>
                <button className="btn btn-ghost btn-sm" onClick={iniciarEdicion}>Editar</button>
                <button className="btn btn-ghost btn-sm" onClick={nuevaSubarea}>+ Subárea</button>
                <button className={"btn btn-sm " + (selected.estado === "Suspendida" ? "btn-ghost" : "btn-danger")} onClick={toggleSuspension}>
                  {selected.estado === "Suspendida" ? "Reactivar" : "Suspender"}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
