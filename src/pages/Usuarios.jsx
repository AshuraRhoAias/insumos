import { useState } from "react";
import { EstadoBadge } from "../components/UI";
import { useData } from "../context/DataContext";

const NUEVO_INICIAL = {
  empleado: "",
  nombre: "",
  correo: "",
  dependencia: "Secretaría de Obras y Servicios",
  area: "",
  rol: "Solicitante",
};

export default function Usuarios() {
  const { usuarios, crearUsuario, cambiarEstadoUsuario } = useData();
  const [query, setQuery] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [nuevo, setNuevo] = useState(NUEVO_INICIAL);
  const [feedback, setFeedback] = useState("");

  const filtrados = usuarios.filter(
    (u) => u.nombre.toLowerCase().includes(query.toLowerCase()) || u.empleado.toLowerCase().includes(query.toLowerCase())
  );

  const puedeCrear = nuevo.empleado.trim() && nuevo.nombre.trim() && nuevo.correo.trim() && nuevo.area.trim();

  function crear() {
    if (!puedeCrear) return;
    crearUsuario(nuevo);
    setFeedback(`Usuario ${nuevo.nombre} creado y credenciales enviadas a ${nuevo.correo}.`);
    setNuevo(NUEVO_INICIAL);
    setShowForm(false);
    setTimeout(() => setFeedback(""), 4000);
  }

  function toggleEstado(u) {
    cambiarEstadoUsuario(u.empleado, u.estado === "Bloqueado" || u.estado === "Suspendido" ? "Activo" : "Suspendido");
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Usuarios y roles</h2>
          <p>Altas, edición y control de acceso de las cuentas del sistema.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm((s) => !s)}>
          {showForm ? "Cerrar formulario" : "+ Nuevo usuario"}
        </button>
      </div>

      {feedback && <div className="toast">✓ {feedback}</div>}

      {showForm && (
        <div className="card card-pad" style={{ marginBottom: 20 }}>
          <h3 style={{ marginTop: 0, fontSize: 14 }}>Alta de usuario</h3>
          <div className="grid grid-3">
            <div className="field"><label>Número de empleado</label><input className="input" placeholder="EMP-00000" value={nuevo.empleado} onChange={(e) => setNuevo({ ...nuevo, empleado: e.target.value })} /></div>
            <div className="field"><label>Nombre completo</label><input className="input" value={nuevo.nombre} onChange={(e) => setNuevo({ ...nuevo, nombre: e.target.value })} /></div>
            <div className="field"><label>Correo institucional</label><input className="input" type="email" value={nuevo.correo} onChange={(e) => setNuevo({ ...nuevo, correo: e.target.value })} /></div>
            <div className="field">
              <label>Dependencia</label>
              <select className="input" value={nuevo.dependencia} onChange={(e) => setNuevo({ ...nuevo, dependencia: e.target.value })}>
                <option>Secretaría de Obras y Servicios</option><option>DIF</option><option>Seguridad Pública</option>
              </select>
            </div>
            <div className="field"><label>Área</label><input className="input" value={nuevo.area} onChange={(e) => setNuevo({ ...nuevo, area: e.target.value })} /></div>
            <div className="field">
              <label>Rol</label>
              <select className="input" value={nuevo.rol} onChange={(e) => setNuevo({ ...nuevo, rol: e.target.value })}>
                <option>Solicitante</option><option>Supervisor</option><option>Director</option>
                <option>Almacén</option><option>Tesorería</option><option>Auditor</option><option>Administrador</option>
              </select>
            </div>
          </div>
          <button className="btn btn-primary" disabled={!puedeCrear} onClick={crear}>Crear usuario y enviar credenciales</button>
        </div>
      )}

      <div className="toolbar">
        <input className="input" style={{ maxWidth: 300 }} placeholder="Buscar por nombre o número de empleado…" value={query} onChange={(e) => setQuery(e.target.value)} />
      </div>

      <div className="card">
        <table>
          <thead>
            <tr><th>Empleado</th><th>Nombre</th><th>Dependencia</th><th>Rol</th><th>Estado</th><th></th></tr>
          </thead>
          <tbody>
            {filtrados.map((u) => (
              <tr key={u.empleado}>
                <td className="mono">{u.empleado}</td>
                <td>{u.nombre}</td>
                <td>{u.dependencia} · {u.area}</td>
                <td><span className="badge badge-primary">{u.rol}</span></td>
                <td><EstadoBadge estado={u.estado} /></td>
                <td style={{ display: "flex", gap: 6 }}>
                  <button className="btn btn-ghost btn-sm">Editar</button>
                  {u.estado === "Bloqueado" || u.estado === "Suspendido"
                    ? <button className="btn btn-ghost btn-sm" onClick={() => toggleEstado(u)}>Desbloquear</button>
                    : <button className="btn btn-danger btn-sm" onClick={() => toggleEstado(u)}>Suspender</button>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
