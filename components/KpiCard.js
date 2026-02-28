import ProgressBar from "./ProgressBar";

export default function KpiCard({ title, value, subtitle, pct }) {
  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid rgba(15,23,42,0.08)",
        borderRadius: 14,
        padding: 14,
        boxShadow: "0 6px 18px rgba(15,23,42,0.06)",
      }}
    >
      <div style={{ fontSize: 12, letterSpacing: 0.2, opacity: 0.75, marginBottom: 8 }}>{title}</div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 12 }}>
        <div style={{ fontSize: 26, fontWeight: 800, color: "#0f172a" }}>{value}</div>
        <div style={{ fontSize: 12, opacity: 0.65 }}>{subtitle}</div>
      </div>

      {typeof pct === "number" ? (
        <div style={{ marginTop: 10 }}>
          <ProgressBar value={pct} height={10} />
        </div>
      ) : null}
    </div>
  );
}
