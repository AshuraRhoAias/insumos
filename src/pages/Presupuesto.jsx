import { dependencias } from "../data/mockData";
import { money, ProgressBar, presupuestoColor } from "../components/UI";
import { useApp } from "../context/AppContext";

function nivel(pct) {
  if (pct > 100) return { label: "Bloqueado", color: "var(--ink)" };
  if (pct >= 95) return { label: "Crítico", color: "var(--critical)" };
  if (pct >= 85) return { label: "Precaución", color: "var(--warning)" };
  if (pct >= 70) return { label: "Advertencia", color: "var(--accent)" };
  return { label: "Saludable", color: "var(--success)" };
}

export default function Presupuesto() {
  const { role } = useApp();
  const canEdit = role === "Tesorería" || role === "Administrador";
  const totalAsignado = dependencias.reduce((s, d) => s + d.presupuesto, 0);
  const totalEjercido = dependencias.reduce((s, d) => s + d.ejercido, 0);

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Presupuesto</h2>
          <p>Asignación, ejercicio y seguimiento del presupuesto por dependencia.</p>
        </div>
        {canEdit && <button className="btn btn-primary">+ Asignar presupuesto</button>}
      </div>

      <div className="grid grid-3" style={{ marginBottom: 20 }}>
        <div className="card card-pad stat-card">
          <div className="label">Presupuesto total</div>
          <div className="value">{money(totalAsignado)}</div>
        </div>
        <div className="card card-pad stat-card">
          <div className="label">Ejercido a la fecha</div>
          <div className="value">{money(totalEjercido)}</div>
        </div>
        <div className="card card-pad stat-card">
          <div className="label">Disponible</div>
          <div className="value">{money(totalAsignado - totalEjercido)}</div>
        </div>
      </div>

      <div className="card">
        <table>
          <thead>
            <tr><th>Dependencia</th><th>Asignado</th><th>Ejercido</th><th>Avance</th><th>Nivel</th></tr>
          </thead>
          <tbody>
            {dependencias.map((d) => {
              const pct = (d.ejercido / d.presupuesto) * 100;
              const n = nivel(pct);
              return (
                <tr key={d.id}>
                  <td>{d.nombre}</td>
                  <td>{money(d.presupuesto)}</td>
                  <td>{money(d.ejercido)}</td>
                  <td style={{ width: 180 }}>
                    <ProgressBar pct={pct} color={presupuestoColor(pct)} />
                    <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 4 }}>{Math.round(pct)}%</div>
                  </td>
                  <td><span className="badge" style={{ background: "transparent", color: n.color }}>{n.label}</span></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="card card-pad" style={{ marginTop: 18 }}>
        <h3 style={{ marginTop: 0, fontSize: 14 }}>Umbrales de alerta configurados</h3>
        <div className="grid grid-4">
          <div><span className="badge badge-success">0–70%</span> Saludable</div>
          <div><span className="badge badge-warning">70–85%</span> Advertencia</div>
          <div><span className="badge" style={{ background: "var(--accent-tint)", color: "var(--accent)" }}>85–95%</span> Precaución</div>
          <div><span className="badge badge-critical">95–100%</span> Crítico</div>
        </div>
      </div>
    </div>
  );
}
