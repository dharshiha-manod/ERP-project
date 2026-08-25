import { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
const BASE_URL = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api`
  : "http://localhost:5000/api";
const authHeaders = () => {
  const token = localStorage.getItem("manod_token");
  const industryId = localStorage.getItem("manod_active_industry_id");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(industryId ? { "X-Industry-Id": industryId } : {}),
  };
};

function exportCSV(groups) {
  if (!groups.length) { alert("No data to export"); return; }
  const headers = ["Name", "Description", "Percentage", "Type", "Default"];
  const rows = groups.map(g => [`"${g.name}"`, `"${g.description || ""}"`, `"${g.percentage}%"`, `"${g.type}"`, `"${g.is_default ? "Yes" : "No"}"`]);
  const csv = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a"); a.href = url; a.download = "selling_price_groups.csv"; a.click();
  URL.revokeObjectURL(url);
}

function exportExcel(groups) {
  if (!groups.length) { alert("No data to export"); return; }
  const data = groups.map(g => ({ Name: g.name, Description: g.description || "", "Percentage": `${g.percentage}%`, "Type": g.type, "Default": g.is_default ? "Yes" : "No" }));
  const ws = XLSX.utils.json_to_sheet(data);
  ws["!cols"] = [{ wch: 25 }, { wch: 50 }, { wch: 14 }, { wch: 12 }, { wch: 10 }];
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Selling Price Groups");
  XLSX.writeFile(wb, "selling_price_groups.xlsx");
}

function exportPDF(groups) {
  if (!groups.length) { alert("No data to export"); return; }
  const doc = new jsPDF();
  doc.setFontSize(16); doc.text("Selling Price Groups", 14, 15);
  doc.setFontSize(10); doc.text(`Exported: ${new Date().toLocaleDateString()}`, 14, 22);
  autoTable(doc, {
    head: [["Name", "Description", "%", "Type", "Default"]],
    body: groups.map(g => [g.name, g.description || "", `${g.percentage}%`, g.type, g.is_default ? "Yes" : "No"]),
    startY: 28, styles: { fontSize: 9 },
    headStyles: { fillColor: [46, 125, 50] },
    columnStyles: { 1: { cellWidth: 75 } }
  });
  doc.save("selling_price_groups.pdf");
}

function printGroups(groups) {
  const win = window.open("", "_blank");
  win.document.write(`<html><head><title>Selling Price Groups</title><style>
    body{font-family:sans-serif;font-size:12px;} table{width:100%;border-collapse:collapse;}
    th,td{border:1px solid #ccc;padding:6px 10px;text-align:left;}
    th{background:#2e7d32;color:#fff;}
  </style></head><body>
    <h2>Selling Price Groups</h2><p>${new Date().toLocaleDateString()}</p>
    <table><thead><tr><th>Name</th><th>Description</th><th>Percentage</th><th>Type</th><th>Default</th></tr></thead>
    <tbody>${groups.map(g => `<tr><td>${g.name}</td><td>${g.description || ""}</td><td>${g.percentage}%</td><td>${g.type}</td><td>${g.is_default ? "Yes" : "No"}</td></tr>`).join("")}</tbody>
    </table></body></html>`);
  win.document.close(); win.print();
}

export default function SellingPriceGroup() {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ name: "", description: "", percentage: "", type: "Discount", is_default: false });
  const [search, setSearch] = useState("");
  const [perPage, setPerPage] = useState(25);

  const loadGroups = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/selling-price-groups?limit=100`, { headers: authHeaders() });
      const data = await res.json();
      if (res.ok) setGroups(data.groups || []);
      else console.error("Failed to load selling price groups:", data.error);
    } catch (err) {
      console.error("Failed to load selling price groups:", err.message);
    }
    setLoading(false);
  };

  useEffect(() => { loadGroups(); }, []);

  const openAdd = () => { setForm({ name: "", description: "", percentage: "", type: "Discount", is_default: false }); setEditId(null); setShowModal(true); };
  const openEdit = (g) => { setForm({ name: g.name, description: g.description || "", percentage: g.percentage, type: g.type, is_default: g.is_default }); setEditId(g.id); setShowModal(true); };

  const handleSave = async () => {
    if (!form.name.trim()) { alert("Name is required."); return; }
    if (form.percentage === "") { alert("Percentage is required."); return; }

    try {
      const url    = editId ? `${BASE_URL}/selling-price-groups/${editId}` : `${BASE_URL}/selling-price-groups`;
      const method = editId ? "PUT" : "POST";
      const res    = await fetch(url, { method, headers: authHeaders(), body: JSON.stringify(form) });
      const data   = await res.json();
      if (!res.ok) { alert(data.error || "Failed to save price group"); return; }
      setShowModal(false);
      await loadGroups();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDelete = async (g) => {
    if (!window.confirm("Delete this price group?")) return;
    try {
      const res  = await fetch(`${BASE_URL}/selling-price-groups/${g.id}`, { method: "DELETE", headers: authHeaders() });
      const data = await res.json();
      if (!res.ok) { alert(data.error || "Failed to delete price group"); return; }
      await loadGroups();
    } catch (err) {
      alert(err.message);
    }
  };

  const filtered = groups.filter(g =>
    g.name.toLowerCase().includes(search.toLowerCase()) ||
    (g.description || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ fontFamily: "'Segoe UI', sans-serif", color: "#333" }}>
      <h2 style={{ fontWeight: 700, fontSize: 24, marginBottom: 16 }}>Selling Price Groups</h2>

      <div style={{ background: "#fff", borderRadius: 8, padding: 24, boxShadow: "0 1px 4px rgba(0,0,0,0.08)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h4 style={{ fontWeight: 700, margin: 0 }}>All Selling Price Groups</h4>
          <button onClick={openAdd} style={btn.green}>+ Add</button>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10, marginBottom: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 13 }}>Show</span>
            <select value={perPage} onChange={e => setPerPage(Number(e.target.value))} style={inputSm}>
              {[10, 25, 50, 100].map(n => <option key={n}>{n}</option>)}
            </select>
            <span style={{ fontSize: 13 }}>entries</span>
          </div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
            <button onClick={() => exportCSV(groups)} style={btn.csv}><span style={icon.csv}>CSV</span> Export CSV</button>
            <button onClick={() => exportExcel(groups)} style={btn.xls}><span style={icon.xls}>XLS</span> Export Excel</button>
            <button onClick={() => printGroups(groups)} style={btn.outline}>🖨 Print</button>
            <button style={btn.outline}>⊞ Column visibility</button>
            <button onClick={() => exportPDF(groups)} style={btn.pdf}><span style={icon.pdf}>PDF</span> Export PDF</button>
            <input placeholder="Search ..." value={search} onChange={e => setSearch(e.target.value)} style={inputSearch} />
          </div>
        </div>

        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
          <thead>
            <tr style={{ background: "#f9fafb" }}>
              <th style={th}>Name</th>
              <th style={th}>Description</th>
              <th style={th}>Percentage (%)</th>
              <th style={th}>Type</th>
              <th style={th}>Default</th>
          <th style={{ ...th, textAlign: "center" }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} style={{ textAlign: "center", padding: 28, color: "#888" }}>Loading...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={6} style={{ textAlign: "center", padding: 28, color: "#888" }}>No data available in table</td></tr>
            ) : (
              filtered.slice(0, perPage).map((g) => (
                <tr key={g.id} style={{ borderBottom: "1px solid #f0f0f0", background: "#fff" }}>
                  <td style={td}><strong>{g.name}</strong></td>
                  <td style={{ ...td, color: "#555", maxWidth: 260 }}>{g.description}</td>
                  <td style={td}>
                    <span style={{ background: "#dcfce7", color: "#15803d", borderRadius: 20, padding: "2px 12px", fontSize: 12, fontWeight: 600 }}>
                      {g.percentage}%
                    </span>
                  </td>
                  <td style={td}>
                    <span style={{ background: g.type === "Discount" ? "#fee2e2" : "#dbeafe", color: g.type === "Discount" ? "#dc2626" : "#1d4ed8", borderRadius: 20, padding: "2px 12px", fontSize: 12, fontWeight: 500 }}>
                      {g.type}
                    </span>
                  </td>
                  <td style={td}>
                    {g.is_default
                      ? <span style={{ background: "#dcfce7", color: "#15803d", borderRadius: 20, padding: "2px 10px", fontSize: 12, fontWeight: 600 }}>✓ Yes</span>
                      : <span style={{ color: "#9ca3af", fontSize: 13 }}>No</span>}
                  </td>
                <td style={{ ...td, textAlign: "center" }}>
                    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 16 }}>
                      <button onClick={() => openEdit(g)} title="View" style={btn.iconView}>
                        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8Z" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                      </button>
                      <button onClick={() => openEdit(g)} title="Edit" style={btn.iconEdit}>
                        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M12 20h9" />
                          <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
                        </svg>
                      </button>
                      <button onClick={() => handleDelete(g)} title="Delete" style={btn.iconDelete}>
                        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M3 6h18" />
                          <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                          <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                          <line x1="10" y1="11" x2="10" y2="17" />
                          <line x1="14" y1="11" x2="14" y2="17" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 12, fontSize: 13, color: "#555" }}>
          <span>Showing {filtered.length === 0 ? "0 to 0 of 0" : `1 to ${Math.min(perPage, filtered.length)} of ${filtered.length}`} entries</span>
          <div style={{ display: "flex", gap: 6 }}>
            <button style={btn.page}>Previous</button>
            <button style={btn.page}>Next</button>
          </div>
        </div>
      </div>

      <div style={{ textAlign: "center", color: "#9ca3af", fontSize: 12, marginTop: 32 }}>
        manod tecnologies - V7.0 | Copyright © 2026 All rights reserved.
      </div>

      {showModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div style={{ background: "#fff", borderRadius: 10, padding: 28, width: 520, maxWidth: "95vw", boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h5 style={{ fontWeight: 700, fontSize: 18, margin: 0 }}>{editId !== null ? "Edit" : "Add"} Selling Price Group</h5>
              <button onClick={() => setShowModal(false)} style={{ background: "none", border: "none", fontSize: 22, cursor: "pointer", color: "#888" }}>×</button>
            </div>

            <label style={modalLabel}>Name: *</label>
            <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. Wholesale Price" style={modalInput} />

            <label style={modalLabel}>Description:</label>
            <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Description" rows={3}
              style={{ ...modalInput, resize: "vertical" }} />

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginTop: 4 }}>
              <div>
                <label style={modalLabel}>Percentage (%) *</label>
                <input value={form.percentage} onChange={e => setForm({ ...form, percentage: e.target.value })} placeholder="0" type="number" min="0" max="100" style={modalInput} />
              </div>
              <div>
                <label style={modalLabel}>Type *</label>
                <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} style={modalInput}>
                  <option value="Discount">Discount</option>
                  <option value="Markup">Markup</option>
                </select>
              </div>
            </div>

            <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, cursor: "pointer", marginTop: 16 }}>
              <input type="checkbox" checked={form.is_default} onChange={e => setForm({ ...form, is_default: e.target.checked })} style={{ accentColor: "#2e7d32" }} />
              Set as default price group
            </label>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 24 }}>
              <button onClick={handleSave} style={btn.green}>🖫 Save</button>
              <button onClick={() => setShowModal(false)} style={{ background: "#343a40", color: "#fff", border: "none", borderRadius: 6, padding: "9px 24px", fontSize: 14, cursor: "pointer" }}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const btn = {
  green: { background: "linear-gradient(135deg,#2e7d32,#43a047)", color: "#fff", border: "none", borderRadius: 6, padding: "10px 22px", fontSize: 14, cursor: "pointer", fontWeight: 600 },
  csv: { background: "#fff", border: "1px solid #d1d5db", borderRadius: 4, padding: "5px 10px", fontSize: 12, cursor: "pointer", display: "flex", alignItems: "center", gap: 4 },
  xls: { background: "#fff", border: "1px solid #d1d5db", borderRadius: 4, padding: "5px 10px", fontSize: 12, cursor: "pointer", display: "flex", alignItems: "center", gap: 4 },
  pdf: { background: "#fff", border: "1px solid #d1d5db", borderRadius: 4, padding: "5px 10px", fontSize: 12, cursor: "pointer", display: "flex", alignItems: "center", gap: 4 },
  outline: { background: "#fff", border: "1px solid #d1d5db", borderRadius: 4, padding: "5px 10px", fontSize: 12, cursor: "pointer" },
iconView: { background: "transparent", border: "none", color: "#0ea5e9", cursor: "pointer", padding: 0, display: "flex", alignItems: "center" },
  iconEdit: { background: "transparent", border: "none", color: "#d97706", cursor: "pointer", padding: 0, display: "flex", alignItems: "center" },
  iconDelete: { background: "transparent", border: "none", color: "#dc2626", cursor: "pointer", padding: 0, display: "flex", alignItems: "center" },
  page: { padding: "4px 14px", borderRadius: 4, border: "1px solid #ccc", background: "#fff", cursor: "pointer" },
};
const icon = {
  csv: { background: "#16a34a", color: "#fff", borderRadius: 3, padding: "1px 5px", fontSize: 10, fontWeight: 700 },
  xls: { background: "#2e7d32", color: "#fff", borderRadius: 3, padding: "1px 5px", fontSize: 10, fontWeight: 700 },
  pdf: { background: "#dc2626", color: "#fff", borderRadius: 3, padding: "1px 5px", fontSize: 10, fontWeight: 700 },
};
const th = { textAlign: "left", padding: "10px 12px", fontWeight: 600, borderBottom: "2px solid #e5e7eb", color: "#374151" };
const td = { padding: "10px 12px", verticalAlign: "middle" };
const inputSm = { padding: "4px 8px", borderRadius: 4, border: "1px solid #ccc", fontSize: 13 };
const inputSearch = { padding: "5px 10px", border: "1px solid #ccc", borderRadius: 4, fontSize: 13, width: 160 };
const modalLabel = { display: "block", fontWeight: 600, fontSize: 13, color: "#374151", marginBottom: 6, marginTop: 4 };
const modalInput = { width: "100%", padding: "9px 12px", border: "1px solid #d1d5db", borderRadius: 6, marginTop: 6, fontSize: 14, boxSizing: "border-box", outline: "none", fontFamily: "'Segoe UI', sans-serif" };