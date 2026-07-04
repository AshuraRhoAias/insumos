const PALETTE = ["#2b3a67", "#ab7f2c", "#3f7d58", "#c08a1e", "#b5432f", "#5b7fa6", "#7a1f2b"];

/**
 * Gráfico de barras (simple o agrupado) construido con divs, sin
 * dependencias externas. `series` es un arreglo de { name, color?, data }
 * donde `data` tiene la misma longitud que `labels`.
 */
export function BarChart({ labels, series, height = 200, formatValue = (n) => n }) {
  const max = Math.max(1, ...series.flatMap((s) => s.data));
  const showLegend = series.length > 1;

  return (
    <div>
      {showLegend && (
        <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginBottom: 12 }}>
          {series.map((s, i) => (
            <div key={s.name} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11.5, color: "var(--muted)" }}>
              <span
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: 3,
                  background: s.color || PALETTE[i % PALETTE.length],
                  display: "inline-block",
                }}
              />
              {s.name}
            </div>
          ))}
        </div>
      )}
      <div
        style={{
          display: "flex",
          alignItems: "flex-end",
          gap: showLegend ? 10 : 12,
          height,
          padding: "10px 4px 0",
          overflowX: labels.length > 16 ? "auto" : "visible",
        }}
      >
        {labels.map((label, li) => (
          <div key={label} style={{ flex: labels.length > 16 ? "0 0 30px" : 1, textAlign: "center", minWidth: labels.length > 16 ? 24 : undefined }}>
            <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "center", gap: 3, height: height - 30 }}>
              {series.map((s, si) => (
                <div
                  key={s.name}
                  title={`${s.name} · ${label}: ${formatValue(s.data[li])}`}
                  style={{
                    width: showLegend ? `${Math.max(5, 26 / series.length)}px` : "100%",
                    maxWidth: showLegend ? 16 : undefined,
                    height: `${Math.max(2, (s.data[li] / max) * (height - 30))}px`,
                    background: s.color || PALETTE[si % PALETTE.length],
                    borderRadius: "3px 3px 0 0",
                  }}
                />
              ))}
            </div>
            <div style={{ fontSize: 10.5, color: "var(--muted)", marginTop: 6 }}>{label}</div>
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
