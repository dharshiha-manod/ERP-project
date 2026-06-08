import { useState } from "react";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const SAMPLE_UNITS = [
  { name: "Pieces", shortName: "Pc(s)", allowDecimal: "No" },
  { name: "Kilogram", shortName: "Kg", allowDecimal: "Yes" },
  { name: "Gram", shortName: "g", allowDecimal: "Yes" },
  { name: "Litre", shortName: "L", allowDecimal: "Yes" },
  { name: "Millilitre", shortName: "mL", allowDecimal: "Yes" },
  { name: "Box", shortName: "Box", allowDecimal: "No" },
  { name: "Pack", shortName: "Pk", allowDecimal: "No" },
  { name: "Dozen", shortName: "Doz", allowDecimal: "No" },
  { name: "Meter", shortName: "m", allowDecimal: "Yes" },
  { name: "Centimeter", shortName: "cm", allowDecimal: "Yes" },
  { name: "Pair", shortName: "Pr", allowDecimal: "No" },
  { name: "Set", shortName: "Set", allowDecimal: "No" },
  { name: "Ton", shortName: "Tn", allowDecimal: "Yes" },
  { name: "Bundle", shortName: "Bndl", allowDecimal: "No" },
];

function exportCSV(units) {
  if (!units.length) { alert("No data to export"); return; }
  const headers = ["Name", "Short Name", "Allow Decimal"];
  const rows = units.map(u => [`"${u.name}"`, `"${u.shortName}"`, `"${u.allowDecimal}"`]);
  const csv = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a"); a.href = url; a.download = "units.csv"; a.click();
  URL.revokeObjectURL(url);
}

function exportExcel(units) {
  if (!units.length) { alert("No data to export"); return; }
  const data = units.map(u => ({ Name: u.name, "Short Name": u.shortName, "Allow Decimal": u.allowDecimal }));
  const ws = XLSX.utils.json_to_sheet(data);
  ws["!cols"] = [{ wch: 25 }, { wch: 15 }, { wch: 15 }];
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Units");
  XLSX.writeFile(wb, "units.xlsx");
}

function exportPDF(units) {
  if (!units.length) { alert("No data to export"); return; }
  const doc = new jsPDF();
  doc.setFontSize(16); doc.text("Units List", 14, 15);
  doc.setFontSize(10); doc.text(`Exported: ${new Date().toLocaleDateString()}`, 14, 22);
  autoTable(doc, {
    head: [["Name", "Short Name", "Allow Decimal"]],
    body: units.map(u => [u.name, u.shortName, u.allowDecimal]),
    startY: 28, styles: { fontSize: 10 },
    headStyles: { fillColor: [46, 125, 50] },
  });
  doc.save("units.pdf");
}

function printUnits(units) {
  const win = window.open("", "_blank");
  win.document.write(`<html><head><title>Units</title><style>
    body{font-family:sans-serif;font-size:12px;} table{width:100%;border-collapse:collapse;}
    th,td{border:1px solid #ccc;padding:6px 10px;text-align:left;}
    th{background:#2e7d32;color:#fff;}
  </style></head><body>
    <h2>Units List</h2><p>${new Date().toLocaleDateString()}</p>
    <table><thead><tr><th>Name</th><th>Short Name</th><th>Allow Decimal</th></tr></thead>
    <tbody>${units.map(u => `<tr><td>${u.name}</td><td>${u.shortName}</td><td>${u.allowDecimal}</td></tr>`).join("")}</tbody>
    </table></body></html>`);
  win.document.close(); win.print();
}

