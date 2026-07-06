// Determina qué tanto de los datos ve cada rol: replica en el front la
// idea de que el menú y sus listados solo deben mostrar lo que
// corresponde a la dependencia/área de quien tiene la sesión, según su
// nivel jerárquico. La validación real de esto vive en el servidor.

export const NIVELES_ROL = {
  Solicitante: { nivel: "propio", label: "Tus propias solicitudes" },
  Supervisor: { nivel: "area", label: "Tu área" },
  Director: { nivel: "dependencia", label: "Tu dependencia" },
  "Almacén": { nivel: "global", label: "Todas las dependencias (operación central)" },
  "Tesorería": { nivel: "global", label: "Todas las dependencias (finanzas)" },
  Auditor: { nivel: "global", label: "Todas las dependencias (auditoría)" },
  Administrador: { nivel: "global", label: "Todas las dependencias (administración)" },
};

export function alcanceDe(role) {
  return NIVELES_ROL[role] || NIVELES_ROL.Administrador;
}

export function claveDependenciaUsuario(dependencias, user) {
  return dependencias.find((d) => d.nombre === user.dependencia)?.clave;
}

/**
 * Filtra una lista de registros (solicitudes, movimientos, etc. — algo
 * con .area / .dependencia / .solicitante) según el nivel del rol activo.
 */
export function filtrarPorAlcance(items, role, user, depClave) {
  const { nivel } = alcanceDe(role);
  if (nivel === "global") return items;
  if (nivel === "propio") return items.filter((i) => i.solicitante === user.nombre);
  if (nivel === "area") return items.filter((i) => i.area === user.area);
  if (nivel === "dependencia") return items.filter((i) => i.dependencia === depClave);
  return items;
}

/** Igual que filtrarPorAlcance pero para catálogos de dependencias completas. */
export function filtrarDependenciasPorAlcance(dependencias, role, user, depClave) {
  const { nivel } = alcanceDe(role);
  if (nivel === "global") return dependencias;
  return dependencias.filter((d) => d.clave === depClave);
}

/** Igual que filtrarPorAlcance pero para listas de nombres de área. */
export function filtrarAreasPorAlcance(areas, role, user, depClave) {
  const { nivel } = alcanceDe(role);
  if (nivel === "global") return areas;
  if (nivel === "propio" || nivel === "area") return areas.filter((a) => a.area === user.area);
  if (nivel === "dependencia") return areas.filter((a) => a.dependencia === depClave);
  return areas;
}
