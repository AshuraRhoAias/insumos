// Datos de ejemplo para poblar la vista. En la implementación real
// estos vendrían del backend descrito en la especificación funcional.

export const dependencias = [
  {
    id: "DEP-01",
    clave: "SOS",
    nombre: "Secretaría de Obras y Servicios",
    titular: "Ing. Raúl Pineda Ochoa",
    presupuesto: 4200000,
    ejercido: 2915000,
    estado: "Activa",
    areas: ["Recursos Materiales", "Mantenimiento Urbano", "Alumbrado Público"],
  },
  {
    id: "DEP-02",
    clave: "DIF",
    nombre: "Sistema para el Desarrollo Integral de la Familia",
    titular: "Lic. Marina Cobos Reyes",
    presupuesto: 1800000,
    ejercido: 1710000,
    estado: "Activa",
    areas: ["Asistencia Social", "Centros Comunitarios"],
  },
  {
    id: "DEP-03",
    clave: "SSP",
    nombre: "Seguridad Pública y Vialidad",
    titular: "Cmdte. Héctor Salgado Luna",
    presupuesto: 6500000,
    ejercido: 6180000,
    estado: "Activa",
    areas: ["Patrullaje", "Protección Civil", "Vialidad"],
  },
  {
    id: "DEP-04",
    clave: "CTR",
    nombre: "Contraloría Interna",
    titular: "Lic. Sofía Bravo Camacho",
    presupuesto: 650000,
    ejercido: 210000,
    estado: "Suspendida",
    areas: ["Auditoría Interna"],
  },
];

export const insumos = [
  { id: "INS-1001", codigo: "PAP-A4-01", nombre: "Papel bond tamaño carta", categoria: "Oficina", unidad: "Caja", stock: 340, minimo: 80, precio: 415, proveedor: "Papelera del Centro S.A." },
  { id: "INS-1002", codigo: "TON-HP-26A", nombre: "Tóner láser HP 26A", categoria: "Cómputo", unidad: "Pieza", stock: 12, minimo: 15, precio: 1680, proveedor: "InsuTech de México" },
  { id: "INS-1003", codigo: "GAS-VER-01", nombre: "Gasolina Magna (vale)", categoria: "Combustibles", unidad: "Litro", stock: 5200, minimo: 1000, precio: 22.4, proveedor: "Estación Servicio Ote." },
  { id: "INS-1004", codigo: "UNI-CH-M", nombre: "Uniforme chaleco talla M", categoria: "Vestuario", unidad: "Pieza", stock: 0, minimo: 20, precio: 590, proveedor: "Confecciones Bravo" },
  { id: "INS-1005", codigo: "LIM-CLO-05", nombre: "Cloro industrial 5L", categoria: "Limpieza", unidad: "Bidón", stock: 64, minimo: 30, precio: 128, proveedor: "Química Reyna" },
  { id: "INS-1006", codigo: "SEÑ-VIAL-02", nombre: "Señalamiento vial reflejante", categoria: "Vialidad", unidad: "Pieza", stock: 18, minimo: 10, precio: 940, proveedor: "Señales del Bajío" },
];

export const solicitudes = [
  { folio: "SOL-2026-00142", solicitante: "Jorge Nava Ríos", dependencia: "SOS", area: "Recursos Materiales", fecha: "2026-06-28", monto: 8720, estado: "Pendiente", prioridad: "Normal", justificacion: "Reabastecimiento trimestral de papelería para oficinas administrativas." },
  { folio: "SOL-2026-00141", solicitante: "Karla Ibarra Solís", dependencia: "SSP", area: "Patrullaje", fecha: "2026-06-27", monto: 34500, estado: "Aprobada", prioridad: "Urgente", justificacion: "Reposición de vales de combustible para unidades de patrullaje nocturno." },
  { folio: "SOL-2026-00140", solicitante: "Iván Gómez Peralta", dependencia: "DIF", area: "Centros Comunitarios", fecha: "2026-06-25", monto: 5400, estado: "Rechazada", prioridad: "Normal", justificacion: "Compra de material de limpieza para centro comunitario Cuajimalpa." },
  { folio: "SOL-2026-00139", solicitante: "Renata Ojeda Cruz", dependencia: "SOS", area: "Alumbrado Público", fecha: "2026-06-24", monto: 12900, estado: "Entregada", prioridad: "Crítica", justificacion: "Señalamiento vial reflejante dañado por contingencia climática." },
  { folio: "SOL-2026-00138", solicitante: "Marco Villaseñor", dependencia: "SSP", area: "Protección Civil", fecha: "2026-06-22", monto: 2100, estado: "Corrección", prioridad: "Normal", justificacion: "Tóner para impresión de reportes de incidencias." },
];

export const aprobaciones = solicitudes
  .filter((s) => s.estado === "Pendiente" || s.estado === "Corrección")
  .map((s) => ({ ...s, nivel: "Nivel 1 · Supervisor de área", horasEspera: 6 }));