export default function Units() {
  const [units, setUnits] = useState(SAMPLE_UNITS);
  const [showModal, setShowModal] = useState(false);
  const [editIndex, setEditIndex] = useState(null);
  const [form, setForm] = useState({ name: "", shortName: "", allowDecimal: "", isMultiple: false });
  const [search, setSearch] = useState("");
  const [perPage, setPerPage] = useState(25);

  const openAdd = () => { setForm({ name: "", shortName: "", allowDecimal: "", isMultiple: false }); setEditIndex(null); setShowModal(true); };
  const openEdit = (i) => { setForm({ ...units[i], isMultiple: false }); setEditIndex(i); setShowModal(true); };

  const handleSave = () => {
    if (!form.name.trim() || !form.shortName.trim() || !form.allowDecimal) { alert("Please fill all required fields."); return; }
    if (editIndex !== null) {
      const updated = [...units]; updated[editIndex] = { name: form.name, shortName: form.shortName, allowDecimal: form.allowDecimal };
      setUnits(updated);
    } else {
      setUnits([...units, { name: form.name, shortName: form.shortName, allowDecimal: form.allowDecimal }]);
    }
    setShowModal(false);
  };

  const handleDelete = (i) => { if (window.confirm("Delete this unit?")) setUnits(units.filter((_, idx) => idx !== i)); };

  const filtered = units.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.shortName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ fontFamily: "'Segoe UI', sans-serif", color: "#333" }}>
      <h2 style={{ fontWeight: 700, fontSize: 24, marginBottom: 4 }}>
        Units <span style={{ fontWeight: 400, fontSize: 16, color: "#666" }}>Manage your units</span>
      </h2>

      <div style={{ background: "#fff", borderRadius: 8, padding: "24px", marginTop: 16, boxShadow: "0 1px 4px rgba(0,0,0,0.08)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h4 style={{ fontWeight: 700, margin: 0 }}>All your units</h4>
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
            <button onClick={() => exportCSV(units)} style={btn.csv}><span style={icon.csv}>CSV</span> Export CSV</button>
            <button onClick={() => exportExcel(units)} style={btn.xls}><span style={icon.xls}>XLS</span> Export Excel</button>
            <button onClick={() => printUnits(units)} style={btn.outline}>🖨 Print</button>
            <button style={btn.outline}>⊞ Column visibility</button>
            <button onClick={() => exportPDF(units)} style={btn.pdf}><span style={icon.pdf}>PDF</span> Export PDF</button>
            <input placeholder="Search ..." value={search} onChange={e => setSearch(e.target.value)} style={inputSearch} />
          </div>
        </div>

        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
          <thead>
            <tr style={{ background: "#f9fafb" }}>
              <th style={th}>Name</th>
              <th style={th}>Short name</th>
              <th style={th}>
                Allow decimal{" "}
                <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 16, height: 16, borderRadius: "50%", background: "#17a2b8", color: "#fff", fontSize: 10, cursor: "pointer" }} title="Whether this unit allows decimal values">i</span>
              </th>
              <th style={th}>Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={4} style={{ textAlign: "center", padding: 28, color: "#888" }}>No data available in table</td></tr>
            ) : (
              filtered.slice(0, perPage).map((u, i) => (
                <tr key={i} style={{ borderBottom: "1px solid #f0f0f0", background: i % 2 === 0 ? "#fff" : "#fafafa" }}>
                  <td style={td}><strong>{u.name}</strong></td>
                  <td style={td}><code style={{ background: "#f3f4f6", padding: "2px 8px", borderRadius: 4, fontSize: 13 }}>{u.shortName}</code></td>
                  <td style={td}>
                    <span style={{ background: u.allowDecimal === "Yes" ? "#dcfce7" : "#fee2e2", color: u.allowDecimal === "Yes" ? "#15803d" : "#dc2626", borderRadius: 20, padding: "2px 10px", fontSize: 12, fontWeight: 500 }}>
                      {u.allowDecimal}
                    </span>
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
            <button style={{ ...btn.page, background: "#2e7d32", color: "#fff", border: "none" }}>1</button>
            <button style={btn.page}>Next</button>
          </div>
        </div>
      </div>

      {showModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div style={{ background: "#fff", borderRadius: 10, padding: 28, width: 500, maxWidth: "95vw", boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h5 style={{ fontWeight: 700, fontSize: 18, margin: 0 }}>{editIndex !== null ? "Edit" : "Add"} Unit</h5>
              <button onClick={() => setShowModal(false)} style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", color: "#888" }}>×</button>
            </div>

            <label style={modalLabel}>Name: *</label>
            <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Name" style={modalInput} />

            <label style={modalLabel}>Short name: *</label>
            <input value={form.shortName} onChange={e => setForm({ ...form, shortName: e.target.value })} placeholder="Short name" style={modalInput} />

            <label style={modalLabel}>Allow decimal: *</label>
            <select value={form.allowDecimal} onChange={e => setForm({ ...form, allowDecimal: e.target.value })} style={modalInput}>
              <option value="">Please Select</option>
              <option value="Yes">Yes</option>
              <option value="No">No</option>
            </select>

            <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, cursor: "pointer", marginTop: 12 }}>
              <input type="checkbox" checked={form.isMultiple} onChange={e => setForm({ ...form, isMultiple: e.target.checked })} style={{ accentColor: "#2e7d32" }} />
              Add as multiple of other unit{" "}
              <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 16, height: 16, borderRadius: "50%", background: "#17a2b8", color: "#fff", fontSize: 10 }}>i</span>
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
const modalLabel = { display: "block", fontWeight: 600, fontSize: 13, color: "#374151", marginBottom: 6, marginTop: 16 };
const modalInput = { width: "100%", padding: "9px 12px", border: "1px solid #d1d5db", borderRadius: 6, marginTop: 6, fontSize: 14, boxSizing: "border-box", outline: "none", fontFamily: "'Segoe UI', sans-serif" };