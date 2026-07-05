import { useMemo, useState } from "react";
import { TRAMITE_TIPOS } from "../data/mockData";
import { EstadoBadge, ScopeBanner, money } from "../components/UI";
import { downloadTextFile } from "../components/Charts";
import { useApp } from "../context/AppContext";
import { useData } from "../context/DataContext";
import { claveDependenciaUsuario, filtrarPorAlcance } from "../utils/alcance";

function tipoDe(tramiteTipo) {
  return TRAMITE_TIPOS.find((t) => t.id === tramiteTipo) || TRAMITE_TIPOS[0];
}

export default function Oficios() {
  const { role, user } = useApp();
  const { documentos: todosDocumentos, solicitudes, dependencias, resolverPuesto, firmarOficio } = useData();
  const [selected, setSelected] = useState(null);
  const [feedback, setFeedback] = useState("");

  function solicitudDe(folio) {
    return solicitudes.find((s) => s.folio === folio);
  }

  const depClave = claveDependenciaUsuario(dependencias, user);
  const solicitudesAlcance = useMemo(() => filtrarPorAlcance(solicitudes, role, user, depClave), [solicitudes, role, user, depClave]);
  const documentos = useMemo(() => {
    const foliosVisibles = new Set(solicitudesAlcance.map((s) => s.folio));
    return todosDocumentos.filter((d) => foliosVisibles.has(d.solicitudFolio));
  }, [todosDocumentos, solicitudesAlcance]);

  const pendientesFirma = documentos.filter((d) => d.tipo === "Oficio de requerimiento" && d.estado === "Pendiente de firma");

  function pasoActualInfo(doc) {
    if (!doc.cadena) return null;
    const sol = solicitudDe(doc.solicitudFolio);
    const paso = doc.cadena[doc.pasoActual];
    const puesto = resolverPuesto(paso, sol);
    return { paso, ...puesto };
  }

  function puedeFirmarPaso(doc) {
    if (doc.estado === "Firmado") return false;
    const info = pasoActualInfo(doc);
    return info && (role === info.rol || role === "Administrador");
  }

  function descargar(doc) {
    const sol = solicitudDe(doc.solicitudFolio);
    const lineas = [
      "MEMBRETE INSTITUCIONAL",
      `Folio: ${doc.folio}`,
      `Tipo: ${doc.tipo}${doc.tramiteTipo ? ` — ${tipoDe(doc.tramiteTipo).nombre}` : ""}`,
      `Solicitud origen: ${doc.solicitudFolio}`,
      `Fecha de emisión: ${doc.fecha}`,
      `Hash de integridad: 3f9a...${doc.folio.slice(-4).toLowerCase()}`,
      `Estado: ${doc.estado}`,
    ];
    if (sol) lineas.push(`Solicitante: ${sol.solicitante} — ${sol.area}`);
    if (doc.asunto) lineas.push(`Asunto: ${doc.asunto}`);
    (doc.firmas || []).forEach((f) => lineas.push(`Firmado — ${f.paso}: ${f.responsable} (${f.cargo}) el ${f.fecha}`));
    downloadTextFile(`${doc.folio}.txt`, lineas.join("\n"));
    setFeedback(`${doc.folio} descargado.`);
    setTimeout(() => setFeedback(""), 3000);
  }

  function firmar(doc) {
    const info = pasoActualInfo(doc);
    const esUltimo = doc.pasoActual === doc.cadena.length - 1;
    firmarOficio(doc.folio);
    if (esUltimo) {
      setFeedback(`${doc.folio} firmado por ${info.paso}. Trámite concluido — se generó el aviso de conclusión${doc.cadena[doc.cadena.length - 1] === "Almacén" ? " y Almacén ya puede entregar." : "."}`);
    } else {
      const sol = solicitudDe(doc.solicitudFolio);
      const siguiente = resolverPuesto(doc.cadena[doc.pasoActual + 1], sol);
      setFeedback(`${doc.folio} firmado por ${info.paso}. Turnado automáticamente a ${doc.cadena[doc.pasoActual + 1]} (${siguiente.responsable}).`);
    }
    setSelected(null);
    setTimeout(() => setFeedback(""), 5500);
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Oficios y documentos</h2>
          <p>Oficios de requerimiento, avisos y actas — cada uno recorre la cadena de firmas de su trámite (insumos, requisiciones, becas, autorizaciones, apoyos) hasta su conclusión.</p>
        </div>
      </div>

      <ScopeBanner role={role} />

      {feedback && <div className="toast">✓ {feedback}</div>}

      {pendientesFirma.length > 0 && (
        <div className="card card-pad" style={{ borderColor: "rgba(192,138,30,0.4)", background: "var(--warning-tint)", marginBottom: 18 }}>
          <strong style={{ fontSize: 13 }}>✎ {pendientesFirma.length} oficio(s) esperando la siguiente firma en su cadena.</strong>
        </div>
      )}

      <div className="card table-wrap scroll-y" style={{ maxHeight: 460 }}>
        <table>
          <thead>
            <tr><th>Folio</th><th>Tipo</th><th>Solicitud origen</th><th>Fecha</th><th>Progreso</th><th>Estado</th><th></th></tr>
          </thead>
          <tbody>
            {documentos.map((d) => {
              const info = d.cadena ? pasoActualInfo(d) : null;
              return (
                <tr key={d.folio}>
                  <td className="mono">{d.folio}</td>
                  <td>{d.tramiteTipo ? tipoDe(d.tramiteTipo).nombre : d.tipo}</td>
                  <td className="mono">{d.solicitudFolio}</td>
                  <td>{d.fecha}</td>
                  <td style={{ fontSize: 12 }}>
                    {d.cadena ? (d.estado === "Firmado" ? `${d.cadena.length}/${d.cadena.length} · completo` : `${d.pasoActual + 1}/${d.cadena.length} · ${info.paso}`) : "—"}
                  </td>
                  <td><EstadoBadge estado={d.estado} /></td>
                  <td>
                    <button className="btn btn-ghost btn-sm" onClick={() => setSelected(d)}>Vista previa</button>
                    {d.cadena && puedeFirmarPaso(d) && (
                      <button className="btn btn-primary btn-sm" style={{ marginLeft: 6 }} onClick={() => firmar(d)}>Firmar</button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {selected && (
        <div
          className="modal-overlay"
          style={{ position: "fixed", inset: 0, background: "rgba(28,36,48,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 20, padding: 20 }}
          onClick={() => setSelected(null)}
        >
          <div className="card folio-card modal-card" style={{ width: 560 }} onClick={(e) => e.stopPropagation()}>
            <div style={{ background: "var(--primary)", color: "#fff", padding: "14px 22px", borderRadius: "14px 14px 0 0" }}>
              <div style={{ fontWeight: 800, fontSize: 15, letterSpacing: "0.02em" }}>GOBIERNO MUNICIPAL</div>
              <div style={{ fontSize: 11.5, opacity: 0.85 }}>Sistema Integral de Control de Insumos Gubernamentales</div>
            </div>
            <div className="card-pad">
              {(() => {
                const sol = solicitudDe(selected.solicitudFolio);
                const esOficio = selected.tipo === "Oficio de requerimiento";
                return (
                  <>
                    {sol && (
                      <div style={{ fontSize: 12.5, fontWeight: 700, marginBottom: 2 }}>
                        {sol.dependencia} · {sol.area}
                      </div>
                    )}
                    <div style={{ fontSize: 11.5, color: "var(--muted)", marginBottom: 10 }}>
                      Fecha de emisión: {selected.fecha}
                    </div>
                    <div className="folio-tag">{selected.folio}</div>
                    {selected.asunto && <div style={{ fontSize: 12.5, marginTop: 4 }}><strong>ASUNTO:</strong> {selected.asunto}</div>}

                    <h3 style={{ textAlign: "center", fontSize: 14, letterSpacing: "0.04em", margin: "18px 0" }}>
                      {esOficio ? "OFICIO DE REQUERIMIENTO" : selected.tipo.toUpperCase()}
                    </h3>

                    {sol && (
                      <p style={{ fontSize: 13, lineHeight: 1.6 }}>
                        Por medio del presente se hace constar la solicitud <strong>{sol.folio}</strong>, presentada por{" "}
                        <strong>{sol.solicitante}</strong> ({sol.area}, {sol.dependencia}), con monto estimado de{" "}
                        <strong>{money(sol.monto)}</strong>. Justificación: {sol.justificacion}
                      </p>
                    )}

                    {esOficio && selected.cadena && (
                      <>
                        <h4 style={{ fontSize: 12, marginTop: 20, marginBottom: 8, color: "var(--muted)", textTransform: "uppercase" }}>
                          Cadena de firmas
                        </h4>
                        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                          {selected.cadena.map((paso, i) => {
                            const firma = selected.firmas?.find((f) => f.paso === paso);
                            const puesto = resolverPuesto(paso, sol);
                            const esActual = i === selected.pasoActual && selected.estado !== "Firmado";
                            return (
                              <div
                                key={paso}
                                className="card card-pad"
                                style={{
                                  boxShadow: "none",
                                  padding: "10px 14px",
                                  background: firma ? "var(--success-tint)" : esActual ? "var(--warning-tint)" : "var(--surface-sunken)",
                                }}
                              >
                                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5 }}>
                                  <strong>{i + 1}. {paso}</strong>
                                  <span>{firma ? `✓ Firmado ${firma.fecha}` : esActual ? "○ Turno actual" : "○ Pendiente"}</span>
                                </div>
                                <div style={{ fontSize: 11.5, color: "var(--muted)", marginTop: 2 }}>
                                  {puesto.responsable} — {puesto.cargo}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </>
                    )}

                    {!esOficio && sol && (
                      <div style={{ textAlign: "center", margin: "20px 0" }}>
                        <div style={{ fontWeight: 700, fontSize: 13 }}>ATENTAMENTE</div>
                        <div style={{ marginTop: 30, fontSize: 13 }}>{sol.solicitante}</div>
                        <div style={{ fontSize: 11.5, color: "var(--muted)" }}>{sol.area}</div>
                      </div>
                    )}
                  </>
                );
              })()}

              <div style={{ display: "flex", gap: 8, marginTop: 20, flexWrap: "wrap" }}>
                {selected.cadena && puedeFirmarPaso(selected) && (
                  <button className="btn btn-primary" onClick={() => firmar(selected)}>Firmar</button>
                )}
                <button className="btn btn-ghost" onClick={() => descargar(selected)}>Descargar</button>
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
