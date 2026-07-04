import { useState } from "react";
import { usuarios } from "../data/mockData";
import { EstadoBadge } from "../components/UI";

export default function Usuarios() {
  const [query, setQuery] = useState("");
  const [showForm, setShowForm] = useState(false);

  const filtrados = usuarios.filter(
    (u) => u.nombre.toLowerCase().includes(query.toLowerCase()) || u.empleado.toLowerCase().includes(query.toLowerCase())
  );

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

      {showForm && (
        <div className="card card-pad" style={{ marginBottom: 20 }}>
          <h3 style={{ marginTop: 0, fontSize: 14 }}>Alta de usuario</h3>
          <div className="grid grid-3">
            <div className="field"><label>Número de empleado</label><input className="input" placeholder="EMP-00000" /></div>
            <div className="field"><label>Nombre completo</label><input className="input" /></div>
            <div className="field"><label>Correo institucional</label><input className="input" type="email" /></div>
            <div className="field">
              <label>Dependencia</label>
              <select className="input"><option>Secretaría de Obras y Servicios</option><option>DIF</option><option>Seguridad Pública</option></select>
            </div>
            <div className="field"><label>Área</label><input className="input" /></div>
            <div className="field">
              <label>Rol</label>
              <select className="input">
                <option>Solicitante</option><option>Supervisor</option><option>Director</option>
                <option>Almacén</option><option>Tesorería</option><option>Auditor</option><option>Administrador</option>
              </select>
            </div>
          </div>
          <button className="btn btn-primary">Crear usuario y enviar credenciales</button>
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
                  {u.estado === "Bloqueado"
                    ? <button className="btn btn-ghost btn-sm">Desbloquear</button>
                    : <button className="btn btn-danger btn-sm">Suspender</button>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
