export default function ProgressBar({ value = 0, height = 10, label }) {
  const v = Math.max(0, Math.min(100, Number(value) || 0));

  return (
    <div style={{ width: "100%" }}>
      {label ? (
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, opacity: 0.85, marginBottom: 6 }}>
          <span>{label}</span>
          <span>{v}%</span>
        </div>
      ) : null}

      <div
        style={{
          height,
          background: "rgba(0,0,0,0.08)",
          borderRadius: 999,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${v}%`,
            height: "100%",
            borderRadius: 999,
            background: "linear-gradient(90deg, #22c55e, #16a34a)",
            transition: "width 250ms ease",
          }}
        />
      </div>
    </div>
  );
}
