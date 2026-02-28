import ProgressBar from "./ProgressBar";

function pct(completed, planned) {
  const p = Number(planned || 0);
  const c = Number(completed || 0);
  return p ? Math.round((c / p) * 100) : 0;
}

function MiniBars({ pmPct, cmPct }) {
  // mini chart بسيط
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 28 }}>
      <div title={`PM ${pmPct}%`} style={{ width: 10, height: `${Math.max(2, pmPct)}%`, background: "#22c55e", borderRadius: 6 }} />
      <div title={`CM ${cmPct}%`} style={{ width: 10, height: `${Math.max(2, cmPct)}%`, background: "#f97316", borderRadius: 6 }} />
    </div>
  );
}

export default function RegionTable({ regions = {} }) {
  const names = Object.keys(regions);

  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid rgba(15,23,42,0.08)",
        borderRadius: 14,
        padding: 14,
        boxShadow: "0 6px 18px rgba(15,23,42,0.06)",
      }}
    >
      <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 12 }}>Regions Overview</div>

      <div style={{ width: "100%", overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 820 }}>
          <thead>
            <tr style={{ textAlign: "left", fontSize: 12, opacity: 0.75 }}>
              <th style={{ padding: "10px 8px" }}>Region</th>
              <th style={{ padding: "10px 8px" }}>PM (Completed/Planned)</th>
              <th style={{ padding: "10px 8px" }}>PM Progress</th>
              <th style={{ padding: "10px 8px" }}>CM (Completed/Planned)</th>
              <th style={{ padding: "10px 8px" }}>CM Progress</th>
              <th style={{ padding: "10px 8px" }}>Employees</th>
              <th style={{ padding: "10px 8px" }}>Mini Chart</th>
            </tr>
          </thead>

          <tbody>
            {names.map((name) => {
              const r = regions[name] || {};
              const pmP = Number(r?.pm?.planned || 0);
              const pmC = Number(r?.pm?.completed || 0);
              const cmP = Number(r?.cm?.planned || 0);
              const cmC = Number(r?.cm?.completed || 0);
              const employees = r?.employees || [];

              const pmPct = pct(pmC, pmP);
              const cmPct = pct(cmC, cmP);

              return (
                <tr key={name} style={{ borderTop: "1px solid rgba(15,23,42,0.06)" }}>
                  <td style={{ padding: "12px 8px", fontWeight: 700 }}>{name}</td>

                  <td style={{ padding: "12px 8px" }}>
                    <span style={{ fontWeight: 700 }}>{pmC}</span> / {pmP}
                  </td>

                  <td style={{ padding: "12px 8px", minWidth: 220 }}>
                    <ProgressBar value={pmPct} label={null} />
                  </td>

                  <td style={{ padding: "12px 8px" }}>
                    <span style={{ fontWeight: 700 }}>{cmC}</span> / {cmP}
                  </td>

                  <td style={{ padding: "12px 8px", minWidth: 220 }}>
                    {/* نخلي لون CM مختلف */}
                    <div style={{ width: "100%" }}>
                      <div
                        style={{
                          height: 10,
                          background: "rgba(0,0,0,0.08)",
                          borderRadius: 999,
                          overflow: "hidden",
                        }}
                      >
                        <div
                          style={{
                            width: `${cmPct}%`,
                            height: "100%",
                            borderRadius: 999,
                            background: "linear-gradient(90deg, #fb923c, #f97316)",
                            transition: "width 250ms ease",
                          }}
                        />
                      </div>
                      <div style={{ marginTop: 6, fontSize: 12, opacity: 0.75 }}>{cmPct}%</div>
                    </div>
                  </td>

                  <td style={{ padding: "12px 8px" }}>
                    <span style={{ fontWeight: 800 }}>{employees.length}</span>
                  </td>

                  <td style={{ padding: "12px 8px" }}>
                    <MiniBars pmPct={pmPct} cmPct={cmPct} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
