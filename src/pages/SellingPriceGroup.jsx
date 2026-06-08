import { useState } from "react";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const SAMPLE_GROUPS = [
  { name: "Retail Price", description: "Standard retail price for walk-in customers", percentage: "0", type: "Markup", isDefault: true },
  { name: "Wholesale Price", description: "Discounted price for bulk/wholesale buyers", percentage: "15", type: "Discount", isDefault: false },
  { name: "VIP Customer", description: "Exclusive pricing for VIP and loyalty members", percentage: "20", type: "Discount", isDefault: false },
  { name: "Dealer Price", description: "Special dealer/distributor pricing", percentage: "25", type: "Discount", isDefault: false },
  { name: "Online Price", description: "E-commerce platform specific pricing", percentage: "5", type: "Discount", isDefault: false },
  { name: "Staff Price", description: "Employee purchase price", percentage: "30", type: "Discount", isDefault: false },
  { name: "Festival Offer", description: "Special seasonal/festival discount pricing", percentage: "18", type: "Discount", isDefault: false },
  { name: "Clearance Price", description: "Clearance sale pricing for old/overstock items", percentage: "40", type: "Discount", isDefault: false },
];

function exportCSV(groups) {
  if (!groups.length) { alert("No data to export"); return; }
  const headers = ["Name", "Description", "Percentage", "Type", "Default"];
  const rows = groups.map(g => [`"${g.name}"`, `"${g.description}"`, `"${g.percentage}%"`, `"${g.type}"`, `"${g.isDefault ? "Yes" : "No"}"`]);
  const csv = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a"); a.href = url; a.download = "selling_price_groups.csv"; a.click();
  URL.revokeObjectURL(url);
}

function exportExcel(groups) {
  if (!groups.length) { alert("No data to export"); return; }
  const data = groups.map(g => ({ Name: g.name, Description: g.description, "Percentage": `${g.percentage}%`, "Type": g.type, "Default": g.isDefault ? "Yes" : "No" }));
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
    body: groups.map(g => [g.name, g.description, `${g.percentage}%`, g.type, g.isDefault ? "Yes" : "No"]),
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
    <tbody>${groups.map(g => `<tr><td>${g.name}</td><td>${g.description}</td><td>${g.percentage}%</td><td>${g.type}</td><td>${g.isDefault ? "Yes" : "No"}</td></tr>`).join("")}</tbody>
    </table></body></html>`);
  win.document.close(); win.print();
}

export default function SellingPriceGroup() {
  const [groups, setGroups] = useState(SAMPLE_GROUPS);
  const [showModal, setShowModal] = useState(false);
  const [editIndex, setEditIndex] = useState(null);
  const [form, setForm] = useState({ name: "", description: "", percentage: "", type: "Discount", isDefault: false });
  const [search, setSearch] = useState("");
  const [perPage, setPerPage] = useState(25);

  const openAdd = () => { setForm({ name: "", description: "", percentage: "", type: "Discount", isDefault: false }); setEditIndex(null); setShowModal(true); };
  const openEdit = (i) => { setForm({ ...groups[i] }); setEditIndex(i); setShowModal(true); };

  const handleSave = () => {
    if (!form.name.trim()) { alert("Name is required."); return; }
    if (form.percentage === "") { alert("Percentage is required."); return; }
    if (editIndex !== null) {
      const updated = [...groups]; updated[editIndex] = form; setGroups(updated);
    } else { setGroups([...groups, form]); }
    setShowModal(false);
  };

  const handleDelete = (i) => { if (window.confirm("Delete this price group?")) setGroups(groups.filter((_, idx) => idx !== i)); };

  const filtered = groups.filter(g =>
    g.name.toLowerCase().includes(search.toLowerCase()) ||
    g.description.toLowerCase().includes(search.toLowerCase())
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
              <th style={th}>Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={6} style={{ textAlign: "center", padding: 28, color: "#888" }}>No data available in table</td></tr>
            ) : (
              filtered.slice(0, perPage).map((g, i) => (
                <tr key={i} style={{ borderBottom: "1px solid #f0f0f0", background: i % 2 === 0 ? "#fff" : "#fafafa" }}>
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
                    {g.isDefault
                      ? <span style={{ background: "#dcfce7", color: "#15803d", borderRadius: 20, padding: "2px 10px", fontSize: 12, fontWeight: 600 }}>✓ Yes</span>
                      : <span style={{ color: "#9ca3af", fontSize: 13 }}>No</span>}
                  </td>
                  <td style={td}>
                    <button onClick={() => openEdit(i)} style={btn.editSm}>✏ Edit</button>
                    <button onClick={() => handleDelete(i)} style={btn.delSm}>🗑 Delete</button>
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
              <h5 style={{ fontWeight: 700, fontSize: 18, margin: 0 }}>{editIndex !== null ? "Edit" : "Add"} Selling Price Group</h5>
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
              <input type="checkbox" checked={form.isDefault} onChange={e => setForm({ ...form, isDefault: e.target.checked })} style={{ accentColor: "#2e7d32" }} />
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
  editSm: { marginRight: 6, padding: "4px 12px", borderRadius: 4, border: "1px solid #2e7d32", background: "#f0fdf4", color: "#2e7d32", cursor: "pointer", fontSize: 12, fontWeight: 500 },
  delSm: { padding: "4px 12px", borderRadius: 4, border: "1px solid #dc3545", background: "#fff", color: "#dc3545", cursor: "pointer", fontSize: 12 },
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