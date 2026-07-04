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
  const { role, setRole, roles, user } = useApp();
  const [title, crumb] = TITLES[path] || ["SICIG", "sicig"];

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
        <div className="user-chip">
          <div className="avatar">{initials(user.nombre)}</div>
          <div className="who">
            <div>{user.nombre}</div>
            <div className="role">{role} · {user.dependencia}</div>
          </div>
        </div>
      </div>
    </header>
  );
}
