export default function RegionTable({ regions }) {
  const names = Object.keys(regions || {});

  return (
    <div
      style={{
        background: "white",
        borderRadius: "12px",
        padding: "20px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
      }}
    >
      <h3 style={{ marginBottom: 16 }}>Regions Overview</h3>

      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ textAlign: "left", borderBottom: "1px solid #eee" }}>
            <th>Region</th>
            <th>PM</th>
            <th>CM</th>
            <th>Employees</th>
          </tr>
        </thead>

        <tbody>
          {names.map((name) => {
            const r = regions[name];

            return (
              <tr key={name} style={{ borderBottom: "1px solid #f0f0f0" }}>
                <td>{name}</td>
                <td>
                  {r?.pm?.completed || 0} / {r?.pm?.planned || 0}
                </td>
                <td>
                  {r?.cm?.completed || 0} / {r?.cm?.planned || 0}
                </td>
                <td>{(r?.employees || []).length}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
