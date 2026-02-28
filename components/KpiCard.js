export default function KpiCard({ title, value, subtitle }) {
  return (
    <div
      style={{
        background: "white",
        padding: "16px",
        borderRadius: "12px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
      }}
    >
      <div style={{ fontSize: 14, color: "#666", marginBottom: 6 }}>
        {title}
      </div>

      <div style={{ fontSize: 26, fontWeight: "bold" }}>
        {value}
      </div>

      <div style={{ fontSize: 12, color: "#999", marginTop: 4 }}>
        {subtitle}
      </div>
    </div>
  );
}
