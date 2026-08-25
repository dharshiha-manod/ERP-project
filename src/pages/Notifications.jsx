import { useState, useEffect } from "react";

const BASES_LOCAL = [
  import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : null,
  "http://localhost:5000/api",
  "http://localhost:3000/api",
  "http://127.0.0.1:5000/api",
].filter(Boolean);
const READ_KEY = "manod_read_notifs";
const getReadIds = () => {
  try { return JSON.parse(localStorage.getItem(READ_KEY) || "[]"); } catch { return []; }
};
const saveReadIds = (ids) => localStorage.setItem(READ_KEY, JSON.stringify(ids));

async function apiFetchLocal(path) {
  const token = localStorage.getItem("manod_token");
  for (const base of BASES_LOCAL) {
    try {
      const r = await fetch(`${base}${path}`, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
      if (r.ok) return await r.json();
    } catch (e) { /* try next base */ }
  }
  return null;
}

export default function Notifications() {
  const [notifs, setNotifs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetchLocal(`/reports/stock?limit=1000`).then((res) => {
      const rows = res?.data || [];
      const lowStock = rows.filter(r => r.status === "Low Stock" || r.status === "Out of Stock");
      const readIds = getReadIds();
      const built = lowStock.map((r) => {
        const stableId = `${r.product}-${r.status}`;
        return {
          id: stableId,
          icon: r.status === "Out of Stock" ? "🔴" : "⚠️",
          title: r.status === "Out of Stock" ? "Out of Stock" : "Low Stock Alert",
          sub: `${r.product} — Qty: ${r.qty} left`,
          unread: !readIds.includes(stableId),
        };
      });
      setNotifs(built);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const markOne = (id) => {
    setNotifs((p) => p.map((n) => n.id === id ? { ...n, unread: false } : n));
    const ids = getReadIds();
    if (!ids.includes(id)) saveReadIds([...ids, id]);
  };

  const markAll = () => {
    setNotifs((p) => p.map((n) => ({ ...n, unread: false })));
    saveReadIds(notifs.map((n) => n.id));
  };

  const unread = notifs.filter((n) => n.unread).length;

  return (
    <div style={{ padding: "24px", maxWidth: "800px", margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <h1 style={{ fontSize: "20px", fontWeight: 700, color: "#111827" }}>
          Notifications {unread > 0 && <span style={{ background: "#dc2626", color: "#fff", fontSize: "12px", fontWeight: 700, padding: "2px 8px", borderRadius: "10px", marginLeft: "8px" }}>{unread}</span>}
        </h1>
        {unread > 0 && (
          <button onClick={markAll} style={{ fontSize: "13px", color: "#15803d", background: "none", border: "none", cursor: "pointer", fontWeight: 600 }}>
            Mark all read
          </button>
        )}
      </div>

      {loading && <div style={{ textAlign: "center", color: "#9ca3af", padding: "40px" }}>Loading…</div>}
      {!loading && notifs.length === 0 && <div style={{ textAlign: "center", color: "#9ca3af", padding: "40px" }}>No alerts right now</div>}

      {notifs.map((n) => (
        <div key={n.id} onClick={() => markOne(n.id)}
          style={{ display: "flex", gap: "12px", padding: "14px 16px", background: n.unread ? "#f0fdf4" : "#fff", border: "1px solid #f0f0f0", borderRadius: "10px", marginBottom: "8px", cursor: "pointer" }}>
          <span style={{ fontSize: "22px" }}>{n.icon}</span>
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ fontSize: "14px", fontWeight: n.unread ? 700 : 500, color: "#111827" }}>{n.title}</span>
              {n.unread && <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#16a34a" }} />}
            </div>
            <div style={{ fontSize: "13px", color: "#6b7280", marginTop: "2px" }}>{n.sub}</div>
          </div>
        </div>
      ))}
    </div>
  );
}