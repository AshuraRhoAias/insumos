import { NavLink } from "react-router-dom";
import { useApp } from "../context/AppContext";

// Cada módulo declara qué roles lo pueden ver, replicando la idea de la
// especificación: "el menú lateral solo muestra los módulos permitidos
// según el rol". El filtrado real siempre debe vivir en el servidor;
// aquí solo se simula para propósitos de la vista.
const MODULES = [
  { to: "/dashboard", label: "Dashboard", icon: "01", roles: "all" },
  { to: "/dependencias", label: "Dependencias y áreas", icon: "02", roles: ["Administrador", "Director", "Tesorería"] },
  { to: "/catalogo", label: "Catálogo de insumos", icon: "03", roles: "all" },
  { to: "/solicitudes", label: "Solicitudes", icon: "04", roles: "all" },
  { to: "/aprobaciones", label: "Aprobaciones", icon: "05", roles: ["Supervisor", "Director", "Administrador"] },
  { to: "/oficios", label: "Oficios y documentos", icon: "06", roles: "all" },
  { to: "/almacen", label: "Almacén e inventario", icon: "07", roles: ["Almacén", "Administrador"] },
  { to: "/presupuesto", label: "Presupuesto", icon: "08", roles: ["Tesorería", "Director", "Administrador"] },
  { to: "/usuarios", label: "Usuarios y roles", icon: "09", roles: ["Administrador"] },
  { to: "/reportes", label: "Reportes", icon: "10", roles: "all" },
  { to: "/auditoria", label: "Auditoría", icon: "11", roles: ["Auditor", "Administrador"] },
  { to: "/configuracion", label: "Configuración", icon: "12", roles: ["Administrador"] },
];

export default function Sidebar() {
  const { role } = useApp();
  const visible = MODULES.filter((m) => m.roles === "all" || m.roles.includes(role));

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="sidebar-seal">GI</div>
        <div className="sidebar-brand-text">
          <div className="name">SICIG</div>
          <div className="sub">Control de Insumos</div>
        </div>
      </div>

      <nav className="sidebar-nav">
        {visible.map((m) => (
          <NavLink
            key={m.to}
            to={m.to}
            className={({ isActive }) => "sidebar-link" + (isActive ? " active" : "")}
          >
            <span className="icon">{m.icon}</span>
            <span>{m.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        Menú filtrado para el rol activo.
        <br />
        La validación real ocurre en el servidor.
      </div>
    </aside>
  );
}
