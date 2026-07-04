import { useMemo, useState } from "react";
import { insumos } from "../data/mockData";
import { money } from "../components/UI";
import { useApp } from "../context/AppContext";

function disponibilidad(item) {
  if (item.stock === 0) return { label: "Agotado", color: "var(--danger)" };
  if (item.stock < item.minimo) return { label: "Poco stock", color: "var(--warning)" };
  return { label: "Disponible", color: "var(--success)" };
}

export default function Catalogo() {
  const { role } = useApp();
  const [query, setQuery] = useState("");
  const [categoria, setCategoria] = useState("");
  const [view, setView] = useState("cards");
  const [selected, setSelected] = useState(null);
  const canManage = role === "Administrador" || role === "Almacén";

  const categorias = [...new Set(insumos.map((i) => i.categoria))];

  const filtered = useMemo(() => {
    return insumos.filter((i) => {
      const matchQuery =
        query.length < 3 ||
        i.nombre.toLowerCase().includes(query.toLowerCase()) ||
        i.codigo.toLowerCase().includes(query.toLowerCase());
      const matchCat = !categoria || i.categoria === categoria;
      return matchQuery && matchCat;
    });
  }, [query, categoria]);

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Catálogo de insumos</h2>
          <p>Inventario maestro de productos disponibles para solicitar.</p>
        </div>
        {canManage && <button className="btn btn-primary">+ Nuevo insumo</button>}
      </div>

      <div className="toolbar">
        <input
          className="input"
          style={{ maxWidth: 320 }}
          placeholder="Buscar por nombre o código (mín. 3 caracteres)…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <select className="input" style={{ maxWidth: 200 }} value={categoria} onChange={(e) => setCategoria(e.target.value)}>
          <option value="">Todas las categorías</option>
          {categorias.map((c) => <option key={c}>{c}</option>)}
        </select>
        <div style={{ marginLeft: "auto", display: "flex", gap: 6 }}>
          <button className={"btn btn-sm " + (view === "cards" ? "btn-primary" : "btn-ghost")} onClick={() => setView("cards")}>Tarjetas</button>
          <button className={"btn btn-sm " + (view === "list" ? "btn-primary" : "btn-ghost")} onClick={() => setView("list")}>Lista</button>
        </div>
      </div>

      {view === "cards" ? (
        <div className="grid grid-3">
          {filtered.map((i) => {
            const disp = disponibilidad(i);
            return (
              <div key={i.id} className="card card-pad" style={{ cursor: "pointer" }} onClick={() => setSelected(i)}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div className="folio-tag">{i.codigo}</div>
                  <span className="badge" style={{ background: "transparent", color: disp.color }}>{disp.label}</span>
                </div>
                <h4 style={{ margin: "10px 0 4px", fontSize: 14.5 }}>{i.nombre}</h4>
                <div style={{ fontSize: 12, color: "var(--muted)" }}>{i.categoria} · {i.unidad}</div>
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 14, fontSize: 13 }}>
                  <span>Stock: <strong>{i.stock}</strong></span>
                  <span>{money(i.precio)}</span>
                </div>
              </div>
            );
          })}
          {filtered.length === 0 && (
            <div className="empty-state" style={{ gridColumn: "1 / -1" }}>
              <div className="glyph">∅</div>
              No hay insumos que coincidan con la búsqueda.
            </div>
          )}
        </div>
      ) : (
        <div className="card">
          <table>
            <thead>
              <tr>
                <th>Código</th><th>Nombre</th><th>Categoría</th><th>Stock</th><th>Precio</th><th>Disponibilidad</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((i) => {
                const disp = disponibilidad(i);
                return (
                  <tr key={i.id} onClick={() => setSelected(i)} style={{ cursor: "pointer" }}>
                    <td className="mono">{i.codigo}</td>
                    <td>{i.nombre}</td>
                    <td>{i.categoria}</td>
                    <td>{i.stock}</td>
                    <td>{money(i.precio)}</td>
                    <td><span style={{ color: disp.color, fontWeight: 700, fontSize: 12.5 }}>{disp.label}</span></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {selected && (
        <div
          style={{ position: "fixed", inset: 0, background: "rgba(28,36,48,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 20 }}
          onClick={() => setSelected(null)}
        >
          <div className="card card-pad" style={{ width: 420 }} onClick={(e) => e.stopPropagation()}>
            <div className="folio-tag">{selected.codigo}</div>
            <h3 style={{ marginTop: 8 }}>{selected.nombre}</h3>
            <div className="kv"><span className="k">Categoría</span><span className="v">{selected.categoria}</span></div>
            <div className="kv"><span className="k">Unidad de medida</span><span className="v">{selected.unidad}</span></div>
            <div className="kv"><span className="k">Stock disponible</span><span className="v">{selected.stock}</span></div>
            <div className="kv"><span className="k">Precio de referencia</span><span className="v">{money(selected.precio)}</span></div>
            <div className="kv"><span className="k">Proveedor</span><span className="v">{selected.proveedor}</span></div>
            <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
              <button className="btn btn-primary" style={{ flex: 1, justifyContent: "center" }}>Agregar a solicitud</button>
              <button className="btn btn-ghost" onClick={() => setSelected(null)}>Cerrar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
