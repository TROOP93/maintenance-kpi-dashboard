import React, { useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "maintenance_demo_sidebar_v1";

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
    employees: Array.from({ length: 18 }, (_, i) => `Employee ${i + 1}`),
  },
  {
    name: "Hofuf",
    pmPlanned: 60,
    pmCompleted: 51,
    cmPlanned: 30,
    cmCompleted: 28,
    target: 90,
    employees: Array.from({ length: 9 }, (_, i) => `Employee ${i + 1}`),
  },
  {
    name: "Riyadh",
    pmPlanned: 70,
    pmCompleted: 60,
    cmPlanned: 35,
    cmCompleted: 33,
    target: 90,
    employees: Array.from({ length: 5 }, (_, i) => `Employee ${i + 1}`),
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

  // UI State
  const [activeView, setActiveView] = useState("dashboard"); // dashboard | entry
  const [selectedRegionName, setSelectedRegionName] = useState(DEFAULT_REGIONS[0].name);
  const [hoveredRegion, setHoveredRegion] = useState(null);

  // Load local demo data
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (parsed?.regions?.length) setRegions(parsed.regions);
      if (parsed?.meta) setMeta((m) => ({ ...m, ...parsed.meta }));
      if (parsed?.selectedRegionName) setSelectedRegionName(parsed.selectedRegionName);
      if (parsed?.activeView) setActiveView(parsed.activeView);
    } catch {
      // ignore
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Save local demo data
  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ meta, regions, selectedRegionName, activeView })
      );
    } catch {
      // ignore
    }
  }, [meta, regions, selectedRegionName, activeView]);

  const selectedRegion = useMemo(
    () => regions.find((r) => r.name === selectedRegionName) ?? regions[0],
    [regions, selectedRegionName]
  );

  // Entry form state (bind to selected region)
  const [form, setForm] = useState({
    pmPlanned: selectedRegion.pmPlanned,
    pmCompleted: selectedRegion.pmCompleted,
    cmPlanned: selectedRegion.cmPlanned,
    cmCompleted: selectedRegion.cmCompleted,
    target: selectedRegion.target,
  });

  // Employee add input
  const [newEmployee, setNewEmployee] = useState("");

  useEffect(() => {
    if (!selectedRegion) return;
    setForm({
      pmPlanned: selectedRegion.pmPlanned,
      pmCompleted: selectedRegion.pmCompleted,
      cmPlanned: selectedRegion.cmPlanned,
      cmCompleted: selectedRegion.cmCompleted,
      target: selectedRegion.target,
    });
    setNewEmployee("");
  }, [selectedRegionName]); // when region changes

  const computed = useMemo(() => {
    const withCalculated = regions.map((r) => {
      const pm = pct(r.pmCompleted, r.pmPlanned);
      const cm = pct(r.cmCompleted, r.cmPlanned);
      const overall = clampPct((pm + cm) / 2);
      const gap = overall - (r.target ?? meta.defaultTarget);
      const employeesCount = Array.isArray(r.employees) ? r.employees.length : 0;
      return { ...r, pm, cm, overall, gap, employeesCount };
    });

    const overallAvg =
      clampPct(
        withCalculated.reduce((s, r) => s + r.overall, 0) / Math.max(1, withCalculated.length)
      ) || 0;

    const pmAvg =
      clampPct(withCalculated.reduce((s, r) => s + r.pm, 0) / Math.max(1, withCalculated.length)) ||
      0;

    const cmAvg =
      clampPct(withCalculated.reduce((s, r) => s + r.cm, 0) / Math.max(1, withCalculated.length)) ||
      0;

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

    const target = meta.defaultTarget;
    const overallGap = overallAvg - target;
    const insight1 =
      overallGap >= 0 ? `Overall is on target (+${overallGap}%).` : `Overall is below target (${overallGap}%).`;
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

  function exportPdf() {
    window.print();
  }

  function resetDemo() {
    localStorage.removeItem(STORAGE_KEY);
    setMeta(DEFAULT_META);
    setRegions(DEFAULT_REGIONS);
    setSelectedRegionName(DEFAULT_REGIONS[0].name);
    setActiveView("dashboard");
    setHoveredRegion(null);
  }

  function goEntry(regionName) {
    setSelectedRegionName(regionName);
    setActiveView("entry");
  }

  function updateRegionNumbers() {
    const pmPlanned = toInt(form.pmPlanned);
    const pmCompleted = Math.min(toInt(form.pmCompleted), pmPlanned);
    const cmPlanned = toInt(form.cmPlanned);
    const cmCompleted = Math.min(toInt(form.cmCompleted), cmPlanned);
    const target = clampPct(Number(form.target));

    setRegions((prev) =>
      prev.map((r) =>
        r.name === selectedRegionName
          ? { ...r, pmPlanned, pmCompleted, cmPlanned, cmCompleted, target }
          : r
      )
    );
  }

  function addEmployee() {
    const name = (newEmployee || "").trim();
    if (!name) return;

    setRegions((prev) =>
      prev.map((r) => {
        if (r.name !== selectedRegionName) return r;
        const current = Array.isArray(r.employees) ? r.employees : [];
        // Prevent duplicates (optional)
        if (current.some((x) => x.toLowerCase() === name.toLowerCase())) return r;
        return { ...r, employees: [...current, name] };
      })
    );
    setNewEmployee("");
  }

  function removeEmployee(name) {
    setRegions((prev) =>
      prev.map((r) => {
        if (r.name !== selectedRegionName) return r;
        const current = Array.isArray(r.employees) ? r.employees : [];
        return { ...r, employees: current.filter((x) => x !== name) };
      })
    );
  }

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

  const SidebarRegionItem = ({ region }) => {
    const isSelected = region.name === selectedRegionName;

    const names = Array.isArray(region.employees) ? region.employees : [];
    const previewNames = names.slice(0, 8);
    const more = Math.max(0, names.length - previewNames.length);

    return (
      <div
        style={{ ...styles.regionItem, ...(isSelected ? styles.regionItemActive : null) }}
        onMouseEnter={() => setHoveredRegion(region.name)}
        onMouseLeave={() => setHoveredRegion(null)}
        onClick={() => {
          setSelectedRegionName(region.name);
          setActiveView("dashboard");
        }}
      >
        <div style={styles.regionItemRow}>
          <div style={styles.regionName}>{region.name}</div>
          <div style={styles.regionCount}>{names.length}</div>
        </div>

        {/* Tooltip */}
        {hoveredRegion === region.name ? (
          <div style={styles.tooltip}>
            <div style={styles.tooltipTitle}>
              Employees ({names.length})
            </div>
            <div style={styles.tooltipBody}>
              {names.length === 0 ? (
                <div style={styles.tooltipMuted}>No employees added</div>
              ) : (
                <>
                  <div style={styles.tooltipNames}>
                    {previewNames.join(", ")}
                    {more > 0 ? ` … +${more} more` : ""}
                  </div>
                  <div style={styles.tooltipHint}>Click “Data Entry” to manage names</div>
                </>
              )}
            </div>
          </div>
        ) : null}
      </div>
    );
  };

  return (
    <div style={styles.shell}>
      {/* Print styles */}
      <style jsx global>{`
        @media print {
          @page { size: A4; margin: 14mm; }
          body { background: #ffffff !important; }
          * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }

          /* Hide sidebar + entry panel buttons in print */
          .no-print { display: none !important; }

          /* Remove shadows for clean pdf */
          .print-clean { box-shadow: none !important; }
          header { position: static !important; box-shadow: none !important; }

          table, tr, td, th { page-break-inside: avoid; }
        }
      `}</style>

      {/* Sidebar */}
      <aside style={styles.sidebar} className="no-print">
        <div style={styles.sideHeader}>
          <div style={styles.sideTitle}>KPI Menu</div>
          <div style={styles.sideSub}>Demo Mode</div>
        </div>

        <div style={styles.sideBtns}>
          <button
            style={{ ...styles.sideBtn, ...(activeView === "dashboard" ? styles.sideBtnActive : null) }}
            onClick={() => setActiveView("dashboard")}
          >
            Dashboard
          </button>

          <button
            style={{ ...styles.sideBtn, ...(activeView === "entry" ? styles.sideBtnActive : null) }}
            onClick={() => setActiveView("entry")}
          >
            Data Entry
          </button>

          <button style={styles.sideBtn} onClick={exportPdf}>
            Export PDF
          </button>

          <button style={styles.sideBtnGhost} onClick={resetDemo}>
            Reset Demo
          </button>
        </div>

        <div style={styles.sideSectionTitle}>Regions</div>

        <div style={styles.regionList}>
          {regions.map((r) => (
            <SidebarRegionItem key={r.name} region={r} />
          ))}
        </div>

        <div style={styles.sideFooter}>
          <div style={styles.sideFooterLine}>Prepared by {meta.preparedBy}</div>
          <div style={styles.sideFooterSmall}>Tip: hover region to see employees</div>
        </div>
      </aside>

      {/* Main */}
      <main style={styles.main}>
        {/* Header */}
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
              <span style={styles.metaPill}>Region: {selectedRegionName}</span>
            </div>
          </div>

          {/* Right side for big screens only (print-clean) */}
          <div style={styles.headerRight} className="no-print">
            <button style={styles.primaryBtn} onClick={exportPdf}>
              Export PDF
            </button>
            <button style={styles.ghostBtn} onClick={() => goEntry(selectedRegionName)}>
              Edit {selectedRegionName}
            </button>
          </div>
        </header>

        {/* Views */}
        {activeView === "entry" ? (
          <section style={styles.panel} className="no-print print-clean">
            <div style={styles.panelTitle}>Data Entry — {selectedRegionName}</div>

            <div style={styles.entryGrid}>
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
                <button style={styles.primaryBtn} onClick={updateRegionNumbers}>
                  Save Region Data
                </button>
                <button style={styles.ghostBtn} onClick={() => setActiveView("dashboard")}>
                  Back to Dashboard
                </button>
              </div>
            </div>

            {/* Employees */}
            <div style={styles.empWrap}>
              <div style={styles.empHeader}>
                <div style={styles.empTitle}>
                  Employees ({(selectedRegion?.employees || []).length})
                </div>
                <div style={styles.empSub}>
                  Add names manually (demo — stored locally)
                </div>
              </div>

              <div style={styles.empAddRow}>
                <input
                  style={styles.input}
                  placeholder="Employee name..."
                  value={newEmployee}
                  onChange={(e) => setNewEmployee(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") addEmployee();
                  }}
                />
                <button style={styles.primaryBtn} onClick={addEmployee}>
                  Add
                </button>
              </div>

              <div style={styles.empList}>
                {(selectedRegion?.employees || []).length === 0 ? (
                  <div style={styles.muted}>No employees yet.</div>
                ) : (
                  (selectedRegion?.employees || []).map((name) => (
                    <div key={name} style={styles.empPill}>
                      <span style={styles.empName}>{name}</span>
                      <button style={styles.empRemove} onClick={() => removeEmployee(name)}>
                        Remove
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div style={styles.note}>
              * Completed is auto-limited to Planned to avoid over-100% (demo safety).
            </div>
          </section>
        ) : null}

        {/* Dashboard / Report (this prints) */}
        <section style={styles.report}>
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

          <div style={{ ...styles.sectionTitle, marginTop: 18 }}>Regions Overview</div>

          <div style={styles.tableWrap} className="print-clean">
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Region</th>
                  <th style={styles.thCenter}>Employees</th>
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
                      <td style={styles.tdCenterStrong}>{r.employeesCount}</td>

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
              * For PDF: Use Export PDF → choose “Save as PDF”. (Sidebar and Data Entry are hidden in PDF)
            </div>
          </div>

          <footer style={styles.footer}>
            © 2026 Maintenance KPI System — Demo Template. Developed by {meta.preparedBy}.
          </footer>
        </section>
      </main>
    </div>
  );
}

const styles = {
  // Shell layout
  shell: { display: "flex", minHeight: "100vh", background: "#f6f7fb" },

  sidebar: {
    width: 270,
    background: "#0f172a",
    color: "#e2e8f0",
    padding: 14,
    position: "sticky",
    top: 0,
    height: "100vh",
    overflow: "auto",
    borderRight: "1px solid rgba(255,255,255,0.08)",
  },
  sideHeader: { padding: 10, borderRadius: 12, background: "rgba(255,255,255,0.06)" },
  sideTitle: { fontWeight: 950, fontSize: 14 },
  sideSub: { marginTop: 4, fontSize: 12, color: "#94a3b8", fontWeight: 700 },

  sideBtns: { marginTop: 12, display: "grid", gap: 8 },
  sideBtn: {
    width: "100%",
    textAlign: "left",
    border: "1px solid rgba(255,255,255,0.12)",
    background: "rgba(255,255,255,0.06)",
    color: "#e2e8f0",
    padding: "10px 10px",
    borderRadius: 10,
    fontWeight: 900,
    cursor: "pointer",
  },
  sideBtnActive: {
    background: "rgba(255,255,255,0.14)",
    borderColor: "rgba(255,255,255,0.22)",
  },
  sideBtnGhost: {
    width: "100%",
    textAlign: "left",
    border: "1px solid rgba(255,255,255,0.12)",
    background: "transparent",
    color: "#e2e8f0",
    padding: "10px 10px",
    borderRadius: 10,
    fontWeight: 900,
    cursor: "pointer",
  },

  sideSectionTitle: { marginTop: 14, fontSize: 12, fontWeight: 950, color: "#cbd5e1" },

  regionList: { marginTop: 10, display: "grid", gap: 8 },
  regionItem: {
    position: "relative",
    border: "1px solid rgba(255,255,255,0.12)",
    background: "rgba(255,255,255,0.06)",
    borderRadius: 12,
    padding: 10,
    cursor: "pointer",
  },
  regionItemActive: { background: "rgba(255,255,255,0.14)", borderColor: "rgba(255,255,255,0.22)" },
  regionItemRow: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 },
  regionName: { fontWeight: 950, fontSize: 13, color: "#e2e8f0" },
  regionCount: {
    minWidth: 28,
    height: 24,
    borderRadius: 999,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "rgba(255,255,255,0.14)",
    border: "1px solid rgba(255,255,255,0.14)",
    fontWeight: 950,
    fontSize: 12,
  },

  tooltip: {
    position: "absolute",
    left: "100%",
    top: 0,
    marginLeft: 10,
    width: 260,
    background: "#ffffff",
    color: "#0f172a",
    borderRadius: 12,
    padding: 10,
    boxShadow: "0 12px 30px rgba(0,0,0,0.18)",
    border: "1px solid #e2e8f0",
    zIndex: 50,
  },
  tooltipTitle: { fontWeight: 950, fontSize: 13 },
  tooltipBody: { marginTop: 6 },
  tooltipNames: { fontSize: 12.5, color: "#334155", fontWeight: 650, lineHeight: 1.35 },
  tooltipHint: { marginTop: 8, fontSize: 12, color: "#64748b", fontWeight: 650 },
  tooltipMuted: { fontSize: 12.5, color: "#64748b", fontWeight: 650 },

  sideFooter: { marginTop: 16, paddingTop: 12, borderTop: "1px solid rgba(255,255,255,0.10)" },
  sideFooterLine: { fontSize: 12, fontWeight: 850, color: "#cbd5e1" },
  sideFooterSmall: { marginTop: 4, fontSize: 12, fontWeight: 650, color: "#94a3b8" },

  // Main
  main: { flex: 1, padding: 18, fontFamily: "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial" },

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
  headerRight: { display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" },

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

  panel: {
    marginTop: 14,
    background: "#ffffff",
    borderRadius: 14,
    padding: 14,
    boxShadow: "0 10px 30px rgba(15,23,42,0.10)",
    border: "1px solid rgba(226,232,240,0.8)",
  },
  panelTitle: { fontSize: 14, fontWeight: 950, color: "#0f172a" },

  entryGrid: {
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

  empWrap: { marginTop: 14, paddingTop: 12, borderTop: "1px solid #eef2f7" },
  empHeader: { display: "flex", flexDirection: "column", gap: 4 },
  empTitle: { fontSize: 13.5, fontWeight: 950, color: "#0f172a" },
  empSub: { fontSize: 12, color: "#64748b", fontWeight: 650 },

  empAddRow: { marginTop: 10, display: "flex", gap: 10, flexWrap: "wrap" },

  empList: { marginTop: 10, display: "flex", flexWrap: "wrap", gap: 8 },
  empPill: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "8px 10px",
    borderRadius: 999,
    border: "1px solid #e2e8f0",
    background: "#f8fafc",
  },
  empName: { fontWeight: 850, color: "#0f172a", fontSize: 12.5 },
  empRemove: {
    border: "1px solid #fecaca",
    background: "#fef2f2",
    color: "#991b1b",
    borderRadius: 999,
    padding: "6px 10px",
    fontWeight: 950,
    cursor: "pointer",
    fontSize: 12,
  },

  muted: { color: "#64748b", fontWeight: 650, fontSize: 12.5 },

  // Report
  report: { marginTop: 14 },
  sectionTitle: { marginTop: 6, fontSize: 16, fontWeight: 950, color: "#0f172a" },

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
  table: { width: "100%", borderCollapse: "collapse", minWidth: 1040 },

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

  note: { marginTop: 10, fontSize: 12, color: "#64748b", fontWeight: 650 },
  footer: { marginTop: 18, textAlign: "center", color: "#64748b", fontSize: 12, fontWeight: 650 },
};
