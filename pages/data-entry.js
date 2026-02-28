import { useMemo, useState, useEffect } from "react";
import Layout from "../components/Layout";

export default function DataEntry() {
  const regionsList = useMemo(() => ["Dammam", "Hofuf", "Riyadh"], []);
  const [region, setRegion] = useState("Dammam");

  const [pmPlanned, setPmPlanned] = useState(0);
  const [pmCompleted, setPmCompleted] = useState(0);
  const [cmPlanned, setCmPlanned] = useState(0);
  const [cmCompleted, setCmCompleted] = useState(0);

  const [staffNames, setStaffNames] = useState([""]);
  const staffCount = staffNames.filter((x) => x.trim()).length;

  const pct = (planned, completed) =>
    planned > 0 ? Math.round((completed / planned) * 100) : 0;

  const pmPct = pct(Number(pmPlanned), Number(pmCompleted));
  const cmPct = pct(Number(cmPlanned), Number(cmCompleted));
  const overall = Math.round((pmPct + cmPct) / 2);

  const inputStyle = {
    width: "100%",
    padding: 10,
    borderRadius: 10,
    border: "1px solid rgba(15,23,42,0.12)",
    outline: "none",
    fontSize: 14,
    background: "#fff",
  };

  const card = {
    background: "#fff",
    borderRadius: 14,
    padding: 14,
    border: "1px solid rgba(15,23,42,0.08)",
    boxShadow: "0 6px 18px rgba(15,23,42,0.06)",
  };

  // ✅ عند تغيير المنطقة: نعمل Load تلقائي لو فيه بيانات
  useEffect(() => {
    const raw = localStorage.getItem(`kpi:${region}`);
    if (!raw) {
      // Reset لو مافيه بيانات
      setPmPlanned(0);
      setPmCompleted(0);
      setCmPlanned(0);
      setCmCompleted(0);
      setStaffNames([""]);
      return;
    }

    try {
      const d = JSON.parse(raw);
      setPmPlanned(d.pmPlanned ?? 0);
      setPmCompleted(d.pmCompleted ?? 0);
      setCmPlanned(d.cmPlanned ?? 0);
      setCmCompleted(d.cmCompleted ?? 0);
      setStaffNames(d.staff?.length ? d.staff : [""]);
    } catch {
      // لو البيانات خربانة
      setPmPlanned(0);
      setPmCompleted(0);
      setCmPlanned(0);
      setCmCompleted(0);
      setStaffNames([""]);
    }
  }, [region]);

  const addStaff = () => setStaffNames((s) => [...s, ""]);
  const removeStaff = (idx) => setStaffNames((s) => s.filter((_, i) => i !== idx));
  const updateStaff = (idx, val) =>
    setStaffNames((s) => s.map((x, i) => (i === idx ? val : x)));

  const save = () => {
    const payload = {
      region,
      pmPlanned: Number(pmPlanned),
      pmCompleted: Number(pmCompleted),
      cmPlanned: Number(cmPlanned),
      cmCompleted: Number(cmCompleted),
      staff: staffNames.map((x) => x.trim()).filter(Boolean),
      updatedAt: new Date().toISOString(),
    };

    localStorage.setItem(`kpi:${region}`, JSON.stringify(payload));

    // ✅ هذا يخلي الداشبورد يتحدث تلقائي
    window.dispatchEvent(new Event("kpi-data-updated"));

    alert(`Saved ✅ (${region})`);
  };

  const clear = () => {
    localStorage.removeItem(`kpi:${region}`);
    window.dispatchEvent(new Event("kpi-data-updated"));

    setPmPlanned(0);
    setPmCompleted(0);
    setCmPlanned(0);
    setCmCompleted(0);
    setStaffNames([""]);

    alert(`Cleared ✅ (${region})`);
  };

  return (
    <Layout>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
        <div>
          <div style={{ fontSize: 20, fontWeight: 900 }}>Data Entry</div>
          <div style={{ color: "#64748b", marginTop: 6 }}>
            Planned / Completed لكل منطقة + أسماء الموظفين (حفظ تلقائي للمنطقة)
          </div>
        </div>

        <div style={{ minWidth: 240 }}>
          <div style={{ fontSize: 12, color: "#64748b", marginBottom: 6 }}>Select Region</div>
          <select value={region} onChange={(e) => setRegion(e.target.value)} style={inputStyle}>
            {regionsList.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 12, marginTop: 14 }}>
        {/* PM */}
        <div style={card}>
          <div style={{ fontWeight: 900, marginBottom: 10 }}>PM</div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <div>
              <div style={{ fontSize: 12, color: "#64748b", marginBottom: 6 }}>Planned</div>
              <input type="number" value={pmPlanned} onChange={(e) => setPmPlanned(e.target.value)} style={inputStyle} />
            </div>

            <div>
              <div style={{ fontSize: 12, color: "#64748b", marginBottom: 6 }}>Completed</div>
              <input type="number" value={pmCompleted} onChange={(e) => setPmCompleted(e.target.value)} style={inputStyle} />
            </div>
          </div>

          <div style={{ marginTop: 12, fontWeight: 900 }}>
            PM %: <span style={{ color: pmPct >= 90 ? "#16a34a" : pmPct >= 70 ? "#f97316" : "#dc2626" }}>{pmPct}%</span>
          </div>
        </div>

        {/* CM */}
        <div style={card}>
          <div style={{ fontWeight: 900, marginBottom: 10 }}>CM</div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <div>
              <div style={{ fontSize: 12, color: "#64748b", marginBottom: 6 }}>Planned</div>
              <input type="number" value={cmPlanned} onChange={(e) => setCmPlanned(e.target.value)} style={inputStyle} />
            </div>

            <div>
              <div style={{ fontSize: 12, color: "#64748b", marginBottom: 6 }}>Completed</div>
              <input type="number" value={cmCompleted} onChange={(e) => setCmCompleted(e.target.value)} style={inputStyle} />
            </div>
          </div>

          <div style={{ marginTop: 12, fontWeight: 900 }}>
            CM %: <span style={{ color: cmPct >= 90 ? "#16a34a" : cmPct >= 70 ? "#f97316" : "#dc2626" }}>{cmPct}%</span>
          </div>
        </div>

        {/* Staff */}
        <div style={card}>
          <div style={{ fontWeight: 900, marginBottom: 8 }}>Staff</div>

          <div style={{ color: "#64748b", fontSize: 13, marginBottom: 10 }}>
            Employees count: <b>{staffCount}</b>
          </div>

          {staffNames.map((name, idx) => (
            <div key={idx} style={{ display: "flex", gap: 8, marginBottom: 8 }}>
              <input
                value={name}
                onChange={(e) => updateStaff(idx, e.target.value)}
                placeholder={`Employee #${idx + 1}`}
                style={inputStyle}
              />
              <button
                onClick={() => removeStaff(idx)}
                style={{
                  padding: "10px 12px",
                  borderRadius: 10,
                  border: "1px solid rgba(15,23,42,0.12)",
                  background: "#fff",
                  cursor: "pointer",
                  fontWeight: 900,
                }}
                title="Remove"
              >
                ✕
              </button>
            </div>
          ))}

          <button
            onClick={addStaff}
            style={{
              width: "100%",
              padding: 10,
              borderRadius: 12,
              border: "1px dashed rgba(15,23,42,0.25)",
              background: "#f8fafc",
              cursor: "pointer",
              fontWeight: 900,
            }}
          >
            + Add Employee
          </button>
        </div>
      </div>

      {/* Bottom Summary + Actions */}
      <div
        style={{
          marginTop: 14,
          ...card,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          flexWrap: "wrap",
        }}
      >
        <div>
          <div style={{ fontWeight: 900, fontSize: 16 }}>
            Overall:{" "}
            <span style={{ color: overall >= 90 ? "#16a34a" : overall >= 70 ? "#f97316" : "#dc2626" }}>
              {overall}%
            </span>
          </div>
          <div style={{ color: "#64748b", fontSize: 13 }}>Based on PM% & CM%</div>
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={clear}
            style={{
              padding: "10px 14px",
              borderRadius: 12,
              border: "1px solid rgba(15,23,42,0.12)",
              background: "#fff",
              cursor: "pointer",
              fontWeight: 900,
            }}
          >
            Clear Region
          </button>

          <button
            onClick={save}
            style={{
              padding: "10px 14px",
              borderRadius: 12,
              border: 0,
              background: "#2563eb",
              color: "#fff",
              cursor: "pointer",
              fontWeight: 900,
            }}
          >
            Save
          </button>
        </div>
      </div>
    </Layout>
  );
}
