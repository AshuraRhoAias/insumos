import { useState } from "react";

const SECCIONES = [
  "Categorías de insumos",
  "Proveedores",
  "Unidades de medida",
  "Flujos de aprobación",
  "Políticas de seguridad",
  "Plantillas de documentos",
  "Alertas automáticas",
];

const NIVELES_INICIALES = [
  { nivel: "Nivel 1", rol: "Supervisor de área", monto: "hasta $10,000", tiempo: "48 h" },
  { nivel: "Nivel 2", rol: "Director de dependencia", monto: "hasta $50,000", tiempo: "72 h" },
  { nivel: "Nivel 3", rol: "Tesorería", monto: "más de $50,000", tiempo: "96 h" },
];

export default function Configuracion() {
  const [seccion, setSeccion] = useState(SECCIONES[3]);
  const [niveles, setNiveles] = useState(NIVELES_INICIALES);
  const [umbrales, setUmbrales] = useState({ stockMinimo: "15", advertencia: "70%", critico: "95%" });
  const [feedback, setFeedback] = useState("");

  function agregarNivel() {
    setNiveles((prev) => [
      ...prev,
      { nivel: `Nivel ${prev.length + 1}`, rol: "Por definir", monto: "—", tiempo: "—" },
    ]);
  }

  function guardar() {
    setFeedback("Cambios guardados.");
    setTimeout(() => setFeedback(""), 3000);
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Configuración</h2>
          <p>Catálogos, flujos y parámetros operativos del sistema.</p>
        </div>
      </div>

      {feedback && <div className="toast">✓ {feedback}</div>}

      <div className="split">
        <div className="card card-pad">
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {SECCIONES.map((s) => (
              <button
                key={s}
                onClick={() => setSeccion(s)}
                className="sidebar-link"
                style={{
                  color: seccion === s ? "var(--primary)" : "var(--ink-soft)",
                  background: seccion === s ? "var(--primary-tint)" : "transparent",
                }}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <div className="card card-pad">
          {seccion === "Flujos de aprobación" && (
            <>
              <h3 style={{ marginTop: 0, fontSize: 14 }}>Flujos de aprobación</h3>
              {niveles.map((n) => (
                <div key={n.nivel} className="card card-pad" style={{ boxShadow: "none", marginBottom: 10 }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <strong style={{ fontSize: 13 }}>{n.nivel} · {n.rol}</strong>
                    <label style={{ fontSize: 11.5, color: "var(--muted)" }}>
                      <input type="checkbox" defaultChecked style={{ marginRight: 5 }} />Activo
                    </label>
                  </div>
                  <div style={{ fontSize: 12.5, color: "var(--muted)", marginTop: 4 }}>
                    Monto: {n.monto} · Tiempo límite: {n.tiempo}
                  </div>
                </div>
              ))}
              <button className="btn btn-ghost btn-sm" onClick={agregarNivel}>+ Agregar nivel</button>
            </>
          )}

          {seccion === "Alertas automáticas" && (
            <>
              <h3 style={{ marginTop: 0, fontSize: 14 }}>Umbrales de alerta</h3>
              <div className="field">
                <label>Umbral de stock mínimo (predeterminado)</label>
                <input className="input" value={umbrales.stockMinimo} onChange={(e) => setUmbrales({ ...umbrales, stockMinimo: e.target.value })} />
              </div>
              <div className="field">
                <label>Alerta de presupuesto — advertencia</label>
                <input className="input" value={umbrales.advertencia} onChange={(e) => setUmbrales({ ...umbrales, advertencia: e.target.value })} />
              </div>
              <div className="field">
                <label>Alerta de presupuesto — crítico</label>
                <input className="input" value={umbrales.critico} onChange={(e) => setUmbrales({ ...umbrales, critico: e.target.value })} />
              </div>
              <label style={{ fontSize: 13, display: "flex", gap: 8, alignItems: "center" }}>
                <input type="checkbox" defaultChecked /> Enviar alertas por correo electrónico
              </label>
            </>
          )}

          {!["Flujos de aprobación", "Alertas automáticas"].includes(seccion) && (
            <div className="empty-state">
              <div className="glyph">⚙</div>
              Sección de configuración de <strong>{seccion}</strong>.<br />
              Vista de referencia — la gestión completa del catálogo se agrega aquí.
            </div>
          )}

          <div style={{ display: "flex", gap: 8, marginTop: 18 }}>
            <button className="btn btn-primary" onClick={guardar}>Guardar cambios</button>
            <button className="btn btn-ghost" onClick={() => setNiveles(NIVELES_INICIALES)}>Cancelar</button>
          </div>
        </div>
      </div>
    </div>
  );
}
