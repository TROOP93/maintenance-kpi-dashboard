import Layout from "../components/Layout";
import KpiCard from "../components/KpiCard";
import RegionTable from "../components/RegionTable";

export default function Home() {
  // بيانات تجريبية (بعدها نخليها من التخزين)
  const regions = [
    { name: "Dammam", pmPlanned: 40, pmCompleted: 35, cmPlanned: 30, cmCompleted: 21, staff: ["Ahmad", "Abdulrhman"] },
    { name: "Hofuf", pmPlanned: 22, pmCompleted: 20, cmPlanned: 18, cmCompleted: 17, staff: ["Mohammed", "Othman"] },
    { name: "Riyadh", pmPlanned: 55, pmCompleted: 46, cmPlanned: 25, cmCompleted: 24, staff: ["Abdullah", "Abdulaziz"] },
  ];

  // حساب KPI
  const calcPct = (planned, completed) => (planned > 0 ? Math.round((completed / planned) * 100) : 0);

  const regionWithPct = regions.map((r) => {
    const pmPct = calcPct(r.pmPlanned, r.pmCompleted);
    const cmPct = calcPct(r.cmPlanned, r.cmCompleted);
    const overall = Math.round((pmPct + cmPct) / 2);
    return { ...r, pmPct, cmPct, overall, target: 90 };
  });

  const overallAvg = Math.round(regionWithPct.reduce((a, r) => a + r.overall, 0) / regionWithPct.length);
  const pmAvg = Math.round(regionWithPct.reduce((a, r) => a + r.pmPct, 0) / regionWithPct.length);
  const cmAvg = Math.round(regionWithPct.reduce((a, r) => a + r.cmPct, 0) / regionWithPct.length);

  const best = [...regionWithPct].sort((a, b) => b.overall - a.overall)[0]?.name || "-";
  const lowest = [...regionWithPct].sort((a, b) => a.overall - b.overall)[0]?.name || "-";

  return (
    <Layout>
      <div style={{ marginBottom: 12 }}>
        <div style={{ fontSize: 20, fontWeight: 900 }}>Maintenance Performance Dashboard</div>
        <div style={{ color: "#64748b", marginTop: 6 }}>
          PM & CM Performance Tracking
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))", gap: 12 }}>
        <KpiCard title="Overall %" value={`${overallAvg}%`} sub="Target 90%" />
        <KpiCard title="PM %" value={`${pmAvg}%`} sub="Target 90%" />
        <KpiCard title="CM %" value={`${cmAvg}%`} sub="Target 90%" />
        <KpiCard title="Best Region" value={best} />
        <KpiCard title="Lowest Region" value={lowest} />
      </div>

      <div style={{ marginTop: 18, fontSize: 16, fontWeight: 900 }}>Regions Overview</div>
      <RegionTable regions={regionWithPct} />
    </Layout>
  );
}
