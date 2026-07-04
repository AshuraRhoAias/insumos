import { createContext, useContext, useMemo, useState } from "react";

// Este contexto simula lo que en el sistema real vendría del token JWT:
// el rol activo, con el que la vista decide qué mostrar/ocultar.
// Es solo de front — no hay validación real de servidor aquí.

const ROLES = [
  "Solicitante",
  "Supervisor",
  "Director",
  "Almacén",
  "Tesorería",
  "Auditor",
  "Administrador",
];

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [role, setRole] = useState("Administrador");
  const [user, setUser] = useState({
    nombre: "Ana Torres Medina",
    empleado: "EMP-04821",
    correo: "ana.torres@alcaldia.gob.mx",
    telefono: "",
    dependencia: "Secretaría de Obras y Servicios",
    area: "Recursos Materiales",
    notificacionesCorreo: true,
  });

  function actualizarUsuario(cambios) {
    setUser((prev) => ({ ...prev, ...cambios }));
  }

  const value = useMemo(() => ({ role, setRole, roles: ROLES, user, actualizarUsuario }), [role, user]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp debe usarse dentro de AppProvider");
  return ctx;
}