export const documentos = [
  { folio: "OF-2026-00142", tipo: "Oficio de solicitud", solicitudFolio: "SOL-2026-00142", estado: "Vigente", fecha: "2026-06-28" },
  { folio: "OF-2026-00141-A", tipo: "Oficio de autorización", solicitudFolio: "SOL-2026-00141", estado: "Vigente", fecha: "2026-06-27" },
  { folio: "VA-2026-00139", tipo: "Vale de almacén", solicitudFolio: "SOL-2026-00139", estado: "Vigente", fecha: "2026-06-24" },
  { folio: "AE-2026-00139", tipo: "Acta de entrega", solicitudFolio: "SOL-2026-00139", estado: "Vigente", fecha: "2026-06-24" },
  { folio: "RR-2026-00140", tipo: "Reporte de rechazo", solicitudFolio: "SOL-2026-00140", estado: "Vigente", fecha: "2026-06-25" },
  { folio: "OF-2026-00098", tipo: "Oficio de solicitud", solicitudFolio: "SOL-2026-00098", estado: "Sustituido", fecha: "2026-05-11" },
];

export const movimientosAlmacen = [
  { id: "MOV-3301", tipo: "Salida", insumo: "Papel bond tamaño carta", cantidad: 40, referencia: "SOL-2026-00139", fecha: "2026-06-28 09:12" },
  { id: "MOV-3300", tipo: "Entrada", insumo: "Tóner láser HP 26A", cantidad: 25, referencia: "OC-1187", fecha: "2026-06-27 16:40" },
  { id: "MOV-3299", tipo: "Merma", insumo: "Cloro industrial 5L", cantidad: 3, referencia: "Envases dañados", fecha: "2026-06-27 11:05" },
  { id: "MOV-3298", tipo: "Ajuste (-)", insumo: "Uniforme chaleco talla M", cantidad: 2, referencia: "Conteo físico junio", fecha: "2026-06-26 18:22" },
  { id: "MOV-3297", tipo: "Devolución", insumo: "Señalamiento vial reflejante", cantidad: 4, referencia: "SOL-2026-00098", fecha: "2026-06-25 10:00" },
];

export const usuarios = [
  { empleado: "EMP-04821", nombre: "Ana Torres Medina", correo: "ana.torres@alcaldia.gob.mx", dependencia: "SOS", area: "Recursos Materiales", rol: "Administrador", estado: "Activo" },
  { empleado: "EMP-03310", nombre: "Jorge Nava Ríos", correo: "jorge.nava@alcaldia.gob.mx", dependencia: "SOS", area: "Recursos Materiales", rol: "Solicitante", estado: "Activo" },
  { empleado: "EMP-02207", nombre: "Karla Ibarra Solís", correo: "karla.ibarra@alcaldia.gob.mx", dependencia: "SSP", area: "Patrullaje", rol: "Supervisor", estado: "Activo" },
  { empleado: "EMP-01190", nombre: "Héctor Salgado Luna", correo: "hector.salgado@alcaldia.gob.mx", dependencia: "SSP", area: "Dirección", rol: "Director", estado: "Activo" },
  { empleado: "EMP-00087", nombre: "Lucía Fernández Row", correo: "lucia.fernandez@alcaldia.gob.mx", dependencia: "N/A", area: "Tesorería", rol: "Tesorería", estado: "Bloqueado" },
  { empleado: "EMP-00042", nombre: "Sofía Bravo Camacho", correo: "sofia.bravo@alcaldia.gob.mx", dependencia: "CTR", area: "Auditoría Interna", rol: "Auditor", estado: "Suspendido" },
];

export const bitacora = [
  { hash: "8f2a91c4", hashPrev: "5c11e0aa", fecha: "2026-06-28 09:41:03.221", usuario: "Ana Torres Medina", rol: "Administrador", accion: "Editar", objeto: "Insumo INS-1002", ip: "10.20.4.18", ubicacion: "CDMX, MX" },
  { hash: "5c11e0aa", hashPrev: "d43b7710", fecha: "2026-06-28 09:12:44.009", usuario: "Jorge Nava Ríos", rol: "Solicitante", accion: "Crear", objeto: "Solicitud SOL-2026-00142", ip: "10.20.4.02", ubicacion: "CDMX, MX" },
  { hash: "d43b7710", hashPrev: "9a002e55", fecha: "2026-06-27 16:40:12.884", usuario: "Marco Villaseñor", rol: "Almacén", accion: "Entrada", objeto: "Movimiento MOV-3300", ip: "10.20.4.51", ubicacion: "CDMX, MX" },
  { hash: "9a002e55", hashPrev: "11ffa233", fecha: "2026-06-27 08:03:51.117", usuario: "Karla Ibarra Solís", rol: "Supervisor", accion: "Aprobar", objeto: "Solicitud SOL-2026-00141", ip: "187.190.22.4", ubicacion: "CDMX, MX" },
  { hash: "11ffa233", hashPrev: "00000000", fecha: "2026-06-25 21:18:09.500", usuario: "desconocido", rol: "—", accion: "Login fallido ×5", objeto: "Cuenta EMP-00087", ip: "203.0.113.44", ubicacion: "No reconocida", alerta: true },
];

