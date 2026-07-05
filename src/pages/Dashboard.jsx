import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { useData } from "../context/DataContext";
import { consumoTotalPorPeriodo, consumoPorDependencia, PERIODOS } from "../data/mockData";
import { EstadoBadge, ScopeBanner, money } from "../components/UI";
import { BarChart } from "../components/Charts";
import { claveDependenciaUsuario, filtrarDependenciasPorAlcance, filtrarPorAlcance } from "../utils/alcance";

const ESTADOS_ORDEN = ["Borrador", "Pendiente", "Corrección", "Aprobada", "Rechazada", "Entregada"];

export default function Dashboard() {
  const { role, user } = useApp();
  const { solicitudes, insumos, dependencias, bitacora } = useData();
  const navigate = useNavigate();
  const [periodo, setPeriodo] = useState("mes");

  const depClave = claveDependenciaUsuario(dependencias, user);
  const solicitudesAlcance = useMemo(() => filtrarPorAlcance(solicitudes, role, user, depClave), [solicitudes, role, user, depClave]);
  const dependenciasAlcance = useMemo(() => filtrarDependenciasPorAlcance(dependencias, role, user, depClave), [dependencias, role, user, depClave]);

  const stats = useMemo(() => {
    const solicitudes = solicitudesAlcance;
    const pendientes = solicitudes.filter((s) => s.estado === "Pendiente" || s.estado === "Corrección");
    const aprobadasSemana = solicitudes.filter((s) => s.estado === "Aprobada" || s.estado === "Entregada").length;
    const disponibles = insumos.filter((i) => i.stock > 0).length;
    const bajos = insumos.filter((i) => i.stock < i.minimo).length;
    const agotados = insumos.filter((i) => i.stock === 0).length;

    return {
      Solicitante: [
        { label: "Mis solicitudes activas", value: pendientes.length.toString() },
        { label: "Pendientes de entrega", value: solicitudes.filter((s) => s.estado === "Aprobada").length.toString() },
        { label: "Insumos disponibles", value: disponibles.toString() },
        { label: "Notificaciones", value: bitacora.length.toString() },
      ],
      Supervisor: [
        { label: "Por aprobar en mi área", value: pendientes.length.toString() },
        { label: "Aprobadas esta semana", value: aprobadasSemana.toString() },
        { label: "Tiempo promedio", value: "1.4 d" },
        { label: "Urgentes", value: solicitudes.filter((s) => s.prioridad === "Urgente" || s.prioridad === "Crítica").length.toString() },
      ],
      Director: [
        { label: "Presupuesto ejercido", value: "69%" },
        { label: "Solicitudes del mes", value: solicitudes.length.toString() },
        { label: "Áreas de mi dependencia", value: (dependenciasAlcance[0]?.areas.length ?? 0).toString() },
        { label: "Alertas presupuestales", value: "1" },
      ],
      "Almacén": [
        { label: "Entregas pendientes hoy", value: solicitudes.filter((s) => s.estado === "Aprobada").length.toString() },
        { label: "Insumos en stock bajo", value: bajos.toString() },
        { label: "Movimientos hoy", value: "12" },
        { label: "Agotados", value: agotados.toString() },
      ],
      "Tesorería": [
        { label: "Presupuesto global", value: money(13150000) },
        { label: "Ejercido a la fecha", value: money(11015000) },
        { label: "Dependencias en alerta", value: "2" },
        { label: "Bloqueadas", value: "0" },
      ],
      Auditor: [
        { label: "Eventos hoy", value: bitacora.length.toString() },
        { label: "Alertas de seguridad", value: bitacora.filter((b) => b.alerta).length.toString() },
        { label: "Accesos fallidos", value: "5" },
        { label: "Integridad de bitácora", value: "OK" },
      ],
      Administrador: [
        { label: "Usuarios activos", value: "128" },
        { label: "Solicitudes del mes", value: solicitudes.length.toString() },
        { label: "Dependencias", value: dependenciasAlcance.length.toString() },
        { label: "Alertas del sistema", value: "3" },
      ],
    };
  }, [solicitudesAlcance, dependenciasAlcance, insumos, bitacora]);

  const statsRol = stats[role] || stats.Administrador;
  const consumo = consumoTotalPorPeriodo(periodo);
  const notificaciones = bitacora.slice(0, 4);

  // 2. Consumo anual por dependencia (limitado a las dependencias visibles según el nivel del rol)
  const consumoDependencias = useMemo(
    () => dependenciasAlcance.map((d) => ({ clave: d.clave, total: consumoPorDependencia(d.clave, "mes").reduce((s, m) => s + m.monto, 0) })),
    [dependenciasAlcance]
  );

  // 3. Solicitudes por estado (dinámico, refleja acciones de la sesión, dentro del alcance del rol)
  const porEstado = useMemo(() => {
    const conteo = Object.fromEntries(ESTADOS_ORDEN.map((e) => [e, 0]));
    solicitudesAlcance.forEach((s) => { conteo[s.estado] = (conteo[s.estado] || 0) + 1; });
    return ESTADOS_ORDEN.map((e) => ({ estado: e, total: conteo[e] }));
  }, [solicitudesAlcance]);

  // 4. Presupuesto asignado vs ejercido por dependencia (dinámico, mismo alcance)
  const presupuestoDeps = dependenciasAlcance;

  // 5. Insumos por categoría (dinámico)
  const porCategoria = useMemo(() => {
    const grupos = {};
    insumos.forEach((i) => { grupos[i.categoria] = (grupos[i.categoria] || 0) + i.stock; });
    return Object.entries(grupos).map(([categoria, stock]) => ({ categoria, stock }));
  }, [insumos]);

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Hola, {user.nombre.split(" ")[0]}</h2>
          <p>
            Vista adaptada al rol <strong>{role}</strong>. El menú lateral y las tarjetas
            cambian según los permisos configurados para cada rol.
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => navigate("/solicitudes", { state: { tab: "nueva" } })}>
          + Nueva solicitud
        </button>
      </div>

      <ScopeBanner role={role} />

      <div className="grid grid-4" style={{ marginBottom: 22 }}>
        {statsRol.map((s) => (
          <div key={s.label} className="card card-pad stat-card">
            <div className="label">{s.label}</div>
            <div className="value">{s.value}</div>
            <div className="delta">Actualizado en esta sesión</div>
          </div>
        ))}
      </div>

      <div className="card card-pad" style={{ marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
          <h3 style={{ marginTop: 0, fontSize: 14 }}>1 · Consumo — todas las áreas</h3>
          <select className="input" style={{ maxWidth: 150 }} value={periodo} onChange={(e) => setPeriodo(e.target.value)}>
            {PERIODOS.map((p) => (
              <option key={p.id} value={p.id}>{p.label}</option>
            ))}
          </select>
        </div>
        <BarChart labels={consumo.map((m) => m.label)} series={[{ name: "Consumo", data: consumo.map((m) => m.monto) }]} formatValue={money} height={170} />
      </div>

      <div className="grid grid-2" style={{ marginBottom: 20 }}>
        <div className="card card-pad">
          <h3 style={{ marginTop: 0, fontSize: 14 }}>2 · Consumo anual por dependencia</h3>
          <BarChart
            labels={consumoDependencias.map((d) => d.clave)}
            series={[{ name: "Consumo anual", data: consumoDependencias.map((d) => d.total) }]}
            formatValue={money}
            height={170}
          />
        </div>

        <div className="card card-pad">
          <h3 style={{ marginTop: 0, fontSize: 14 }}>3 · Solicitudes por estado</h3>
          <BarChart
            labels={porEstado.map((e) => e.estado)}
            series={[{ name: "Solicitudes", data: porEstado.map((e) => e.total) }]}
            height={170}
          />
        </div>
      </div>

      <div className="grid grid-2" style={{ marginBottom: 20 }}>
        <div className="card card-pad">
          <h3 style={{ marginTop: 0, fontSize: 14 }}>4 · Presupuesto asignado vs. ejercido</h3>
          <BarChart
            labels={presupuestoDeps.map((d) => d.clave)}
            series={[
              { name: "Asignado", data: presupuestoDeps.map((d) => d.presupuesto) },
              { name: "Ejercido", data: presupuestoDeps.map((d) => d.ejercido) },
            ]}
            formatValue={money}
            height={170}
          />
        </div>

        <div className="card card-pad">
          <h3 style={{ marginTop: 0, fontSize: 14 }}>5 · Stock por categoría de insumo</h3>
          <BarChart
            labels={porCategoria.map((c) => c.categoria)}
            series={[{ name: "Stock", data: porCategoria.map((c) => c.stock) }]}
            height={170}
          />
        </div>
      </div>

      <div className="split">
        <div className="card">
          <div className="card-pad" style={{ paddingBottom: 0 }}>
            <h3 style={{ marginTop: 0, fontSize: 14 }}>Solicitudes recientes</h3>
          </div>
          <table>
            <thead>
              <tr>
                <th>Folio</th>
                <th>Solicitante</th>
                <th>Dependencia</th>
                <th>Fecha</th>
                <th>Monto</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {solicitudesAlcance.length === 0 && (
                <tr><td colSpan={6}><div className="empty-state"><div className="glyph">∅</div>Sin solicitudes en tu alcance.</div></td></tr>
              )}
              {solicitudesAlcance.slice(0, 5).map((s) => (
                <tr key={s.folio}>
                  <td className="mono">{s.folio}</td>
                  <td>{s.solicitante}</td>
                  <td>{s.dependencia}</td>
                  <td>{s.fecha}</td>
                  <td>{money(s.monto)}</td>
                  <td><EstadoBadge estado={s.estado} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="card card-pad">
          <h3 style={{ marginTop: 0, fontSize: 14 }}>Notificaciones recientes</h3>
          {notificaciones.length === 0 ? (
            <p style={{ fontSize: 13, color: "var(--muted)" }}>Sin actividad reciente en esta sesión.</p>
          ) : (
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 12 }}>
              {notificaciones.map((n) => (
                <li key={n.hash} style={{ fontSize: 13 }}>
                  {n.alerta ? "⚠️" : "🔔"} <strong>{n.accion}</strong> — {n.objeto}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
