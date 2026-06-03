import { useState } from "react";
import * as XLSX from "xlsx";

export default function Variations() {
  const [variations, setVariations] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [search, setSearch] = useState("");
  const [showEntries, setShowEntries] = useState(25);

  const filtered = variations.filter(v =>
    v.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleSave = (variation) => {
    if (editItem) {
      setVariations(prev => prev.map(v => v.id === editItem.id ? { ...variation, id: editItem.id } : v));
    } else {
      setVariations(prev => [...prev, { ...variation, id: Date.now() }]);
    }
    setShowModal(false);
    setEditItem(null);
  };

  const handleEdit = (v) => { setEditItem(v); setShowModal(true); };
  const handleDelete = (id) => setVariations(prev => prev.filter(v => v.id !== id));

  const handleExportCSV = () => {
    if (variations.length === 0) { alert("No data"); return; }
    const rows = variations.map(v => [`"${v.name}"`, `"${v.values.join("|")}"`]);
    const csv = ['"Variations","Values"', ...rows.map(r => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "variations.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportExcel = () => {
    if (variations.length === 0) { alert("No data"); return; }
    const data = variations.map(v => ({ Variations: v.name, Values: v.values.join(" | ") }));
    const ws = XLSX.utils.json_to_sheet(data);
    ws["!cols"] = [{ wch: 30 }, { wch: 50 }];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Variations");
    XLSX.writeFile(wb, "variations.xlsx");
  };

  return (
    <div style={s.page}>
      {/* Header */}
      <div style={s.titleRow}>
        <div>
          <h1 style={s.pageTitle}>Variations</h1>
          <span style={s.pageSubtitle}>Manage product variations</span>
        </div>
        <button style={s.btnAdd} onClick={() => { setEditItem(null); setShowModal(true); }}>
          ＋ Add
        </button>
      </div>

      <div style={s.card}>
        <h2 style={s.cardTitle}>All variations</h2>

        {/* Toolbar */}
        <div style={s.toolbar}>
          <div style={s.toolLeft}>
            <span style={s.toolText}>Show</span>
            <select style={s.entriesSelect} value={showEntries}
              onChange={e => setShowEntries(+e.target.value)}>
              {[10, 25, 50, 100].map(n => <option key={n}>{n}</option>)}
            </select>
            <span style={s.toolText}>entries</span>
          </div>
          <div style={s.toolRight}>
            <button style={s.toolBtn} onClick={handleExportCSV}>📄 Export CSV</button>
            <button style={s.toolBtn} onClick={handleExportExcel}>📊 Export Excel</button>
            <button style={s.toolBtn} onClick={() => window.print()}>🖨 Print</button>
            <button style={s.toolBtn}>👁 Column visibility</button>
            <button style={s.toolBtn}>📑 Export PDF ▾</button>
            <input style={s.searchBox} placeholder="Search …"
              value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>

        {/* Table */}
        <div style={s.tableWrap}>
          <table style={s.table}>
            <thead>
              <tr style={s.theadRow}>
                <th style={s.th}>Variations ↕</th>
                <th style={s.th}>Values ↕</th>
                <th style={s.th}>Action ↕</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={3} style={s.noData}>No data available in table</td>
                </tr>
              ) : (
                filtered.slice(0, showEntries).map((v, i) => (
                  <tr key={v.id} style={i % 2 === 0 ? s.rowEven : s.rowOdd}>
                    <td style={{ ...s.td, fontWeight: 500 }}>{v.name}</td>
                    <td style={s.td}>
                      <div style={s.valuesWrap}>
                        {v.values.map(val => (
                          <span key={val} style={s.valueBadge}>{val}</span>
                        ))}
                      </div>
                    </td>
                    <td style={s.td}>
                      <button style={s.actionEdit} onClick={() => handleEdit(v)}>✏ Edit</button>
                      <button style={s.actionDel} onClick={() => handleDelete(v.id)}>🗑 Delete</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer count */}
        <div style={s.footerRow}>
          <span>Showing {filtered.length === 0 ? "0" : "1"} to {Math.min(filtered.length, showEntries)} of {filtered.length} entries</span>
          <div style={s.pagination}>
            <button style={s.pageBtn}>Previous</button>
            <button style={s.pageBtn}>Next</button>
          </div>
        </div>
      </div>

      <div style={s.footer}>manod tecnologies - V7.0 | Copyright © 2026 All rights reserved.</div>

      {/* Add/Edit Modal */}
      {showModal && (
        <AddVariationModal
          initial={editItem}
          onSave={handleSave}
          onClose={() => { setShowModal(false); setEditItem(null); }} />
      )}
    </div>
  );
}

// ── Add/Edit Variation Modal ──────────────────────────────────────────────────
function AddVariationModal({ initial, onSave, onClose }) {
  const [name, setName] = useState(initial?.name || "");
  const [values, setValues] = useState(initial?.values || [""]);

  const addValue = () => setValues(v => [...v, ""]);
  const updateValue = (i, val) => setValues(v => v.map((x, idx) => idx === i ? val : x));
  const removeValue = (i) => setValues(v => v.filter((_, idx) => idx !== i));

  const handleSave = () => {
    if (!name.trim()) { alert("Variation Name is required"); return; }
    const cleaned = values.map(v => v.trim()).filter(Boolean);
    if (cleaned.length === 0) { alert("At least one value is required"); return; }
    onSave({ name: name.trim(), values: cleaned });
  };

  return (
    <div style={m.overlay}>
      <div style={m.modal}>
        <div style={m.header}>
          <span style={m.title}>{initial ? "Edit Variation" : "Add Variation"}</span>
          <button style={m.closeBtn} onClick={onClose}>✕</button>
        </div>
        <div style={m.body}>
          <div style={m.field}>
            <label style={m.label}>Variation Name: *</label>
            <input style={m.input} placeholder="Variation Name"
              value={name} onChange={e => setName(e.target.value)} />
          </div>
          <div style={m.field}>
            <label style={m.label}>Add variation values: *</label>
            {values.map((val, i) => (
              <div key={i} style={m.valueRow}>
                <input style={{ ...m.input, flex: 1 }} placeholder="e.g. Red, Large, XL..."
                  value={val} onChange={e => updateValue(i, e.target.value)} />
                {values.length > 1 && (
                  <button style={m.removeValBtn} onClick={() => removeValue(i)}>✕</button>
                )}
                {i === values.length - 1 && (
                  <button style={m.addValBtn} onClick={addValue}>＋</button>
                )}
              </div>
            ))}
            {values.length === 1 && (
              <div style={{ marginTop: 8 }}>
                <button style={m.addValBtn} onClick={addValue}>＋</button>
              </div>
            )}
          </div>
        </div>
        <div style={m.footer}>
          <button style={m.btnSave} onClick={handleSave}>Save</button>
          <button style={m.btnClose} onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}

const s = {
  page: { fontFamily: "'Segoe UI', sans-serif", color: "#222" },
  titleRow: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 },
  pageTitle: { margin: 0, fontSize: 26, fontWeight: 700, color: "#1a1a2e" },
  pageSubtitle: { fontSize: 13, color: "#888" },
  btnAdd: { background: "#6c63ff", color: "#fff", border: "none", borderRadius: 6, padding: "10px 22px", fontWeight: 600, cursor: "pointer", fontSize: 14 },
  card: { background: "#fff", borderRadius: 10, padding: "24px 28px", border: "1px solid #e5e7eb", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" },
  cardTitle: { fontSize: 16, fontWeight: 600, color: "#1a1a2e", marginBottom: 16 },
  toolbar: { display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10, marginBottom: 14 },
  toolLeft: { display: "flex", alignItems: "center", gap: 8 },
  toolRight: { display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" },
  toolText: { fontSize: 13, color: "#555" },
  entriesSelect: { border: "1px solid #d1d5db", borderRadius: 4, padding: "5px 8px", fontSize: 13 },
  toolBtn: { background: "#fff", border: "1px solid #d1d5db", borderRadius: 4, padding: "6px 12px", fontSize: 12, cursor: "pointer", color: "#444" },
  searchBox: { border: "1px solid #d1d5db", borderRadius: 4, padding: "6px 10px", fontSize: 13, width: 170, outline: "none" },
  tableWrap: { overflowX: "auto", border: "1px solid #e5e7eb", borderRadius: 8 },
  table: { width: "100%", borderCollapse: "collapse", fontSize: 14 },
  theadRow: { background: "#f9fafb" },
  th: { padding: "12px 14px", textAlign: "left", fontWeight: 600, color: "#374151", borderBottom: "2px solid #e5e7eb" },
  td: { padding: "12px 14px", borderBottom: "1px solid #f0f0f0", verticalAlign: "middle" },
  rowEven: { background: "#fff" },
  rowOdd: { background: "#fafafa" },
  noData: { textAlign: "center", padding: 48, color: "#9ca3af", fontSize: 14 },
  valuesWrap: { display: "flex", flexWrap: "wrap", gap: 6 },
  valueBadge: { background: "#f0eeff", color: "#6c63ff", borderRadius: 20, padding: "3px 12px", fontSize: 12, fontWeight: 500 },
  actionEdit: { background: "#f0eeff", color: "#6c63ff", border: "none", borderRadius: 4, cursor: "pointer", padding: "5px 12px", marginRight: 6, fontSize: 13, fontWeight: 500 },
  actionDel: { background: "#fee2e2", color: "#ef4444", border: "none", borderRadius: 4, cursor: "pointer", padding: "5px 12px", fontSize: 13, fontWeight: 500 },
  footerRow: { display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 14, fontSize: 13, color: "#6b7280" },
  pagination: { display: "flex", gap: 6 },
  pageBtn: { background: "#fff", border: "1px solid #d1d5db", borderRadius: 4, padding: "5px 14px", cursor: "pointer", fontSize: 13 },
  footer: { textAlign: "center", color: "#9ca3af", fontSize: 12, marginTop: 32 },
};

const m = {
  overlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" },
  modal: { background: "#fff", borderRadius: 10, width: 520, boxShadow: "0 20px 60px rgba(0,0,0,0.2)", fontFamily: "'Segoe UI', sans-serif" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "18px 24px", borderBottom: "1px solid #e5e7eb" },
  title: { fontSize: 17, fontWeight: 700, color: "#1a1a2e" },
  closeBtn: { background: "none", border: "none", fontSize: 18, cursor: "pointer", color: "#555" },
  body: { padding: "24px 24px 16px" },
  field: { marginBottom: 20 },
  label: { display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 8 },
  input: { border: "1px solid #d1d5db", borderRadius: 6, padding: "9px 12px", fontSize: 14, outline: "none", width: "100%", boxSizing: "border-box" },
  valueRow: { display: "flex", alignItems: "center", gap: 8, marginBottom: 8 },
  addValBtn: { background: "#6c63ff", color: "#fff", border: "none", borderRadius: 6, padding: "8px 14px", cursor: "pointer", fontSize: 16, fontWeight: 700 },
  removeValBtn: { background: "#fee2e2", color: "#ef4444", border: "none", borderRadius: 6, padding: "8px 12px", cursor: "pointer", fontSize: 14 },
  footer: { display: "flex", justifyContent: "flex-end", gap: 10, padding: "14px 24px", borderTop: "1px solid #e5e7eb" },
  btnSave: { background: "#6c63ff", color: "#fff", border: "none", borderRadius: 6, padding: "10px 28px", fontWeight: 600, cursor: "pointer", fontSize: 14 },
  btnClose: { background: "#f3f4f6", color: "#374151", border: "1px solid #d1d5db", borderRadius: 6, padding: "10px 24px", fontWeight: 600, cursor: "pointer", fontSize: 14 },
};