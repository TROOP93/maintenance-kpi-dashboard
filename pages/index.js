import React, { useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "maintenance_demo_planned_completed_v1";

const DEFAULT_META = {
  isoWeek: 9,
  range: "Feb 23, 2026 — Mar 1, 2026",
  reportTitle: "Maintenance Performance Dashboard",
  subtitle: "PM & CM Performance Tracking (Demo)",
  preparedBy: "Abdulrhman",
  defaultTarget: 90,
};

const DEFAULT_REGIONS = [
  {
    name: "Dammam",
    pmPlanned: 50,
    pmCompleted: 44,
    cmPlanned: 40,
    cmCompleted: 28,
    target: 90,
  },
  {
    name: "Hofuf",
    pmPlanned: 60,
    pmCompleted: 51,
    cmPlanned: 30,
    cmCompleted: 28,
    target: 90,
  },
  {
    name: "Riyadh",
    pmPlanned: 70,
    pmCompleted: 60,
    cmPlanned: 35,
    cmCompleted: 33,
    target: 90,
  },
];

function toInt(v) {
  const n = Number(v);
  if (Number.isNaN(n) || !Number.isFinite(n)) return 0;
  return Math.max(0, Math.floor(n));
}

function clampPct(n) {
  if (Number.isNaN(n) || !Number.isFinite(n)) return 0;
  return Math.max(0, Math.min(100, Math.round(n)));
}

function pct(completed, planned) {
  if (!planned || planned <= 0) return 0;
  return clampPct((completed / planned) * 100);
}

export default function Home() {
  const [meta, setMeta] = useState(DEFAULT_META);
  const [regions, setRegions] = useState(DEFAULT_REGIONS);

  // ✅ تحميل Demo data من المتصفح
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (parsed?.regions?.length) setRegions(parsed.regions);
      if (parsed?.meta) setMeta((m) => ({ ...m, ...parsed.meta }));
    } catch {
      // ignore
    }
  }, []);

  // ✅ حفظ Demo data محليًا
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ meta, regions }));
    } catch {
      // ignore
    }
  }, [meta, regions]);

  // ✅ نموذج إدخال
  const [form, setForm] = useState({
    regionName: DEFAULT_REGIONS[0].name,
    pmPlanned: DEFAULT_REGIONS[0].pmPlanned,
    pmCompleted: DEFAULT_REGIONS[0].pmCompleted,
    cmPlanned: DEFAULT_REGIONS[0].cmPlanned,
    cmCompleted: DEFAULT_REGIONS[0].cmCompleted,
    target: DEFAULT_REGIONS[0].target,
  });

  // عند تغيير المنطقة في الفورم: عبّي القيم من الداتا
  useEffect(() => {
    const r = regions.find((x) => x.name === form.regionName);
    if (!r) return;
    setForm((p) => ({
      ...p,
      pmPlanned: r.pmPlanned,
      pmCompleted: r.pmCompleted,
      cmPlanned: r.cmPlanned,
      cmCompleted: r.cmCompleted,
      target: r.target,
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.regionName]);

  const computed = useMemo(() => {
    const withCalculated = regions.map((r) => {
      const pm = pct(r.pmCompleted, r.pmPlanned);
      const cm = pct(r.cmCompleted, r.cmPlanned);
      const overall = clampPct((pm + cm) / 2);
      const gap = overall - (r.target ?? meta.defaultTarget);
      return { ...r, pm, cm, overall, gap };
    });

    const overallAvg =
      clampPct(
        withCalculated.reduce((s, r) => s + r.overall, 0) /
          Math.max(1, withCalculated.length)
      ) || 0;

    const pmAvg =
      clampPct(
        withCalculated.reduce((s, r) => s + r.pm, 0) / Math.max(1, withCalculated.length)
      ) || 0;

    const cmAvg =
      clampPct(
        withCalculated.reduce((s, r) => s + r.cm, 0) / Math.max(1, withCalculated.length)
      ) || 0;

    const best = [...withCalculated].sort((a, b) => b.overall - a.overall)[0]?.name || "-";
    const lowest = [...withCalculated].sort((a, b) => a.overall - b.overall)[0]?.name || "-";

    const now = new Date();
    const generatedAt = now.toLocaleString(undefined, {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });

    // Insights بسيطة للعرض التنفيذي
    const target = meta.defaultTarget;
    const overallGap = overallAvg - target;
    const insight1 =
      overallGap >= 0
        ? `Overall is on target (+${overallGap}%).`
        : `Overall is below target (${overallGap}%).`;
    const insight2 =
      pmAvg >= cmAvg
        ? `CM is lower than PM and may be the main driver of the gap.`
        : `PM is lower than CM and may be the main driver of the gap.`;

    return {
      withOverall: withCalculated,
      overallAvg,
      pmAvg,
      cmAvg,
      best,
      lowest,
      generatedAt,
      insights: [insight1, insight2, `Best: ${best}. Lowest: ${lowest}.`],
    };
  }, [regions, meta.defaultTarget]);

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

  function updateRegion() {
    const pmPlanned = toInt(form.pmPlanned);
    const pmCompleted = toInt(form.pmCompleted);
    const cmPlanned = toInt(form.cmPlanned);
    const cmCompleted = toInt(form.cmCompleted);
    const target = clampPct(Number(form.target));

    // حماية بسيطة: Completed ما يتجاوز Planned (اختياري)
    const safePmCompleted = Math.min(pmCompleted, pmPlanned);
    const safeCmCompleted = Math.min(cmCompleted, cmPlanned);

    setRegions((prev) =>
      prev.map((r) =>
        r.name === form.regionName
          ? {
              ...r,
              pmPlanned,
              pmCompleted: safePmCompleted,
              cmPlanned,
              cmCompleted: safeCmCompleted,
              target,
            }
          : r
      )
    );
  }

  function resetDemo() {
    localStorage.removeItem(STORAGE_KEY);
    setMeta(DEFAULT_META);
    setRegions(DEFAULT_REGIONS);
    setForm({
      regionName: DEFAULT_REGIONS[0].name,
      pmPlanned: DEFAULT_REGIONS[0].pmPlanned,
      pmCompleted: DEFAULT_REGIONS[0].pmCompleted,
      cmPlanned: DEFAULT_REGIONS[0].cmPlanned,
      cmCompleted: DEFAULT_REGIONS[0].cmCompleted,
      target: DEFAULT_REGIONS[0].target,
    });
  }

  function exportPdf() {
    window.print();
  }

  return (
    <div style={styles.page} className="print-wrap">
      {/* Print styles */}
      <style jsx global>{`
        @media print {
          @page {
            size: A4;
            margin: 14mm;
          }

          .no-print {
            display: none !important;
          }

          .print-clean {
            box-shadow: none !important;
          }

          header {
            position: static !important;
            box-shadow: none !important;
          }

          body {
            background: #ffffff !important;
          }
          * {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }

          table,
          tr,
          td,
          th {
            page-break-inside: avoid;
          }
        }
      `}</style>

      <header style={styles.header} className="print-clean">
        <div>
          <div style={styles.h1Row}>
            <div style={styles.h1}>{meta.reportTitle}</div>
            <span style={styles.demoBadge}>DEMO</span>
          </div>
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
          <button style={styles.primaryBtn} onClick={exportPdf}>
            Export PDF
          </button>
          <button style={styles.ghostBtn} onClick={resetDemo}>
            Reset Demo
          </button>
        </div>
      </header>

      {/* Input Panel */}
      <div style={styles.controlsWrap} className="no-print print-clean">
        <div style={styles.controlsTitle}>Data Entry (Planned / Completed)</div>

        <div style={styles.controlsGrid}>
          <div style={styles.field}>
            <label style={styles.label}>Region</label>
            <select
              style={styles.input}
              value={form.regionName}
              onChange={(e) => setForm((p) => ({ ...p, regionName: e.target.value }))}
            >
              {regions.map((r) => (
                <option key={r.name} value={r.name}>
                  {r.name}
                </option>
              ))}
            </select>
          </div>

          <div style={styles.field}>
            <label style={styles.label}>PM Planned</label>
            <input
              style={styles.input}
              type="number"
              min="0"
              value={form.pmPlanned}
              onChange={(e) => setForm((p) => ({ ...p, pmPlanned: e.target.value }))}
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>PM Completed</label>
            <input
              style={styles.input}
              type="number"
              min="0"
              value={form.pmCompleted}
              onChange={(e) => setForm((p) => ({ ...p, pmCompleted: e.target.value }))}
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>CM Planned</label>
            <input
              style={styles.input}
              type="number"
              min="0"
              value={form.cmPlanned}
              onChange={(e) => setForm((p) => ({ ...p, cmPlanned: e.target.value }))}
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>CM Completed</label>
            <input
              style={styles.input}
              type="number"
              min="0"
              value={form.cmCompleted}
              onChange={(e) => setForm((p) => ({ ...p, cmCompleted: e.target.value }))}
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Target %</label>
            <input
              style={styles.input}
              type="number"
              min="0"
              max="100"
              value={form.target}
              onChange={(e) => setForm((p) => ({ ...p, target: e.target.value }))}
            />
          </div>

          <div style={styles.actions}>
            <button style={styles.primaryBtn} onClick={updateRegion}>
              Update Dashboard
            </button>
            <button style={styles.ghostBtn} onClick={exportPdf}>
              Quick PDF
            </button>
          </div>
        </div>

        <div style={styles.note}>
          * Demo mode: stored locally in your browser only (no database). Overall% = average(PM%, CM%).
        </div>
      </div>

      {/* Executive summary */}
      <div style={styles.sectionTitle}>Executive Summary</div>

      <div style={styles.grid}>
        <Card
          title="Overall %"
          value={`${computed.overallAvg}%`}
          sub={`Target ${meta.defaultTarget}%`}
          tone={computed.overallAvg >= meta.defaultTarget ? "good" : "bad"}
        />
        <Card title="PM %" value={`${computed.pmAvg}%`} sub={`Target ${meta.defaultTarget}%`} />
        <Card title="CM %" value={`${computed.cmAvg}%`} sub={`Target ${meta.defaultTarget}%`} />
        <Card title="Best Region" value={computed.best} tone="good" />
        <Card title="Lowest Region" value={computed.lowest} tone="bad" />
      </div>

      <div style={styles.insightsWrap} className="print-clean">
        <div style={styles.insightsTitle}>Weekly Executive Insights</div>
        <ul style={styles.insightsList}>
          {computed.insights.map((x, idx) => (
            <li key={idx} style={styles.insightItem}>
              {x}
            </li>
          ))}
        </ul>
      </div>

      {/* Table */}
      <div style={{ ...styles.sectionTitle, marginTop: 22 }}>Regions Overview</div>

      <div style={styles.tableWrap} className="print-clean">
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Region</th>
              <th style={styles.thCenter}>PM Planned</th>
              <th style={styles.thCenter}>PM Done</th>
              <th style={styles.thCenter}>PM %</th>
              <th style={styles.thCenter}>CM Planned</th>
              <th style={styles.thCenter}>CM Done</th>
              <th style={styles.thCenter}>CM %</th>
              <th style={styles.thCenter}>Overall %</th>
              <th style={styles.thCenter}>Target</th>
              <th style={styles.thCenter}>Gap</th>
              <th style={styles.th}>Status</th>
            </tr>
          </thead>

          <tbody>
            {computed.withOverall.map((r) => {
              const ok = r.gap >= 0;

              return (
                <tr key={r.name} style={styles.tr}>
                  <td style={styles.tdStrong}>{r.name}</td>

                  <td style={styles.tdCenter}>{r.pmPlanned}</td>
                  <td style={styles.tdCenter}>{r.pmCompleted}</td>
                  <td style={styles.tdCenterStrong}>{r.pm}%</td>

                  <td style={styles.tdCenter}>{r.cmPlanned}</td>
                  <td style={styles.tdCenter}>{r.cmCompleted}</td>
                  <td style={styles.tdCenterStrong}>{r.cm}%</td>

                  <td style={styles.tdCenterStrong}>{r.overall}%</td>

                  <td style={styles.tdCenter}>{r.target}%</td>

                  <td style={{ ...styles.tdCenter, ...(ok ? styles.goodText : styles.badText) }}>
                    {ok ? `+${r.gap}%` : `${r.gap}%`}
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
          * For PDF: Click Export PDF → choose “Save as PDF”.
        </div>
      </div>

      <footer style={styles.footer}>
        © 2026 Maintenance KPI System — Demo Template. Developed by {meta.preparedBy}.
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
    flexWrap: "wrap",
  },

  h1Row: { display: "flex", alignItems: "center", gap: 10 },
  h1: { fontSize: 18, fontWeight: 950, color: "#0f172a" },
  h2: { marginTop: 6, fontSize: 12.5, color: "#475569", fontWeight: 650 },

  demoBadge: {
    fontSize: 12,
    fontWeight: 950,
    padding: "4px 10px",
    borderRadius: 999,
    background: "#fff7ed",
    color: "#9a3412",
    border: "1px solid #fed7aa",
  },

  metaLine: { marginTop: 10, display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" },
  metaPill: {
    fontSize: 12,
    color: "#0f172a",
    background: "#f1f5f9",
    border: "1px solid #e2e8f0",
    padding: "6px 10px",
    borderRadius: 999,
    fontWeight: 750,
  },
  metaDot: { color: "#94a3b8" },

  primaryBtn: {
    border: "1px solid #0f172a",
    background: "#0f172a",
    color: "#ffffff",
    padding: "10px 12px",
    borderRadius: 10,
    fontWeight: 950,
    cursor: "pointer",
  },
  ghostBtn: {
    border: "1px solid #e2e8f0",
    background: "#ffffff",
    color: "#0f172a",
    padding: "10px 12px",
    borderRadius: 10,
    fontWeight: 950,
    cursor: "pointer",
  },

  controlsWrap: {
    marginTop: 14,
    background: "#ffffff",
    borderRadius: 14,
    padding: 14,
    boxShadow: "0 10px 30px rgba(15,23,42,0.10)",
    border: "1px solid rgba(226,232,240,0.8)",
  },
  controlsTitle: { fontSize: 14, fontWeight: 950, color: "#0f172a" },
  controlsGrid: {
    marginTop: 12,
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))",
    gap: 12,
    alignItems: "end",
  },
  field: { display: "flex", flexDirection: "column", gap: 6 },
  label: { fontSize: 12, fontWeight: 850, color: "#334155" },
  input: {
    height: 40,
    borderRadius: 10,
    border: "1px solid #e2e8f0",
    padding: "0 10px",
    outline: "none",
    background: "#fff",
    color: "#0f172a",
    fontSize: 13,
  },
  actions: { display: "flex", gap: 10, flexWrap: "wrap" },
  note: { marginTop: 10, fontSize: 12, color: "#64748b", fontWeight: 650 },

  sectionTitle: { marginTop: 16, fontSize: 16, fontWeight: 950, color: "#0f172a" },
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
  },
  cardToneNeutral: {},
  cardToneGood: { borderLeft: "6px solid #16a34a" },
  cardToneBad: { borderLeft: "6px solid #dc2626" },

  cardTitle: { fontSize: 12, color: "#64748b", fontWeight: 850 },
  cardValue: { marginTop: 8, fontSize: 28, fontWeight: 950, color: "#0f172a" },
  cardSub: { marginTop: 6, fontSize: 12, color: "#64748b", fontWeight: 650 },

  insightsWrap: {
    marginTop: 12,
    background: "#ffffff",
    borderRadius: 14,
    padding: 12,
    border: "1px solid rgba(226,232,240,0.8)",
    boxShadow: "0 10px 30px rgba(15,23,42,0.10)",
  },
  insightsTitle: { fontSize: 13.5, fontWeight: 950, color: "#0f172a" },
  insightsList: { marginTop: 8, marginBottom: 0, paddingLeft: 18 },
  insightItem: { color: "#334155", fontWeight: 650, fontSize: 12.5, marginBottom: 6 },

  tableWrap: {
    marginTop: 12,
    background: "#ffffff",
    borderRadius: 14,
    padding: 10,
    overflowX: "auto",
    boxShadow: "0 10px 30px rgba(15,23,42,0.10)",
    border: "1px solid rgba(226,232,240,0.8)",
  },
  table: { width: "100%", borderCollapse: "collapse", minWidth: 980 },

  th: {
    textAlign: "left",
    padding: "12px 10px",
    fontSize: 12,
    color: "#475569",
    borderBottom: "1px solid #e2e8f0",
    fontWeight: 950,
    background: "#fafafa",
  },
  thCenter: {
    textAlign: "center",
    padding: "12px 10px",
    fontSize: 12,
    color: "#475569",
    borderBottom: "1px solid #e2e8f0",
    fontWeight: 950,
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
    fontWeight: 950,
    fontSize: 12,
    border: "1px solid #e2e8f0",
  },
  pillGood: { background: "#ecfdf5", color: "#166534", borderColor: "#bbf7d0" },
  pillBad: { background: "#fef2f2", color: "#991b1b", borderColor: "#fecaca" },

  goodText: { color: "#166534", fontWeight: 950 },
  badText: { color: "#991b1b", fontWeight: 950 },

  footer: { marginTop: 18, textAlign: "center", color: "#64748b", fontSize: 12, fontWeight: 650 },
};
