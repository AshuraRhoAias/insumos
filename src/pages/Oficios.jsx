import { useState } from "react";
import { documentos } from "../data/mockData";
import { EstadoBadge } from "../components/UI";
import { downloadTextFile } from "../components/Charts";

export default function Oficios() {
  const [selected, setSelected] = useState(null);
  const [feedback, setFeedback] = useState("");

  function descargar(doc) {
    const contenido = [
      "MEMBRETE INSTITUCIONAL",
      `Folio: ${doc.folio}`,
      `Tipo: ${doc.tipo}`,
      `Solicitud origen: ${doc.solicitudFolio}`,
      `Fecha de emisión: ${doc.fecha}`,
      `Hash de integridad: 3f9a...${doc.folio.slice(-4).toLowerCase()}`,
      `Estado: ${doc.estado}`,
    ].join("\n");
    downloadTextFile(`${doc.folio}.txt`, contenido);
    setFeedback(`${doc.folio} descargado.`);
    setTimeout(() => setFeedback(""), 3000);
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Oficios y documentos</h2>
          <p>Documentos oficiales generados por el sistema: oficios, vales y actas, cada uno con folio, hash de integridad y código QR de validación.</p>
        </div>
      </div>

      {feedback && <div className="toast">✓ {feedback}</div>}

      <div className="card">
        <table>
          <thead>
            <tr><th>Folio</th><th>Tipo</th><th>Solicitud origen</th><th>Fecha</th><th>Estado</th><th></th></tr>
          </thead>
          <tbody>
            {documentos.map((d) => (
              <tr key={d.folio}>
                <td className="mono">{d.folio}</td>
                <td>{d.tipo}</td>
                <td className="mono">{d.solicitudFolio}</td>
                <td>{d.fecha}</td>
                <td><EstadoBadge estado={d.estado} /></td>
                <td>
                  <button className="btn btn-ghost btn-sm" onClick={() => setSelected(d)}>Vista previa</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selected && (
        <div
          style={{ position: "fixed", inset: 0, background: "rgba(28,36,48,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 20 }}
          onClick={() => setSelected(null)}
        >
          <div className="card folio-card" style={{ width: 460 }} onClick={(e) => e.stopPropagation()}>
            <div className="card-pad">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <div className="folio-tag">{selected.folio}</div>
                  <h3 style={{ margin: "6px 0 2px" }}>{selected.tipo}</h3>
                  <div style={{ fontSize: 12, color: "var(--muted)" }}>Solicitud origen: {selected.solicitudFolio}</div>
                </div>
                <div style={{ width: 64, height: 64, border: "1px solid var(--line-strong)", borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--muted)", textAlign: "center" }}>
                  QR<br/>válido
                </div>
              </div>

              <div style={{ background: "var(--surface-sunken)", borderRadius: 8, padding: 16, margin: "16px 0", fontFamily: "var(--font-mono)", fontSize: 11.5, color: "var(--ink-soft)", lineHeight: 1.7 }}>
                MEMBRETE INSTITUCIONAL<br />
                Folio: {selected.folio}<br />
                Fecha de emisión: {selected.fecha}<br />
                Hash de integridad: 3f9a...{selected.folio.slice(-4).toLowerCase()}<br />
                Estado: {selected.estado}
              </div>

              <div className="kv"><span className="k">Estado del documento</span><span className="v"><EstadoBadge estado={selected.estado} /></span></div>
              <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
                <button className="btn btn-primary" onClick={() => descargar(selected)}>Descargar PDF</button>
                <button className="btn btn-ghost" onClick={() => window.print()}>Imprimir</button>
                <button className="btn btn-ghost" onClick={() => setSelected(null)}>Cerrar</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
