import Layout from "../components/Layout";

export default function Reports() {
  const exportPdf = () => {
    window.print(); // Print -> Save as PDF
  };

  return (
    <Layout>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
        <div>
          <div style={{ fontSize: 20, fontWeight: 900 }}>Reports</div>
          <div style={{ color: "#64748b", marginTop: 6 }}>
            Export PDF (Print to PDF)
          </div>
        </div>

        <button
          onClick={exportPdf}
          style={{
            padding: "10px 14px",
            borderRadius: 12,
            border: 0,
            background: "#0f172a",
            color: "#fff",
            cursor: "pointer",
            fontWeight: 900,
          }}
        >
          Export PDF
        </button>
      </div>

      <div style={{ marginTop: 16, background: "#fff", borderRadius: 14, padding: 14, boxShadow: "0 8px 24px rgba(15,23,42,0.08)" }}>
        <p style={{ margin: 0, color: "#64748b" }}>
          هنا لاحقًا نخلي التقرير يجيب بيانات المناطق من Data Entry ويعرضها بشكل مرتب قبل التصدير.
        </p>
      </div>
    </Layout>
  );
}
