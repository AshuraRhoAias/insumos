import { useMemo, useState } from "react";
import { useData } from "../context/DataContext";
import { downloadTextFile } from "../components/Charts";

export default function Auditoria() {
  const { bitacora } = useData();
  const [query, setQuery] = useState("");
  const [usuario, setUsuario] = useState("Todos los usuarios");
  const [accion, setAccion] = useState("Todas las acciones");
  const [selected, setSelected] = useState(bitacora[0]);

  const usuarios = useMemo(() => [...new Set(bitacora.map((b) => b.usuario))], [bitacora]);
  const acciones = useMemo(() => [...new Set(bitacora.map((b) => b.accion))], [bitacora]);

  const filtrada = bitacora.filter((b) => {
    const matchQuery =
      query.trim().length === 0 ||
      b.accion.toLowerCase().includes(query.toLowerCase()) ||
      b.usuario.toLowerCase().includes(query.toLowerCase()) ||
      b.objeto.toLowerCase().includes(query.toLowerCase());
    const matchUsuario = usuario === "Todos los usuarios" || b.usuario === usuario;
    const matchAccion = accion === "Todas las acciones" || b.accion === accion;
    return matchQuery && matchUsuario && matchAccion;
  });

  function exportar() {
    const header = "Hash,HashPrev,Fecha,Usuario,Rol,Accion,Objeto,IP,Ubicacion";
    const rows = filtrada.map((b) => [b.hash, b.hashPrev, b.fecha, b.usuario, b.rol, b.accion, b.objeto, b.ip, b.ubicacion].join(","));
    downloadTextFile("bitacora.csv", [header, ...rows].join("\n"), "text/csv");
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Auditoría</h2>
          <p>Bitácora de todas las acciones del sistema, encadenada por hash para garantizar inmutabilidad.</p>
        </div>
        <button className="btn btn-ghost" onClick={exportar}>Exportar bitácora</button>
      </div>

      <div className="toolbar">
        <input className="input" style={{ maxWidth: 260 }} placeholder="Buscar acción, usuario u objeto…" value={query} onChange={(e) => setQuery(e.target.value)} />
        <select className="input" style={{ maxWidth: 180 }} value={usuario} onChange={(e) => setUsuario(e.target.value)}>
          <option>Todos los usuarios</option>
          {usuarios.map((u) => <option key={u}>{u}</option>)}
        </select>
        <select className="input" style={{ maxWidth: 180 }} value={accion} onChange={(e) => setAccion(e.target.value)}>
          <option>Todas las acciones</option>
          {acciones.map((a) => <option key={a}>{a}</option>)}
        </select>
      </div>

      <div className="split">
        <div className="card table-wrap scroll-y" style={{ maxHeight: 460 }}>
          <table>
            <thead>
              <tr><th>Hash</th><th>Fecha</th><th>Usuario</th><th>Acción</th><th>Objeto</th></tr>
            </thead>
            <tbody>
              {filtrada.length === 0 && (
                <tr><td colSpan={5}><div className="empty-state"><div className="glyph">∅</div>Sin registros que coincidan con el filtro.</div></td></tr>
              )}
              {filtrada.map((b) => (
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
