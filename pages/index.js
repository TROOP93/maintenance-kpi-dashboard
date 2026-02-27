import React, { useMemo } from "react";

export default function Home() {
  // ✅ بيانات تجريبية (لاحقًا نخليها من Supabase)
  const regions = [
    { name: "Dammam", pm: 88, cm: 70, target: 90 },
    { name: "Hofuf", pm: 85, cm: 95, target: 90 },
    { name: "Riyadh", pm: 86, cm: 94, target: 90 },
  ];

  const meta = {
    isoWeek: 9,
    range: "Feb 23, 2026 — Mar 1, 2026",
    reportTitle: "Maintenance Performance Dashboard",
    subtitle: "PM & CM Performance Tracking",
    preparedBy: "Abdulrhman",
  };

  // ✅ حسابات تلقائية (عشان التقرير يكون “حقيقي” حتى لو تغيرت الأرقام)
  const computed = useMemo(() => {
    const withOverall = regions.map((r) => ({
      ...r,
      overall: Math.round((r.pm + r.cm) / 2),
    }));

    const overallAvg =
      Math.round(
        withOverall.reduce((s, r) => s + r.overall, 0) / withOverall.length
      ) || 0;

    const pmAvg =
      Math.round(withOverall.reduce((s, r) => s + r.pm, 0) / withOverall.length) ||
      0;

    const cmAvg =
      Math.round(withOverall.reduce((s, r) => s + r.cm, 0) / withOverall.length) ||
      0;

    const best = [...withOverall].sort((a, b) => b.overall - a.overall)[0]?.name || "-";
    const lowest = [...withOverall].sort((a, b) => a.overall - b.overall)[0]?.name || "-";

    const now = new Date();
    const generatedAt = now.toLocaleString(undefined, {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });

    return { withOverall, overallAvg, pmAvg, cmAvg, best, lowest, generatedAt };
  }, [regions]);

  const Card = ({ title, value, sub, tone = "neutral" }) => {
    const toneStyle =
      tone === "good"
        ? styles.cardToneGood
        : tone === "bad"
        ? styles.cardToneBad
        : styles.cardToneNeutral;

    return (
      <div style={{ ...styles.card, ...toneStyle }} className="print-clean">
        <div style={styles.cardTitle}>{title}</div>
        <div style={styles.cardValue}>{value}</div>
        {sub ? <div style={styles.cardSub}>{sub}</div> : null}
      </div>
    );
  };

  const onExportPdf = () => window.print();

  return (
    <div style={styles.page} className="print-wrap">
      {/* Global print styles */}
      <style jsx global>{`
        @media print {
          @page {
            size: A4;
            margin: 14mm;
          }

          /* Hide UI-only stuff */
          .no-print {
            display: none !important;
          }

          /* Remove shadows & sticky behavior */
          .print-clean {
            box-shadow: none !important;
          }
          header {
            position: static !important;
            box-shadow: none !important;
          }

          /* Make background pure white for clarity */
          body {
            background: #ffffff !important;
          }
          * {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }

          /* Avoid table breaking weirdly across pages */
          table,
          tr,
          td,
          th {
            page-break-inside: avoid;
          }
        }
      `}</style>

      {/* Header */}
      <header style={styles.header} className="print-clean">
        <div>
          <div style={styles.h1}>{meta.reportTitle}</div>
          <div style={styles.h2}>
            {meta.subtitle} • ISO Week {meta.isoWeek} • {meta.range}
          </div>

          <div style={styles.metaLine}>
            <span style={styles.metaPill}>Generated: {computed.generatedAt}</span>
            <span style={styles.metaDot}>•</span>
            <span style={styles.metaPill}>Prepared by: {meta.preparedBy}</span>
          </div>
        </div>

        <div style={styles.headerRight} className="no-print">
          <button style={styles.primaryBtn} onClick={onExportPdf}>
            Export PDF
          </button>
        </div>
      </header>

      {/* Summary */}
      <div style={styles.sectionTitle}>Executive Summary</div>

      <div style={styles.grid}>
        <Card
          title="Overall %"
          value={`${computed.overallAvg}%`}
          sub={`Target ${regions[0]?.target ?? 90}%`}
          tone={computed.overallAvg >= (regions[0]?.target ?? 90) ? "good" : "bad"}
        />
        <Card title="PM %" value={`${computed.pmAvg}%`} sub={`Target ${regions[0]?.target ?? 90}%`} />
        <Card title="CM %" value={`${computed.cmAvg}%`} sub={`Target ${regions[0]?.target ?? 90}%`} />
        <Card title="Best Region" value={computed.best} tone="good" />
        <Card title="Lowest Region" value={computed.lowest} tone="bad" />
      </div>

      {/* Table */}
      <div style={{ ...styles.sectionTitle, marginTop: 22 }}>Regions Overview</div>

      <div style={styles.tableWrap} className="print-clean">
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Region</th>
              <th style={styles.thCenter}>PM %</th>
              <th style={styles.thCenter}>CM %</th>
              <th style={styles.thCenter}>Overall %</th>
              <th style={styles.thCenter}>Target</th>
              <th style={styles.thCenter}>Gap</th>
              <th style={styles.th}>Status</th>
            </tr>
          </thead>

          <tbody>
            {computed.withOverall.map((r) => {
              const gap = r.overall - r.target;
              const ok = gap >= 0;

              return (
                <tr key={r.name} style={styles.tr}>
                  <td style={styles.tdStrong}>{r.name}</td>

                  <td style={styles.tdCenter}>{r.pm}%</td>
                  <td style={styles.tdCenter}>{r.cm}%</td>
                  <td style={styles.tdCenterStrong}>{r.overall}%</td>

                  <td style={styles.tdCenter}>{r.target}%</td>

                  <td style={{ ...styles.tdCenter, ...(!ok ? styles.badText : styles.goodText) }}>
                    {ok ? `+${gap}%` : `${gap}%`}
                  </td>

                  <td style={styles.td}>
                    <span style={{ ...styles.statusPill, ...(ok ? styles.pillGood : styles.pillBad) }}>
                      {ok ? "On Target" : "Below Target"}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        <div style={styles.note}>
          * Overall is calculated as average of PM% and CM%. (For demo only — can be adjusted.)
        </div>
      </div>

      <footer style={styles.footer}>
        © 2026 Maintenance KPI System — Report Template (Demo). Developed by {meta.preparedBy}.
      </footer>
    </div>
  );
}

const styles = {
  page: {
    fontFamily: "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial",
    background: "#f6f7fb",
    minHeight: "100vh",
    padding: 18,
  },

  header: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
    background: "#ffffff",
    borderRadius: 14,
    padding: 16,
    boxShadow: "0 10px 30px rgba(15,23,42,0.10)",
    position: "sticky",
    top: 10,
    zIndex: 10,
    border: "1px solid rgba(226,232,240,0.8)",
  },

  headerRight: {
    display: "flex",
    alignItems: "center",
    gap: 10,
  },

  h1: { fontSize: 18, fontWeight: 900, color: "#0f172a", letterSpacing: 0.2 },
  h2: { marginTop: 4, fontSize: 12.5, color: "#475569", fontWeight: 600 },

  metaLine: { marginTop: 10, display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" },
  metaPill: {
    fontSize: 12,
    color: "#0f172a",
    background: "#f1f5f9",
    border: "1px solid #e2e8f0",
    padding: "6px 10px",
    borderRadius: 999,
    fontWeight: 700,
  },
  metaDot: { color: "#94a3b8" },

  primaryBtn: {
    border: "1px solid #0f172a",
    background: "#0f172a",
    color: "#ffffff",
    padding: "10px 12px",
    borderRadius: 10,
    fontWeight: 900,
    cursor: "pointer",
  },

  sectionTitle: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: 900,
    color: "#0f172a",
  },

  grid: {
    marginTop: 12,
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))",
    gap: 12,
  },

  card: {
    background: "#ffffff",
    borderRadius: 14,
    padding: 14,
    boxShadow: "0 10px 30px rgba(15,23,42,0.10)",
    border: "1px solid rgba(226,232,240,0.8)",
    overflow: "hidden",
  },
  cardToneNeutral: {},
  cardToneGood: { borderLeft: "6px solid #16a34a" },
  cardToneBad: { borderLeft: "6px solid #dc2626" },

  cardTitle: { fontSize: 12, color: "#64748b", fontWeight: 800 },
  cardValue: { marginTop: 8, fontSize: 28, fontWeight: 950, color: "#0f172a" },
  cardSub: { marginTop: 6, fontSize: 12, color: "#64748b", fontWeight: 600 },

  tableWrap: {
    marginTop: 12,
    background: "#ffffff",
    borderRadius: 14,
    padding: 10,
    overflowX: "auto",
    boxShadow: "0 10px 30px rgba(15,23,42,0.10)",
    border: "1px solid rgba(226,232,240,0.8)",
  },

  table: { width: "100%", borderCollapse: "collapse", minWidth: 720 },

  th: {
    textAlign: "left",
    padding: "12px 10px",
    fontSize: 12,
    color: "#475569",
    borderBottom: "1px solid #e2e8f0",
    fontWeight: 900,
    background: "#fafafa",
  },
  thCenter: {
    textAlign: "center",
    padding: "12px 10px",
    fontSize: 12,
    color: "#475569",
    borderBottom: "1px solid #e2e8f0",
    fontWeight: 900,
    background: "#fafafa",
  },

  tr: { background: "#ffffff" },

  td: {
    padding: "12px 10px",
    fontSize: 13,
    color: "#0f172a",
    borderBottom: "1px solid #f1f5f9",
    verticalAlign: "middle",
  },
  tdCenter: {
    padding: "12px 10px",
    fontSize: 13,
    color: "#0f172a",
    borderBottom: "1px solid #f1f5f9",
    textAlign: "center",
    verticalAlign: "middle",
  },
  tdStrong: {
    padding: "12px 10px",
    fontSize: 13,
    color: "#0f172a",
    fontWeight: 950,
    borderBottom: "1px solid #f1f5f9",
  },
  tdCenterStrong: {
    padding: "12px 10px",
    fontSize: 13,
    color: "#0f172a",
    fontWeight: 950,
    borderBottom: "1px solid #f1f5f9",
    textAlign: "center",
  },

  statusPill: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "6px 10px",
    borderRadius: 999,
    fontWeight: 900,
    fontSize: 12,
    border: "1px solid #e2e8f0",
  },
  pillGood: { background: "#ecfdf5", color: "#166534", borderColor: "#bbf7d0" },
  pillBad: { background: "#fef2f2", color: "#991b1b", borderColor: "#fecaca" },

  goodText: { color: "#166534", fontWeight: 900 },
  badText: { color: "#991b1b", fontWeight: 900 },

  note: {
    marginTop: 10,
    fontSize: 12,
    color: "#64748b",
    fontWeight: 600,
  },

  footer: {
    marginTop: 18,
    textAlign: "center",
    color: "#64748b",
    fontSize: 12,
    fontWeight: 600,
  },
};
