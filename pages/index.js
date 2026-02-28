import { useEffect, useMemo, useState } from "react";
import Layout from "../components/Layout";
import KpiCard from "../components/KpiCard";
import RegionTable from "../components/RegionTable";

const REGIONS = ["Dammam", "Hofuf", "Riyadh"];

const emptyRegion = (name) => ({
  name,
  pmPlanned: 0,
  pmCompleted: 0,
  cmPlanned: 0,
  cmCompleted: 0,
  staff: [],
  updatedAt: null,
});

const calcPct = (planned, completed) =>
  planned > 0 ? Math.round((completed / planned) * 100) : 0;

export default function Home() {
  const [regions, setRegions] = useState([]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const readAllRegions = () => {
      const data = REGIONS.map((name) => {
        const raw = localStorage.getItem(`kpi:${name}`);
        if (!raw) return emptyRegion(name);

        try {
          const d = JSON.parse(raw);
          return {
            ...emptyRegion(name),
            ...d,
            name,
            pmPlanned: Number(d.pmPlanned ?? 0),
            pmCompleted: Number(d.pmCompleted ?? 0),
            cmPlanned: Number(d.cmPlanned ?? 0),
            cmCompleted: Number(d.cmCompleted ?? 0),
            staff: Array.isArray(d.staff) ? d.staff : [],
          };
        } catch {
          return emptyRegion(name);
        }
      });

      setRegions(data);
    };

    readAllRegions();

    window.addEventListener("kpi_updated", readAllRegions);
    window.addEventListener("storage", readAllRegions);

    return () => {
      window.removeEventListener("kpi_updated", readAllRegions);
      window.removeEventListener("storage", readAllRegions);
    };
  }, []);

  const regionWithPct = useMemo(() => {
    return regions.map((r) => {
      const pmPct = calcPct(r.pmPlanned, r.pmCompleted);
      const cmPct = calcPct(r.cmPlanned, r.cmCompleted);
      const overall = Math.round((pmPct + cmPct) / 2);

      return {
        ...r,
        pmPct,
        cmPct,
        overall,
        target: 90,
        staffCount: r.staff?.length || 0,
      };
    });
  }, [regions]);

  const overallAvg = useMemo(() => {
    if (!regionWithPct.length) return 0;
    return Math.round(
      regionWithPct.reduce((a, r) => a + r.overall, 0) /
        regionWithPct.length
    );
  }, [regionWithPct]);

  return (
    <Layout>
      <h2>Maintenance Performance Dashboard</h2>

      <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
        <KpiCard title="Overall %" value={`${overallAvg}%`} />
      </div>

      <RegionTable regions={regionWithPct} />
    </Layout>
  );
}
