import { useEffect, useMemo, useState } from "react";
import Layout from "../components/Layout";
import KpiCard from "../components/KpiCard";
import RegionTable from "../components/RegionTable";
import { loadData } from "../lib/storage";

const DEFAULT_DATA = {
  lastUpdated: null,
  regions: {
    Riyadh: { pm: { planned: 0, completed: 0 }, cm: { planned: 0, completed: 0 }, employees: [] },
    Dammam: { pm: { planned: 0, completed: 0 }, cm: { planned: 0, completed: 0 }, employees: [] },
    Hofuf: { pm: { planned: 0, completed: 0 }, cm: { planned: 0, completed: 0 }, employees: [] },
  },
};

export default function Home() {
  const [data, setData] = useState(DEFAULT_DATA);

  useEffect(() => {
    // load from localStorage safely on client only
    const saved = loadData();
    if (saved && saved.regions) setData(saved);
  }, []);

  const summary = useMemo(() => {
    const regions = data?.regions || {};
    const names = Object.keys(regions);

    let pmPlanned = 0,
      pmCompleted = 0,
      cmPlanned = 0,
      cmCompleted = 0,
      totalEmployees = 0;

    for (const r of names) {
      const item = regions[r] || {};
      pmPlanned += Number(item?.pm?.planned || 0);
      pmCompleted += Number(item?.pm?.completed || 0);
      cmPlanned += Number(item?.cm?.planned || 0);
      cmCompleted += Number(item?.cm?.completed || 0);
      totalEmployees += (item?.employees || []).length;
    }

    const pmPct = pmPlanned ? Math.round((pmCompleted / pmPlanned) * 100) : 0;
    const cmPct = cmPlanned ? Math.round((cmCompleted / cmPlanned) * 100) : 0;

    return { pmPlanned, pmCompleted, cmPlanned, cmCompleted, pmPct, cmPct, totalEmployees };
  }, [data]);

  return (
    <Layout>
      <h1 style={{ marginBottom: 16 }}>Maintenance Performance Dashboard</h1>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(180px, 1fr))", gap: 12, marginBottom: 16 }}>
        <KpiCard title="PM Completion" value={`${summary.pmPct}%`} subtitle={`${summary.pmCompleted}/${summary.pmPlanned}`} />
        <KpiCard title="CM Completion" value={`${summary.cmPct}%`} subtitle={`${summary.cmCompleted}/${summary.cmPlanned}`} />
        <KpiCard title="Total Employees" value={`${summary.totalEmployees}`} subtitle="All regions" />
        <KpiCard title="Last Update" value={data?.lastUpdated ? new Date(data.lastUpdated).toLocaleString() : "—"} subtitle="Local" />
      </div>

      <RegionTable regions={data?.regions || {}} />
    </Layout>
  );
}

// ✅ SSR: prevents prerender/build crash
export async function getServerSideProps() {
  return { props: {} };
}
