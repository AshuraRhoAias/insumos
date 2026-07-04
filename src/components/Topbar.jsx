import { useState } from "react";
import { useApp } from "../context/AppContext";

const TITLES = {
  "/dashboard": ["Dashboard", "sicig / dashboard"],
  "/dependencias": ["Dependencias y áreas", "sicig / organización / dependencias"],
  "/catalogo": ["Catálogo de insumos", "sicig / insumos / catálogo"],
  "/solicitudes": ["Solicitudes", "sicig / solicitudes"],
  "/aprobaciones": ["Aprobaciones", "sicig / solicitudes / aprobaciones"],
  "/oficios": ["Oficios y documentos", "sicig / documentos"],
  "/almacen": ["Almacén e inventario", "sicig / almacén"],
  "/presupuesto": ["Presupuesto", "sicig / finanzas / presupuesto"],
  "/usuarios": ["Usuarios y roles", "sicig / administración / usuarios"],
  "/reportes": ["Reportes", "sicig / reportes"],
  "/auditoria": ["Auditoría", "sicig / seguridad / auditoría"],
  "/configuracion": ["Configuración", "sicig / administración / configuración"],
};

function initials(name) {
  return name.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();
}

export default function Topbar({ path }) {
  const { role, setRole, roles, user, actualizarUsuario } = useApp();
  const [title, crumb] = TITLES[path] || ["SICIG", "sicig"];
  const [showCuenta, setShowCuenta] = useState(false);
  const [form, setForm] = useState(user);
  const [feedback, setFeedback] = useState("");

  function abrirCuenta() {
    setForm(user);
    setShowCuenta(true);
  }

  function guardarCuenta() {
    actualizarUsuario(form);
    setFeedback("Datos de la cuenta actualizados.");
    setTimeout(() => setFeedback(""), 3000);
  }

  return (
    <header className="topbar">
      <div className="topbar-title">
        <h1>{title}</h1>
        <div className="breadcrumb">{crumb}</div>
      </div>
      <div className="topbar-right">
        <select
          className="role-select"
          value={role}
          onChange={(e) => setRole(e.target.value)}
          title="Simular sesión con otro rol (solo para esta vista)"
        >
          {roles.map((r) => (
            <option key={r} value={r}>
              Ver como: {r}
            </option>
          ))}
        </select>
        <button type="button" className="user-chip" style={{ border: "none", cursor: "pointer" }} onClick={abrirCuenta} title="Configurar cuenta">
          <div className="avatar">{initials(user.nombre)}</div>
          <div className="who">
            <div>{user.nombre}</div>
            <div className="role">{role} · {user.dependencia}</div>
          </div>
        </button>
      </div>

      {showCuenta && (
        <div
          style={{ position: "fixed", inset: 0, background: "rgba(28,36,48,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 30 }}
          onClick={() => setShowCuenta(false)}
        >
          <div className="card card-pad" style={{ width: 420 }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ marginTop: 0, fontSize: 15 }}>Configurar cuenta</h3>
            {feedback && <div className="toast">✓ {feedback}</div>}
            <div className="field"><label>Nombre completo</label><input className="input" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} /></div>
            <div className="field"><label>Correo institucional</label><input className="input" type="email" value={form.correo} onChange={(e) => setForm({ ...form, correo: e.target.value })} /></div>
            <div className="field"><label>Teléfono</label><input className="input" value={form.telefono} onChange={(e) => setForm({ ...form, telefono: e.target.value })} placeholder="Opcional" /></div>
            <label style={{ fontSize: 13, display: "flex", gap: 8, alignItems: "center", marginBottom: 14 }}>
              <input type="checkbox" checked={form.notificacionesCorreo} onChange={(e) => setForm({ ...form, notificacionesCorreo: e.target.checked })} />
              Recibir notificaciones por correo electrónico
            </label>
            <div className="kv"><span className="k">Número de empleado</span><span className="v mono">{user.empleado}</span></div>
            <div className="kv"><span className="k">Dependencia</span><span className="v">{user.dependencia}</span></div>
            <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
              <button className="btn btn-primary" onClick={guardarCuenta}>Guardar cambios</button>
              <button className="btn btn-ghost" onClick={() => setShowCuenta(false)}>Cerrar</button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
