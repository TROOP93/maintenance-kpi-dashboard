import { useEffect, useMemo, useState } from "react";
import Layout from "../components/Layout";
import KpiCard from "../components/KpiCard";
import RegionTable from "../components/RegionTable";

const REGIONS = ["Dammam", "Hofuf", "Riyadh"];

export default function Home() {
  const [regionsData, setRegionsData] = useState({});

  const loadAllRegions = () => {
    const all = {};

    REGIONS.forEach((region) => {
      const raw = localStorage.getItem(`kpi:${region}`);
      if (raw) {
        const d = JSON.parse(raw);

        all[region] = {
          pm: {
            planned: d.pmPlanned || 0,
            completed: d.pmCompleted || 0,
          },
          cm: {
            planned: d.cmPlanned || 0,
            completed: d.cmCompleted || 0,
          },
          employees: d.staff || [],
        };
      } else {
        all[region] = {
          pm: { planned: 0, completed: 0 },
          cm: { planned: 0, completed: 0 },
          employees: [],
        };
      }
    });

    setRegionsData(all);
  };

  useEffect(() => {
    loadAllRegions();

    const onUpdate = () => loadAllRegions();

    window.addEventListener("kpi-data-updated", onUpdate);
    window.addEventListener("storage", onUpdate);

    return () => {
      window.removeEventListener("kpi-data-updated", onUpdate);
      window.removeEventListener("storage", onUpdate);
    };
  }, []);

  const summary = useMemo(() => {
    let pmPlanned = 0;
    let pmCompleted = 0;
    let cmPlanned = 0;
    let cmCompleted = 0;
    let totalEmployees = 0;

    Object.values(regionsData).forEach((r) => {
      pmPlanned += Number(r?.pm?.planned || 0);
      pmCompleted += Number(r?.pm?.completed || 0);
      cmPlanned += Number(r?.cm?.planned || 0);
      cmCompleted += Number(r?.cm?.completed || 0);
      totalEmployees += (r?.employees || []).length;
    });

    const pmPct = pmPlanned ? Math.round((pmCompleted / pmPlanned) * 100) : 0;
    const cmPct = cmPlanned ? Math.round((cmCompleted / cmPlanned) * 100) : 0;

    return {
      pmPlanned,
      pmCompleted,
      cmPlanned,
      cmCompleted,
      pmPct,
      cmPct,
      totalEmployees,
    };
  }, [regionsData]);

  return (
    <Layout>
      <h1 style={{ marginBottom: 16 }}>Maintenance Performance Dashboard</h1>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: 12,
          marginBottom: 16,
        }}
      >
        <KpiCard
          title="PM Completion"
          value={`${summary.pmPct}%`}
          subtitle={`${summary.pmCompleted}/${summary.pmPlanned}`}
          pct={summary.pmPct}
        />

        <KpiCard
          title="CM Completion"
          value={`${summary.cmPct}%`}
          subtitle={`${summary.cmCompleted}/${summary.cmPlanned}`}
          pct={summary.cmPct}
        />

        <KpiCard
          title="Total Employees"
          value={`${summary.totalEmployees}`}
          subtitle="All Regions"
        />
      </div>

      <RegionTable regions={regionsData} />
    </Layout>
  );
}
