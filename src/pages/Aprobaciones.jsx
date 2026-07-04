import { useEffect, useState } from "react";
import { EstadoBadge, money } from "../components/UI";
import { useData } from "../context/DataContext";

export default function Aprobaciones() {
  const { aprobacionesPendientes, cambiarEstadoSolicitud, escalarSolicitud } = useData();
  const [selectedFolio, setSelectedFolio] = useState(aprobacionesPendientes[0]?.folio ?? null);
  const [motivo, setMotivo] = useState("");
  const [feedback, setFeedback] = useState("");

  useEffect(() => {
    if (!aprobacionesPendientes.find((a) => a.folio === selectedFolio)) {
      setSelectedFolio(aprobacionesPendientes[0]?.folio ?? null);
      setMotivo("");
    }
  }, [aprobacionesPendientes, selectedFolio]);

  const selected = aprobacionesPendientes.find((a) => a.folio === selectedFolio) || null;

  function resolver(estado, label) {
    if (!selected) return;
    cambiarEstadoSolicitud(selected.folio, estado, estado === "Rechazada" || estado === "Corrección" ? { motivo } : {});
    setFeedback(`${label} ${selected.folio}.`);
    setMotivo("");
    setTimeout(() => setFeedback(""), 3500);
  }

  function escalar() {
    if (!selected) return;
    escalarSolicitud(selected.folio);
    setFeedback(`${selected.folio} escalada al siguiente nivel de aprobación.`);
    setTimeout(() => setFeedback(""), 3500);
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Aprobaciones</h2>
          <p>Solicitudes pendientes de tu revisión, con acceso rápido a aprobar o rechazar.</p>
        </div>
      </div>

      {feedback && <div className="toast">✓ {feedback}</div>}

      {aprobacionesPendientes.length === 0 ? (
        <div className="card"><div className="empty-state"><div className="glyph">✓</div>No tienes solicitudes pendientes de aprobación.</div></div>
      ) : (
        <div className="split">
          <div className="card">
            <table>
              <thead>
                <tr><th>Folio</th><th>Solicitante</th><th>Monto</th><th>Espera</th><th>Estado</th></tr>
              </thead>
              <tbody>
                {aprobacionesPendientes.map((a) => (
                  <tr key={a.folio} onClick={() => setSelectedFolio(a.folio)} style={{ cursor: "pointer", background: selectedFolio === a.folio ? "var(--surface-sunken)" : undefined }}>
                    <td className="mono">{a.folio}</td>
                    <td>{a.solicitante}</td>
                    <td>{money(a.monto)}</td>
                    <td>{a.horasEspera} h</td>
                    <td><EstadoBadge estado={a.estado} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {selected && (
            <div className="card card-pad folio-card">
              <div className="folio-tag">{selected.folio}</div>
              <h3 style={{ marginTop: 6 }}>{selected.solicitante}</h3>
              <div style={{ fontSize: 12.5, color: "var(--muted)", marginBottom: 12 }}>
                {selected.dependencia} · {selected.area} · {selected.nivel}
              </div>

              <div className="kv"><span className="k">Monto</span><span className="v">{money(selected.monto)}</span></div>
              <div className="kv"><span className="k">Prioridad</span><span className="v">{selected.prioridad}</span></div>
              <div className="kv"><span className="k">Fecha</span><span className="v">{selected.fecha}</span></div>

              <h4 style={{ fontSize: 12, marginTop: 16, marginBottom: 6, color: "var(--muted)", textTransform: "uppercase" }}>Justificación</h4>
              <p style={{ fontSize: 13, margin: 0 }}>{selected.justificacion}</p>

              <div className="field" style={{ marginTop: 16 }}>
                <label>Comentario / motivo (obligatorio para rechazar)</label>
                <textarea className="input" rows={2} value={motivo} onChange={(e) => setMotivo(e.target.value)} />
              </div>

              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <button className="btn btn-primary" onClick={() => resolver("Aprobada", "Aprobada")}>Aprobar</button>
                <button className="btn btn-danger" disabled={motivo.trim().length === 0} onClick={() => resolver("Rechazada", "Rechazada")}>Rechazar</button>
                <button className="btn btn-ghost" disabled={motivo.trim().length === 0} onClick={() => resolver("Corrección", "Corrección solicitada para")}>Solicitar corrección</button>
                <button className="btn btn-ghost" onClick={escalar}>Escalar</button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
