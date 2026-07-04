import { useState } from "react";
import { dependencias } from "../data/mockData";
import { EstadoBadge, money, ProgressBar, presupuestoColor } from "../components/UI";
import { useApp } from "../context/AppContext";

export default function Dependencias() {
  const { role } = useApp();
  const [selected, setSelected] = useState(dependencias[0]);
  const [query, setQuery] = useState("");
  const canManage = role === "Administrador";

  const filtered = dependencias.filter((d) =>
    d.nombre.toLowerCase().includes(query.toLowerCase()) || d.clave.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Dependencias y áreas</h2>
          <p>Estructura organizacional: dependencias, direcciones, áreas y subáreas.</p>
        </div>
        {canManage && <button className="btn btn-primary">+ Nueva dependencia</button>}
      </div>

      <div className="split">
        <div className="card">
          <div className="card-pad" style={{ paddingBottom: 12 }}>
            <input
              className="input"
              placeholder="Buscar por nombre o clave…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <table>
            <thead>
              <tr>
                <th>Clave</th>
                <th>Dependencia</th>
                <th>Titular</th>
                <th>Presupuesto</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((d) => (
                <tr key={d.id} onClick={() => setSelected(d)} style={{ cursor: "pointer" }}>
                  <td className="mono">{d.clave}</td>
                  <td>{d.nombre}</td>
                  <td>{d.titular}</td>
                  <td>{money(d.presupuesto)}</td>
                  <td><EstadoBadge estado={d.estado} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="card card-pad">
          <h3 style={{ marginTop: 0, fontSize: 14 }}>{selected.nombre}</h3>
          <div className="kv"><span className="k">Clave</span><span className="v mono">{selected.clave}</span></div>
          <div className="kv"><span className="k">Titular</span><span className="v">{selected.titular}</span></div>
          <div className="kv"><span className="k">Estado</span><span className="v"><EstadoBadge estado={selected.estado} /></span></div>
          <div className="kv"><span className="k">Áreas</span><span className="v">{selected.areas.length}</span></div>

          <div style={{ marginTop: 16 }}>
            <div className="kv" style={{ border: "none", paddingBottom: 4 }}>
              <span className="k">Presupuesto ejercido</span>
              <span className="v">{Math.round((selected.ejercido / selected.presupuesto) * 100)}%</span>
            </div>
            <ProgressBar
              pct={(selected.ejercido / selected.presupuesto) * 100}
              color={presupuestoColor((selected.ejercido / selected.presupuesto) * 100)}
            />
            <div style={{ fontSize: 11.5, color: "var(--muted)", marginTop: 6 }}>
              {money(selected.ejercido)} de {money(selected.presupuesto)}
            </div>
          </div>

          <h4 style={{ fontSize: 12.5, marginTop: 20, marginBottom: 8, color: "var(--muted)", textTransform: "uppercase" }}>
            Áreas registradas
          </h4>
          <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13 }}>
            {selected.areas.map((a) => <li key={a}>{a}</li>)}
          </ul>

          {canManage && (
            <div style={{ display: "flex", gap: 8, marginTop: 18 }}>
              <button className="btn btn-ghost btn-sm">Editar</button>
              <button className="btn btn-ghost btn-sm">+ Subárea</button>
              <button className="btn btn-danger btn-sm">Suspender</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
