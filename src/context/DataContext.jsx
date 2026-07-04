import { createContext, useContext, useMemo, useState } from "react";
import { useApp } from "./AppContext";
import {
  solicitudes as solicitudesIniciales,
  insumos as insumosIniciales,
  movimientosAlmacen as movimientosIniciales,
  usuarios as usuariosIniciales,
  dependencias as dependenciasIniciales,
  bitacora as bitacoraIniciales,
} from "../data/mockData";

// Store en memoria que simula lo que en el sistema real sería la API.
// Todas las acciones (crear, aprobar, entregar…) viven solo del lado del
// cliente y se pierden al recargar — es intencional, ver README.

const DataContext = createContext(null);

function nextFolio(solicitudes) {
  const nums = solicitudes.map((s) => Number(s.folio.split("-").pop())).filter((n) => !Number.isNaN(n));
  const next = (nums.length ? Math.max(...nums) : 0) + 1;
  return `SOL-2026-${String(next).padStart(5, "0")}`;
}

function randHash() {
  return Math.random().toString(16).slice(2, 10);
}

export function DataProvider({ children }) {
  const { user, role } = useApp();
  const [solicitudes, setSolicitudes] = useState(solicitudesIniciales);
  const [insumos, setInsumos] = useState(insumosIniciales);
  const [movimientos, setMovimientos] = useState(movimientosIniciales);
  const [usuarios, setUsuarios] = useState(usuariosIniciales);
  const [dependencias, setDependencias] = useState(dependenciasIniciales);
  const [bitacora, setBitacora] = useState(bitacoraIniciales);
  const [carrito, setCarrito] = useState([]);

  function addBitacora(accion, objeto, alerta = false) {
    setBitacora((prev) => {
      const hash = randHash();
      const entry = {
        hash,
        hashPrev: prev[0]?.hash || "00000000",
        fecha: new Date().toISOString().slice(0, 19).replace("T", " ") + ".000",
        usuario: user.nombre,
        rol: role,
        accion,
        objeto,
        ip: "10.20.4.02",
        ubicacion: "CDMX, MX",
        alerta,
      };
      return [entry, ...prev];
    });
  }

  // ---------- Carrito (compartido entre Catálogo y Solicitudes) ----------
  function agregarCarrito(insumo) {
    setCarrito((prev) => {
      const exists = prev.find((c) => c.id === insumo.id);
      if (exists) return prev.map((c) => (c.id === insumo.id ? { ...c, cantidad: c.cantidad + 1 } : c));
      return [...prev, { ...insumo, cantidad: 1 }];
    });
  }
  function actualizarCantidadCarrito(id, cantidad) {
    setCarrito((prev) => prev.map((c) => (c.id === id ? { ...c, cantidad: Math.max(1, cantidad) } : c)));
  }
  function quitarCarrito(id) {
    setCarrito((prev) => prev.filter((c) => c.id !== id));
  }
  function vaciarCarrito() {
    setCarrito([]);
  }

  // ---------- Solicitudes ----------
  function crearSolicitud({ items, justificacion, prioridad, estado = "Pendiente" }) {
    const monto = items.reduce((s, i) => s + i.precio * i.cantidad, 0);
    const nueva = {
      folio: nextFolio(solicitudes),
      solicitante: user.nombre,
      dependencia: "SOS",
      area: user.area,
      fecha: new Date().toISOString().slice(0, 10),
      monto,
      estado,
      prioridad,
      justificacion,
      items,
    };
    setSolicitudes((prev) => [nueva, ...prev]);
    addBitacora(estado === "Borrador" ? "Guardar borrador" : "Crear", `Solicitud ${nueva.folio}`);
    vaciarCarrito();
    return nueva;
  }

  function cambiarEstadoSolicitud(folio, estado, extra = {}) {
    setSolicitudes((prev) => prev.map((s) => (s.folio === folio ? { ...s, estado, ...extra } : s)));
    const acciones = {
      Aprobada: "Aprobar",
      Rechazada: "Rechazar",
      "Corrección": "Solicitar corrección",
      Entregada: "Confirmar entrega",
    };
    addBitacora(acciones[estado] || "Actualizar", `Solicitud ${folio}`);
  }

  function escalarSolicitud(folio) {
    addBitacora("Escalar", `Solicitud ${folio}`);
  }

  function confirmarEntrega(folio) {
    const sol = solicitudes.find((s) => s.folio === folio);
    if (!sol) return;
    if (sol.items && sol.items.length > 0) {
      setInsumos((prev) =>
        prev.map((i) => {
          const item = sol.items.find((it) => it.id === i.id);
          return item ? { ...i, stock: Math.max(0, i.stock - item.cantidad) } : i;
        })
      );
      setMovimientos((prev) => [
        ...sol.items.map((it, idx) => ({
          id: `MOV-${3400 + prev.length + idx}`,
          tipo: "Salida",
          insumo: it.nombre,
          cantidad: it.cantidad,
          referencia: folio,
          fecha: new Date().toISOString().slice(0, 16).replace("T", " "),
        })),
        ...prev,
      ]);
    } else {
      setMovimientos((prev) => [
        { id: `MOV-${3400 + prev.length}`, tipo: "Salida", insumo: "Varios (solicitud)", cantidad: 1, referencia: folio, fecha: new Date().toISOString().slice(0, 16).replace("T", " ") },
        ...prev,
      ]);
    }
    cambiarEstadoSolicitud(folio, "Entregada");
  }

  // ---------- Almacén ----------
  function registrarMovimiento({ tipo, insumoId, cantidad, referencia }) {
    const insumo = insumos.find((i) => i.id === insumoId);
    if (!insumo) return;
    const signo = tipo === "Entrada" || tipo === "Ajuste (+)" || tipo === "Devolución" ? 1 : -1;
    setInsumos((prev) => prev.map((i) => (i.id === insumoId ? { ...i, stock: Math.max(0, i.stock + signo * cantidad) } : i)));
    setMovimientos((prev) => [
      { id: `MOV-${3400 + prev.length}`, tipo, insumo: insumo.nombre, cantidad, referencia: referencia || "Ajuste manual", fecha: new Date().toISOString().slice(0, 16).replace("T", " ") },
      ...prev,
    ]);
    addBitacora(tipo, `Movimiento de ${insumo.nombre}`);
  }

  function crearInsumo(data) {
    const id = `INS-${1000 + insumos.length + 1}`;
    const nuevo = { id, ...data };
    setInsumos((prev) => [nuevo, ...prev]);
    addBitacora("Crear", `Insumo ${nuevo.nombre}`);
    return nuevo;
  }

  // ---------- Usuarios ----------
  function crearUsuario(data) {
    setUsuarios((prev) => [{ ...data, estado: "Activo" }, ...prev]);
    addBitacora("Crear", `Usuario ${data.empleado}`);
  }
  function cambiarEstadoUsuario(empleado, estado) {
    setUsuarios((prev) => prev.map((u) => (u.empleado === empleado ? { ...u, estado } : u)));
    addBitacora(estado === "Suspendido" ? "Suspender" : "Desbloquear", `Usuario ${empleado}`);
  }

  // ---------- Dependencias ----------
  function crearDependencia(data) {
    const id = `DEP-${String(dependencias.length + 1).padStart(2, "0")}`;
    const nueva = { id, presupuesto: 0, ejercido: 0, estado: "Activa", areas: [], ...data };
    setDependencias((prev) => [...prev, nueva]);
    addBitacora("Crear", `Dependencia ${nueva.nombre}`);
    return nueva;
  }
  function actualizarDependencia(id, cambios) {
    setDependencias((prev) => prev.map((d) => (d.id === id ? { ...d, ...cambios } : d)));
    addBitacora("Editar", `Dependencia ${id}`);
  }
  function cambiarEstadoDependencia(id, estado) {
    setDependencias((prev) => prev.map((d) => (d.id === id ? { ...d, estado } : d)));
    addBitacora(estado === "Suspendida" ? "Suspender" : "Reactivar", `Dependencia ${id}`);
  }
  function agregarSubarea(id, area) {
    setDependencias((prev) => prev.map((d) => (d.id === id ? { ...d, areas: [...d.areas, area] } : d)));
    addBitacora("Crear", `Área ${area} en ${id}`);
  }

  const aprobacionesPendientes = useMemo(
    () =>
      solicitudes
        .filter((s) => s.estado === "Pendiente" || s.estado === "Corrección")
        .map((s) => ({ ...s, nivel: "Nivel 1 · Supervisor de área", horasEspera: 6 })),
    [solicitudes]
  );

  const value = useMemo(
    () => ({
      solicitudes,
      aprobacionesPendientes,
      insumos,
      movimientos,
      usuarios,
      dependencias,
      bitacora,
      carrito,
      agregarCarrito,
      actualizarCantidadCarrito,
      quitarCarrito,
      vaciarCarrito,
      crearSolicitud,
      cambiarEstadoSolicitud,
      escalarSolicitud,
      confirmarEntrega,
      registrarMovimiento,
      crearInsumo,
      crearUsuario,
      cambiarEstadoUsuario,
      crearDependencia,
      actualizarDependencia,
      cambiarEstadoDependencia,
      agregarSubarea,
      addBitacora,
    }),
    [solicitudes, aprobacionesPendientes, insumos, movimientos, usuarios, dependencias, bitacora, carrito]
  );

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error("useData debe usarse dentro de DataProvider");
  return ctx;
}
