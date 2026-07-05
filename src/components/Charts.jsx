import { useEffect, useState } from "react";

const PALETTE = ["#2b3a67", "#ab7f2c", "#3f7d58", "#c08a1e", "#b5432f", "#5b7fa6", "#7a1f2b"];

function useGrowIn(depKey) {
  const [grown, setGrown] = useState(false);
  useEffect(() => {
    setGrown(false);
    const id = requestAnimationFrame(() => requestAnimationFrame(() => setGrown(true)));
    return () => cancelAnimationFrame(id);
  }, [depKey]);
  return grown;
}

/**
 * Gráfico de barras (simple o agrupado) construido con divs, sin
 * dependencias externas. `series` es un arreglo de { name, color?, data }
 * donde `data` tiene la misma longitud que `labels`. Las barras crecen
 * con una animación escalonada cada vez que cambian los datos.
 */
export function BarChart({ labels, series, height = 200, formatValue = (n) => n }) {
  const max = Math.max(1, ...series.flatMap((s) => s.data));
  const showLegend = series.length > 1;
  const barsH = height - 30;
  const depKey = `${labels.join("|")}::${series.map((s) => s.name).join(",")}`;
  const grown = useGrowIn(depKey);

  return (
    <div className="bar-chart">
      {showLegend && (
        <div className="bar-chart-legend">
          {series.map((s, i) => (
            <div key={s.name} className="bar-chart-legend-item">
              <span className="bar-chart-dot" style={{ background: s.color || PALETTE[i % PALETTE.length] }} />
              {s.name}
            </div>
          ))}
        </div>
      )}
      <div
        className="bar-chart-area"
        style={{ height, gap: showLegend ? 10 : 12, overflowX: labels.length > 16 ? "auto" : "visible" }}
      >
        {labels.map((label, li) => (
          <div
            key={label}
            className="bar-chart-col"
            style={{ flex: labels.length > 16 ? "0 0 30px" : 1, minWidth: labels.length > 16 ? 24 : undefined }}
          >
            <div className="bar-chart-bars" style={{ height: barsH }}>
              {series.map((s, si) => {
                const val = s.data[li];
                const targetH = Math.max(2, (val / max) * barsH);
                const color = s.color || PALETTE[si % PALETTE.length];
                return (
                  <div
                    key={s.name}
                    className="bar-chart-bar"
                    title={`${s.name} · ${label}: ${formatValue(val)}`}
                    style={{
                      width: showLegend ? `${Math.max(5, 26 / series.length)}px` : "100%",
                      maxWidth: showLegend ? 16 : undefined,
                      height: grown ? `${targetH}px` : "0px",
                      background: `linear-gradient(180deg, color-mix(in srgb, ${color} 85%, white), ${color} 65%, color-mix(in srgb, ${color} 88%, black))`,
                      transitionDelay: `${Math.min(li * 14, 320)}ms`,
                    }}
                  />
                );
              })}
            </div>
            <div className="bar-chart-label">{label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function chartSeriesToCSV(labels, series) {
  const header = ["Periodo", ...series.map((s) => s.name)].join(",");
  const rows = labels.map((label, i) => [label, ...series.map((s) => s.data[i])].join(","));
  return [header, ...rows].join("\n");
}

export function downloadTextFile(filename, content, mime = "text/plain") {
  const blob = new Blob([content], { type: `${mime};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
