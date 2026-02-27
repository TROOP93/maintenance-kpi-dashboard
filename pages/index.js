export default function Home() {
  const regions = [
    { name: "Dammam", pm: 88, cm: 70, overall: 82, target: 90 },
    { name: "Hofuf", pm: 85, cm: 95, overall: 87, target: 90 },
    { name: "Riyadh", pm: 86, cm: 94, overall: 88, target: 90 },
  ];

  const kpi = {
    overall: 82,
    pm: 88,
    cm: 70,
    best: "Riyadh",
    lowest: "Dammam",
    isoWeek: 9,
    range: "Feb 23, 2026 — Mar 1, 2026",
  };

  const Card = ({ title, value, sub }) => (
    <div style={styles.card}>
      <div style={styles.cardTitle}>{title}</div>
      <div style={styles.cardValue}>{value}</div>
      {sub ? <div style={styles.cardSub}>{sub}</div> : null}
    </div>
  );

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <div>
          <div style={styles.h1}>Maintenance Performance Dashboard</div>
          <div style={styles.h2}>
            Monthly PM & CM Performance Tracking • ISO Week {kpi.isoWeek} •{" "}
            {kpi.range}
          </div>
        </div>
        <div style={styles.badge}>AD</div>
      </header>

      <div style={styles.sectionTitle}>Executive Summary</div>

      <div style={styles.grid}>
        <Card title="Overall %" value={`${kpi.overall}%`} sub="Target 90%" />
        <Card title="PM %" value={`${kpi.pm}%`} sub="Target 90%" />
        <Card title="CM %" value={`${kpi.cm}%`} sub="Target 90%" />
        <Card title="Best Region" value={kpi.best} />
        <Card title="Lowest Region" value={kpi.lowest} />
      </div>

      <div style={{ ...styles.sectionTitle, marginTop: 24 }}>
        Regions Overview
      </div>

      <div style={styles.tableWrap}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Region</th>
              <th style={styles.th}>PM %</th>
              <th style={styles.th}>CM %</th>
              <th style={styles.th}>Overall %</th>
              <th style={styles.th}>Target</th>
              <th style={styles.th}>Gap</th>
              <th style={styles.th}>Status</th>
            </tr>
          </thead>
          <tbody>
            {regions.map((r) => {
              const gap = r.overall - r.target;
              const status = gap >= 0 ? "On Target" : "Below Target";
              return (
                <tr key={r.name}>
                  <td style={styles.tdStrong}>{r.name}</td>
                  <td style={styles.td}>{r.pm}%</td>
                  <td style={styles.td}>{r.cm}%</td>
                  <td style={styles.tdStrong}>{r.overall}%</td>
                  <td style={styles.td}>{r.target}%</td>
                  <td
                    style={{
                      ...styles.td,
                      color: gap >= 0 ? "#0a7d3b" : "#c81e1e",
                    }}
                  >
                    {gap >= 0 ? `+${gap}%` : `${gap}%`}
                  </td>
                  <td
                    style={{
                      ...styles.td,
                      fontWeight: 700,
                      color: gap >= 0 ? "#0a7d3b" : "#c81e1e",
                    }}
                  >
                    {status}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <footer style={styles.footer}>
        © 2026 Maintenance KPI System. Developed by Abdulrhman — 2026
      </footer>
    </div>
  );
}

const styles = {
  page: {
    fontFamily:
      "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial",
    background: "#f6f7fb",
    minHeight: "100vh",
    padding: 18,
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    background: "#ffffff",
    borderRadius: 14,
    padding: 16,
    boxShadow: "0 8px 24px rgba(15,23,42,0.08)",
    position: "sticky",
    top: 10,
    zIndex: 10,
  },
  h1: { fontSize: 18, fontWeight: 800, color: "#0f172a" },
  h2: { marginTop: 4, fontSize: 12, color: "#475569" },
  badge: {
    width: 40,
    height: 40,
    borderRadius: "50%",
    background: "#eef2ff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 800,
    color: "#1e293b",
  },
  sectionTitle: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: 800,
    color: "#0f172a",
  },
  grid: {
    marginTop: 12,
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
    gap: 12,
  },
  card: {
    background: "#ffffff",
    borderRadius: 14,
    padding: 14,
    boxShadow: "0 8px 24px rgba(15,23,42,0.08)",
  },
  cardTitle: { fontSize: 12, color: "#64748b", fontWeight: 700 },
  cardValue: { marginTop: 8, fontSize: 26, fontWeight: 900, color: "#0f172a" },
  cardSub: { marginTop: 6, fontSize: 12, color: "#64748b" },
  tableWrap: {
    marginTop: 12,
    background: "#ffffff",
    borderRadius: 14,
    padding: 10,
    overflowX: "auto",
    boxShadow: "0 8px 24px rgba(15,23,42,0.08)",
  },
  table: { width: "100%", borderCollapse: "collapse", minWidth: 520 },
  th: {
    textAlign: "left",
    padding: "10px 8px",
    fontSize: 12,
    color: "#475569",
    borderBottom: "1px solid #e2e8f0",
  },
  td: {
    padding: "10px 8px",
    fontSize: 13,
    color: "#0f172a",
    borderBottom: "1px solid #f1f5f9",
  },
  tdStrong: {
    padding: "10px 8px",
    fontSize: 13,
    color: "#0f172a",
    fontWeight: 800,
    borderBottom: "1px solid #f1f5f9",
  },
  footer: {
    marginTop: 18,
    textAlign: "center",
    color: "#64748b",
    fontSize: 12,
  },
};
