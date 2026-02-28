const KEY = "kpiData";

export function loadData() {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    console.error("loadData error:", e);
    return null;
  }
}

export function saveData(data) {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(KEY, JSON.stringify(data));
  } catch (e) {
    console.error("saveData error:", e);
  }
}

export function clearData() {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.removeItem(KEY);
  } catch (e) {
    console.error("clearData error:", e);
  }
}
