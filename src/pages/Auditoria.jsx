import { useState } from "react";
import { bitacora } from "../data/mockData";

export default function Auditoria() {
  const [selected, setSelected] = useState(bitacora[0]);

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Auditoría</h2>
          <p>Bitácora de todas las acciones del sistema, encadenada por hash para garantizar inmutabilidad.</p>
        </div>
        <button className="btn btn-ghost">Exportar bitácora</button>
      </div>

      <div className="toolbar">
        <input className="input" style={{ maxWidth: 260 }} placeholder="Buscar acción, usuario u objeto…" />
        <select className="input" style={{ maxWidth: 180 }}><option>Todos los usuarios</option></select>
        <select className="input" style={{ maxWidth: 180 }}><option>Todas las acciones</option></select>
      </div>

      <div className="split">
        <div className="card">
          <table>
            <thead>
              <tr><th>Hash</th><th>Fecha</th><th>Usuario</th><th>Acción</th><th>Objeto</th></tr>
            </thead>
            <tbody>
              {bitacora.map((b) => (
                <tr key={b.hash} onClick={() => setSelected(b)} style={{ cursor: "pointer", background: selected?.hash === b.hash ? "var(--surface-sunken)" : undefined }}>
                  <td className="mono" style={{ color: b.alerta ? "var(--danger)" : undefined }}>{b.hash}</td>
                  <td className="mono" style={{ fontSize: 11.5 }}>{b.fecha}</td>
                  <td>{b.usuario}</td>
                  <td>{b.accion}</td>
                  <td>{b.objeto}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {selected && (
          <div className="card card-pad">
            <h3 style={{ marginTop: 0, fontSize: 14 }}>Detalle del registro</h3>
            <div className="hash-chain" style={{ marginBottom: 14 }}>
              <span>{selected.hashPrev}</span>
              <span className="link">→</span>
              <strong style={{ color: "var(--ink)" }}>{selected.hash}</strong>
            </div>
            <div className="kv"><span className="k">Fecha</span><span className="v mono" style={{ fontSize: 12 }}>{selected.fecha}</span></div>
            <div className="kv"><span className="k">Usuario</span><span className="v">{selected.usuario}</span></div>
            <div className="kv"><span className="k">Rol</span><span className="v">{selected.rol}</span></div>
            <div className="kv"><span className="k">Acción</span><span className="v">{selected.accion}</span></div>
            <div className="kv"><span className="k">Objeto</span><span className="v">{selected.objeto}</span></div>
            <div className="kv"><span className="k">IP</span><span className="v mono">{selected.ip}</span></div>
            <div className="kv"><span className="k">Ubicación</span><span className="v">{selected.ubicacion}</span></div>
            {selected.alerta && (
              <div className="card card-pad" style={{ marginTop: 14, background: "var(--danger-tint)", border: "1px solid rgba(181,67,47,0.3)" }}>
                <strong style={{ fontSize: 12.5, color: "var(--danger)" }}>⚠ Alerta de seguridad</strong>
                <p style={{ fontSize: 12.5, margin: "4px 0 0" }}>Ubicación no reconocida para esta cuenta. Revisar posible intento no autorizado.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
