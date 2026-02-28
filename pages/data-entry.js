import { useMemo, useState } from "react";
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

  const pct = (planned, completed) => (planned > 0 ? Math.round((completed / planned) * 100) : 0);
  const pmPct = pct(Number(pmPlanned), Number(pmCompleted));
  const cmPct = pct(Number(cmPlanned), Number(cmCompleted));
  const overall = Math.round((pmPct + cmPct) / 2);

  const addStaff = () => setStaffNames((s) => [...s, ""]);
  const removeStaff = (idx) => setStaffNames((s) => s.filter((_, i) => i !== idx));
  const updateStaff = (idx, val) => setStaffNames((s) => s.map((x, i) => (i === idx ? val : x)));

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

    // ✅ مؤقت: حفظ في LocalStorage
    localStorage.setItem(`kpi:${region}`, JSON.stringify(payload));
    alert(`Saved ✅ (${region})`);
  };

  const load = () => {
    const raw = localStorage.getItem(`kpi:${region}`);
    if (!raw) return alert("No saved data for this region");
    const d = JSON.parse(raw);

    setPmPlanned(d.pmPlanned ?? 0);
    setPmCompleted(d.pmCompleted ?? 0);
    setCmPlanned(d.cmPlanned ?? 0);
    setCmCompleted(d.cmCompleted ?? 0);
    setStaffNames(d.staff?.length ? d.staff : [""]);
    alert(`Loaded ✅ (${region})`);
  };

  const inputStyle = {
    width: "100%",
    padding: 10,
    borderRadius: 10,
    border: "1px solid #e2e8f0",
    outline: "none",
    fontSize: 14,
  };

  const card = {
    background: "#fff",
    borderRadius: 14,
    padding: 14,
    boxShadow: "0 8px 24px rgba(15,23,42,0.08)",
  };

  return (
    <Layout>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
        <div>
          <div style={{ fontSize: 20, fontWeight: 900 }}>Data Entry</div>
          <div style={{ color: "#64748b", marginTop: 6 }}>
            Plan / Complete لكل منطقة + أسماء الموظفين
          </div>
        </div>

        <div style={{ minWidth: 220 }}>
          <select value={region} onChange={(e) => setRegion(e.target.value)} style={inputStyle}>
            {regionsList.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 12, marginTop: 14 }}>
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

          <div style={{ marginTop: 12, fontWeight: 800 }}>PM %: {pmPct}%</div>
        </div>

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

          <div style={{ marginTop: 12, fontWeight: 800 }}>CM %: {cmPct}%</div>
        </div>

        <div style={card}>
          <div style={{ fontWeight: 900, marginBottom: 10 }}>Staff</div>

          <div style={{ color: "#64748b", fontSize: 13, marginBottom: 8 }}>
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
                  border: "1px solid #e2e8f0",
                  background: "#fff",
                  cursor: "pointer",
                  fontWeight: 800,
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
              border: "1px dashed #cbd5e1",
              background: "#f8fafc",
              cursor: "pointer",
              fontWeight: 900,
            }}
          >
            + Add Employee
          </button>
        </div>
      </div>

      <div style={{ marginTop: 14, ...card, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
        <div>
          <div style={{ fontWeight: 900 }}>Overall: {overall}%</div>
          <div style={{ color: "#64748b", fontSize: 13 }}>Based on PM% & CM%</div>
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={load} style={{ padding: "10px 14px", borderRadius: 12, border: "1px solid #e2e8f0", background: "#fff", cursor: "pointer", fontWeight: 900 }}>
            Load
          </button>
          <button onClick={save} style={{ padding: "10px 14px", borderRadius: 12, border: "0", background: "#2563eb", color: "#fff", cursor: "pointer", fontWeight: 900 }}>
            Save
          </button>
        </div>
      </div>
    </Layout>
  );
}
