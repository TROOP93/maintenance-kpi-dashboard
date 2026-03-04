import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import DashboardView from "../components/DashboardView";
import { loadData } from "../lib/storage";

const DEFAULT_DATA = { lastUpdated: null, regions: {} };

export default function Reports() {
  const [data, setData] = useState(DEFAULT_DATA);

  useEffect(() => {
    const saved = loadData();
    if (saved && saved.regions) setData(saved);
  }, []);

  const printPdf = () => window.print();

  return (
    <Layout>
      {/* ✅ هذا الجزء يظهر بالشاشة فقط */}
      <div className="no-print" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
        <h2 style={{ margin: 0 }}>Reports</h2>
        <button
          onClick={printPdf}
          style={{ padding: "10px 14px", borderRadius: 12, border: 0, background: "#2563eb", color: "#fff", fontWeight: 900, cursor: "pointer" }}
        >
          Export PDF (Print)
        </button>
      </div>

      {/* ✅ هذا هو الداشبورد اللي بينطبع */}
      <div id="print-area">
        <DashboardView data={data} />
      </div>

      {/* ✅ ستايل الطباعة */}
      <style jsx global>{`
        @media print {
          .no-print { display: none !important; }
          /* نخفي السايدبار بالكامل وقت الطباعة */
          aside, .sidebar, nav { display: none !important; }

          /* نخلي المحتوى ياخذ كامل الصفحة */
          #print-area { width: 100% !important; }

          /* ننظف الهوامش */
          body { margin: 0; }
        }
      `}</style>
    </Layout>
  );
}

export async function getServerSideProps() {
  return { props: {} };
}
