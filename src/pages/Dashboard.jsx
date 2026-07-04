import { useApp } from "../context/AppContext";
import { solicitudes, insumos, consumoMensual } from "../data/mockData";
import { EstadoBadge, money } from "../components/UI";

const STATS_BY_ROLE = {
  Solicitante: [
    { label: "Mis solicitudes activas", value: "3" },
    { label: "Pendientes de entrega", value: "1" },
    { label: "Insumos disponibles", value: insumos.filter((i) => i.stock > 0).length.toString() },
    { label: "Notificaciones", value: "2" },
  ],
  Supervisor: [
    { label: "Por aprobar en mi área", value: "2" },
    { label: "Aprobadas esta semana", value: "9" },
    { label: "Tiempo promedio", value: "1.4 d" },
    { label: "Urgentes", value: "1" },
  ],
  Director: [
    { label: "Presupuesto ejercido", value: "69%" },
    { label: "Solicitudes del mes", value: "48" },
    { label: "Áreas activas", value: "3" },
    { label: "Alertas presupuestales", value: "1" },
  ],
  "Almacén": [
    { label: "Entregas pendientes hoy", value: "5" },
    { label: "Insumos en stock bajo", value: insumos.filter((i) => i.stock < i.minimo).length.toString() },
    { label: "Movimientos hoy", value: "12" },
    { label: "Agotados", value: insumos.filter((i) => i.stock === 0).length.toString() },
  ],
  "Tesorería": [
    { label: "Presupuesto global", value: money(13150000) },
    { label: "Ejercido a la fecha", value: money(11015000) },
    { label: "Dependencias en alerta", value: "2" },
    { label: "Bloqueadas", value: "0" },
  ],
  Auditor: [
    { label: "Eventos hoy", value: "184" },
    { label: "Alertas de seguridad", value: "1" },
    { label: "Accesos fallidos", value: "5" },
    { label: "Integridad de bitácora", value: "OK" },
  ],
  Administrador: [
    { label: "Usuarios activos", value: "128" },
    { label: "Solicitudes del mes", value: "312" },
    { label: "Dependencias", value: "4" },
    { label: "Alertas del sistema", value: "3" },
  ],
};

export default function Dashboard() {
  const { role, user } = useApp();
  const stats = STATS_BY_ROLE[role] || STATS_BY_ROLE.Administrador;
  const maxMonto = Math.max(...consumoMensual.map((m) => m.monto));

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
        <button className="btn btn-primary">+ Nueva solicitud</button>
      </div>

      <div className="grid grid-4" style={{ marginBottom: 22 }}>
        {stats.map((s) => (
          <div key={s.label} className="card card-pad stat-card">
            <div className="label">{s.label}</div>
            <div className="value">{s.value}</div>
            <div className="delta">Actualizado hace 4 min</div>
          </div>
        ))}
      </div>

      <div className="split">
        <div className="card card-pad">
          <h3 style={{ marginTop: 0, fontSize: 14 }}>Consumo mensual</h3>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 14, height: 160, padding: "10px 4px" }}>
            {consumoMensual.map((m) => (
              <div key={m.mes} style={{ flex: 1, textAlign: "center" }}>
                <div
                  style={{
                    height: `${(m.monto / maxMonto) * 120}px`,
                    background: "var(--primary)",
                    borderRadius: "4px 4px 0 0",
                    marginBottom: 8,
                  }}
                  title={money(m.monto)}
                />
                <div style={{ fontSize: 11, color: "var(--muted)" }}>{m.mes}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="card card-pad">
          <h3 style={{ marginTop: 0, fontSize: 14 }}>Notificaciones recientes</h3>
          <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 12 }}>
            <li style={{ fontSize: 13 }}>🔔 Tu solicitud <span className="mono">SOL-2026-00139</span> fue entregada.</li>
            <li style={{ fontSize: 13 }}>⚠️ Insumo <strong>Uniforme chaleco talla M</strong> está agotado.</li>
            <li style={{ fontSize: 13 }}>📄 Nuevo oficio de autorización disponible.</li>
            <li style={{ fontSize: 13 }}>💰 Dependencia SSP alcanzó 95% de presupuesto.</li>
          </ul>
        </div>
      </div>

      <div className="card" style={{ marginTop: 20 }}>
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
            {solicitudes.slice(0, 5).map((s) => (
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
    </div>
  );
}