export const reportesDisponibles = [
  { id: "RPT-1", nombre: "Consumo por dependencia", descripcion: "Gasto acumulado por dependencia y periodo." },
  { id: "RPT-2", nombre: "Insumos más solicitados", descripcion: "Ranking de productos con mayor demanda." },
  { id: "RPT-3", nombre: "Comparativo mensual", descripcion: "Tendencia de solicitudes y gasto mes a mes." },
  { id: "RPT-4", nombre: "Ejecución presupuestal", descripcion: "Presupuesto asignado vs. ejercido vs. disponible." },
  { id: "RPT-5", nombre: "Tiempos de atención", descripcion: "Duración promedio del flujo de aprobación." },
  { id: "RPT-6", nombre: "Stock crítico", descripcion: "Insumos por debajo de su mínimo configurado." },
  { id: "RPT-7", nombre: "Solicitudes rechazadas", descripcion: "Análisis de rechazos y motivos frecuentes." },
];

export const consumoMensual = [
  { mes: "Ene", monto: 210000 },
  { mes: "Feb", monto: 245000 },
  { mes: "Mar", monto: 198000 },
  { mes: "Abr", monto: 260000 },
  { mes: "May", monto: 289000 },
  { mes: "Jun", monto: 231000 },
];

// ---------------------------------------------------------------
// Series de consumo por periodo (día/mes/año) y por área/dependencia.
// Generadas de forma determinística (mismo "seed" => mismo valor) para
// que los gráficos sean estables entre renders sin necesitar backend.
// ---------------------------------------------------------------

export const todasLasAreas = dependencias.flatMap((d) =>
  d.areas.map((area) => ({ area, dependencia: d.clave, dependenciaNombre: d.nombre }))
);

const MESES = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
const ANIOS = [2023, 2024, 2025, 2026];
const DIAS_MES_ACTUAL = 30;

function hashSeed(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (h << 5) - h + str.charCodeAt(i);
    h |= 0;
  }
  return h;
}

function seededValue(seed, min, max) {
  const x = Math.sin(seed) * 10000;
  const frac = x - Math.floor(x);
  return Math.round(min + frac * (max - min));
}

/** Serie de consumo para una sola área, en el periodo pedido. */
export function consumoPorPeriodo(periodo, area) {
  const base = hashSeed(area);
  if (periodo === "dia") {
    return Array.from({ length: DIAS_MES_ACTUAL }, (_, i) => ({
      label: String(i + 1),
      monto: seededValue(base + i * 13.37, 1200, 9000),
    }));
  }
  if (periodo === "anio") {
    return ANIOS.map((y, i) => ({
      label: String(y),
      monto: seededValue(base + i * 97.1, 380000, 1450000),
    }));
  }
  return MESES.map((m, i) => ({
    label: m,
    monto: seededValue(base + i * 31.7, 38000, 145000),
  }));
}

/** Suma la serie de una lista de áreas (para comparar dependencias o el total). */
export function sumarSeries(areas, periodo) {
  const series = areas.map((a) => consumoPorPeriodo(periodo, a));
  const labels = (series[0] || consumoPorPeriodo(periodo, "__vacio__")).map((p) => p.label);
  return labels.map((label, i) => ({
    label,
    monto: series.reduce((sum, serie) => sum + serie[i].monto, 0),
  }));
}

/** Serie total (todas las áreas) para el periodo pedido. */
export function consumoTotalPorPeriodo(periodo) {
  return sumarSeries(todasLasAreas.map((a) => a.area), periodo);
}

/** Serie total por dependencia (suma de sus áreas) para el periodo pedido. */
export function consumoPorDependencia(clave, periodo) {
  const areas = todasLasAreas.filter((a) => a.dependencia === clave).map((a) => a.area);
  return sumarSeries(areas, periodo);
}

export const PERIODOS = [
  { id: "dia", label: "Por día" },
  { id: "mes", label: "Por mes" },
  { id: "anio", label: "Por año" },
];

/** Unidades solicitadas (demanda) estimadas para un insumo en el periodo. */
export function demandaInsumo(insumoId) {
  return seededValue(hashSeed(insumoId), 20, 480);
}

/** Tiempo promedio de atención (en horas) y solicitudes en trámite por área. */
export function tiempoAtencionPorArea(area) {
  const base = hashSeed(area + "::tiempo");
  return {
    horasPromedio: seededValue(base, 8, 96) / 10,
    enTramite: seededValue(base * 1.7, 1, 14),
  };
}

export function estadoBadgeClass(estado) {
  const map = {
    Pendiente: "badge-warning",
    Aprobada: "badge-success",
    Rechazada: "badge-danger",
    Entregada: "badge-primary",
    "Corrección": "badge-critical",
    Activa: "badge-success",
    Suspendida: "badge-danger",
    Activo: "badge-success",
    Bloqueado: "badge-danger",
    Suspendido: "badge-warning",
    Vigente: "badge-success",
    Sustituido: "badge-neutral",
  };
  return map[estado] || "badge-neutral";
}
