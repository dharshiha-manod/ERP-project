import { useState, useEffect, useCallback } from "react";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { variationsAPI } from "../api/productAPI";
const IconEye=()=><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>;
const IconEdit=()=><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>;
const IconDel=()=><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>;
const IB=(color)=>({background:`${color}15`,border:`1px solid ${color}40`,borderRadius:6,color,cursor:"pointer",padding:"6px 8px",display:"inline-flex",alignItems:"center",justifyContent:"center"});

// ── Export helpers (unchanged from original) ──
function exportCSV(variations) {
  if (!variations.length) { alert("No data"); return; }
  const rows = variations.map(v => [`"${v.name}"`, `"${v.values.map(x => x.value || x).join(" | ")}"`]);
  const csv = ['"Variations","Values"', ...rows.map(r => r.join(","))].join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a"); a.href = url; a.download = "variations.csv"; a.click();
  URL.revokeObjectURL(url);
}

function exportExcel(variations) {
  if (!variations.length) { alert("No data"); return; }
  const data = variations.map(v => ({ Variations: v.name, Values: v.values.map(x => x.value || x).join(" | ") }));
  const ws = XLSX.utils.json_to_sheet(data);
  ws["!cols"] = [{ wch: 30 }, { wch: 60 }];
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Variations");
  XLSX.writeFile(wb, "variations.xlsx");
}

function exportPDF(variations) {
  if (!variations.length) { alert("No data"); return; }
  const doc = new jsPDF();
  doc.setFontSize(16); doc.text("Variations List", 14, 15);
  doc.setFontSize(10); doc.text(`Exported: ${new Date().toLocaleDateString()}`, 14, 22);
  autoTable(doc, {
    head: [["Variation", "Values"]],
    body: variations.map(v => [v.name, v.values.map(x => x.value || x).join(", ")]),
    startY: 28, styles: { fontSize: 9 },
    headStyles: { fillColor: [46, 125, 50] },
  });
  doc.save("variations.pdf");
}

function printVariations(variations) {
  const win = window.open("", "_blank");
  win.document.write(`<html><head><title>Variations</title><style>
    body{font-family:sans-serif;font-size:12px;} table{width:100%;border-collapse:collapse;}
    th,td{border:1px solid #ccc;padding:6px 10px;text-align:left;}
    th{background:#2e7d32;color:#fff;}
  </style></head><body>
    <h2>Variations List</h2><p>${new Date().toLocaleDateString()}</p>
    <table><thead><tr><th>Variation</th><th>Values</th></tr></thead>
    <tbody>${variations.map(v => `<tr><td>${v.name}</td><td>${v.values.map(x => x.value || x).join(", ")}</td></tr>`).join("")}</tbody>
    </table></body></html>`);
  win.document.close(); win.print();
}

export default function Variations() {
  const [variations, setVariations]   = useState([]);
  const [total, setTotal]             = useState(0);
  const [page, setPage]               = useState(1);
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState("");
const [showModal, setShowModal]     = useState(false);
  const [editItem, setEditItem]       = useState(null);
  const [viewItem, setViewItem]       = useState(null);
  const [search, setSearch]           = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [showEntries, setShowEntries] = useState(25);

  const loadVariations = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await variationsAPI.getAll({ page, limit: showEntries, search });
      setVariations(data.variations || []);
      setTotal(data.total || 0);
    } catch (err) {
      setError(err.message || "Failed to load variations");
    } finally {
      setLoading(false);
    }
  }, [page, showEntries, search]);

  useEffect(() => { loadVariations(); }, [loadVariations]);

  useEffect(() => {
    const t = setTimeout(() => { setSearch(searchInput); setPage(1); }, 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  const handleSave = async (variation) => {
    try {
      if (editItem) {
        await variationsAPI.update(editItem.id, variation);
      } else {
        await variationsAPI.create(variation);
      }
      setShowModal(false);
      setEditItem(null);
      setPage(1);
      await loadVariations();
    } catch (err) {
      alert(err.message || "Failed to save variation");
    }
  };

 const handleEdit = (v) => { setEditItem(v); setShowModal(true); };
  const handleView = (v) => { setViewItem(v); };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this variation?")) return;
    try {
      await variationsAPI.delete(id);
      await loadVariations();
    } catch (err) {
      alert(err.message || "Failed to delete variation");
    }
  };

  const totalPages = Math.ceil(total / showEntries);
  const showing = variations.length === 0 ? "0" : `${(page - 1) * showEntries + 1}`;

  return (
    <div style={s.page}>
      <div style={s.titleRow}>
        <div>
          <h1 style={s.pageTitle}>Variations</h1>
          <span style={s.pageSubtitle}>Manage product variations</span>
        </div>
        <button style={s.btnAdd} onClick={() => { setEditItem(null); setShowModal(true); }}>
          ＋ Add
        </button>
      </div>

      {error && (
        <div style={{ background: "#fff3cd", border: "1px solid #ffc107", borderRadius: 6, padding: "10px 16px", marginBottom: 12, color: "#856404" }}>
          {error}
        </div>
      )}

      <div style={s.card}>
        <h2 style={s.cardTitle}>All variations</h2>

        <div style={s.toolbar}>
          <div style={s.toolLeft}>
            <span style={s.toolText}>Show</span>
            <select style={s.entriesSelect} value={showEntries} onChange={e => { setShowEntries(+e.target.value); setPage(1); }}>
              {[10, 25, 50, 100].map(n => <option key={n}>{n}</option>)}
            </select>
            <span style={s.toolText}>entries</span>
          </div>
          <div style={s.toolRight}>
            <button onClick={() => exportCSV(variations)} style={s.toolBtnCsv}><span style={s.iconCsv}>CSV</span> Export CSV</button>
            <button onClick={() => exportExcel(variations)} style={s.toolBtnXls}><span style={s.iconXls}>XLS</span> Export Excel</button>
            <button onClick={() => printVariations(variations)} style={s.toolBtn}>🖨 Print</button>
            <button style={s.toolBtn}>⊞ Column visibility</button>
            <button onClick={() => exportPDF(variations)} style={s.toolBtnPdf}><span style={s.iconPdf}>PDF</span> Export PDF</button>
            <input placeholder="Search ..." value={searchInput} onChange={e => setSearchInput(e.target.value)} style={s.searchBox} />
          </div>
        </div>

        <div style={s.tableWrap}>
          <table style={s.table}>
            <thead>
              <tr style={s.theadRow}>
                <th style={s.th}>Variations</th>
                <th style={s.th}>Values</th>
                <th style={s.th}>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={3} style={s.noData}>Loading...</td></tr>
              ) : variations.length === 0 ? (
                <tr><td colSpan={3} style={s.noData}>No data available in table</td></tr>
              ) : (
                variations.map((v, i) => (
                  <tr key={v.id} style={i % 2 === 0 ? s.rowEven : s.rowOdd}>
                    <td style={s.td}><strong>{v.name}</strong></td>
                    <td style={s.td}>
                      <div style={s.valuesWrap}>
                        {(v.values || []).map((val, vi) => (
                          <span key={vi} style={s.valueBadge}>{val.value || val}</span>
                        ))}
                      </div>
                    </td>
                   <td style={s.td}>
                      <div style={{ display: "flex", gap: 6 }}>
                        <button title="View" style={IB("#2563eb")} onClick={() => handleView(v)}><IconEye /></button>
                        <button title="Edit" style={IB("#f59e0b")} onClick={() => handleEdit(v)}><IconEdit /></button>
                        <button title="Delete" style={IB("#dc2626")} onClick={() => handleDelete(v.id)}><IconDel /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div style={s.footerRow}>
          <span>Showing {showing} to {Math.min((page - 1) * showEntries + variations.length, total)} of {total} entries</span>
          <div style={s.pagination}>
            <button style={{ ...s.pageBtn, opacity: page <= 1 ? 0.5 : 1 }}
              onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1}>Previous</button>
            <button style={{ ...s.pageBtn, opacity: page >= totalPages ? 0.5 : 1 }}
              onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages}>Next</button>
          </div>
        </div>
      </div>

      <div style={s.footer}>manod tecnologies - V7.0 | Copyright © 2026 All rights reserved.</div>

      {showModal && (
        <AddVariationModal
          initial={editItem}
          onSave={handleSave}
          onClose={() => { setShowModal(false); setEditItem(null); }} />
      )}

      {viewItem && (
        <AddVariationModal
          initial={viewItem}
          readOnly
          onSave={() => {}}
          onClose={() => setViewItem(null)} />
      )}
    </div>
  );
}

function AddVariationModal({ initial, onSave, onClose, readOnly = false }) {
  const [name, setName]     = useState(initial?.name || "");
  const [values, setValues] = useState(
    initial?.values?.length
      ? initial.values.map(v => v.value || v)
      : [""]
  );
  const [saving, setSaving] = useState(false);

  const addValue    = () => setValues(v => [...v, ""]);
  const updateValue = (i, val) => setValues(v => v.map((x, idx) => idx === i ? val : x));
  const removeValue = (i) => setValues(v => v.filter((_, idx) => idx !== i));

  const handleSave = async () => {
    if (!name.trim()) { alert("Variation Name is required"); return; }
    const cleaned = values.map(v => v.trim()).filter(Boolean);
    if (cleaned.length === 0) { alert("At least one value is required"); return; }
    setSaving(true);
    try {
      await onSave({ name: name.trim(), values: cleaned });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={m.overlay}>
      <div style={m.modal}>
        <div style={m.header}>
         <span style={m.title}>{readOnly ? "View Variation" : initial ? "Edit Variation" : "Add Variation"}</span>
          <button style={m.closeBtn} onClick={onClose}>✕</button>
        </div>
        <div style={m.body}>
          <div style={m.field}>
            <label style={m.label}>Variation Name: *</label>
            <input style={m.input} placeholder="Variation Name" value={name} onChange={e => setName(e.target.value)} disabled={readOnly} />
          </div>
          <div style={m.field}>
            <label style={m.label}>Add variation values: *</label>
         {values.map((val, i) => (
              <div key={i} style={m.valueRow}>
                <input style={{ ...m.input, flex: 1 }} placeholder="e.g. Red, Large, XL..."
                  value={val} onChange={e => updateValue(i, e.target.value)} disabled={readOnly} />
                {!readOnly && values.length > 1 && (
                  <button style={m.removeValBtn} onClick={() => removeValue(i)}>✕</button>
                )}
                {!readOnly && i === values.length - 1 && (
                  <button style={m.addValBtn} onClick={addValue}>＋</button>
                )}
              </div>
            ))}
            {!readOnly && values.length === 1 && (
              <div style={{ marginTop: 8 }}>
                <button style={m.addValBtn} onClick={addValue}>＋</button>
              </div>
            )}
          </div>
        </div>
       <div style={m.footer}>
          {!readOnly && (
            <button style={{ ...m.btnSave, opacity: saving ? 0.7 : 1, cursor: saving ? "not-allowed" : "pointer" }}
              onClick={handleSave} disabled={saving}>
              {saving ? "Saving..." : "🖫 Save"}
            </button>
          )}
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
  btnAdd: { background: "linear-gradient(135deg,#2e7d32,#43a047)", color: "#fff", border: "none", borderRadius: 6, padding: "10px 22px", fontWeight: 600, cursor: "pointer", fontSize: 14 },
  card: { background: "#fff", borderRadius: 10, padding: "24px 28px", border: "1px solid #e5e7eb", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" },
  cardTitle: { fontSize: 16, fontWeight: 600, color: "#1a1a2e", marginBottom: 16 },
  toolbar: { display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10, marginBottom: 14 },
  toolLeft: { display: "flex", alignItems: "center", gap: 8 },
  toolRight: { display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" },
  toolText: { fontSize: 13, color: "#555" },
  entriesSelect: { border: "1px solid #d1d5db", borderRadius: 4, padding: "5px 8px", fontSize: 13 },
  toolBtn: { background: "#fff", border: "1px solid #d1d5db", borderRadius: 4, padding: "6px 12px", fontSize: 12, cursor: "pointer", color: "#444" },
  toolBtnCsv: { background: "#fff", border: "1px solid #d1d5db", borderRadius: 4, padding: "6px 10px", fontSize: 12, cursor: "pointer", display: "flex", alignItems: "center", gap: 4 },
  toolBtnXls: { background: "#fff", border: "1px solid #d1d5db", borderRadius: 4, padding: "6px 10px", fontSize: 12, cursor: "pointer", display: "flex", alignItems: "center", gap: 4 },
  toolBtnPdf: { background: "#fff", border: "1px solid #d1d5db", borderRadius: 4, padding: "6px 10px", fontSize: 12, cursor: "pointer", display: "flex", alignItems: "center", gap: 4 },
  iconCsv: { background: "#16a34a", color: "#fff", borderRadius: 3, padding: "1px 5px", fontSize: 10, fontWeight: 700 },
  iconXls: { background: "#2e7d32", color: "#fff", borderRadius: 3, padding: "1px 5px", fontSize: 10, fontWeight: 700 },
  iconPdf: { background: "#dc2626", color: "#fff", borderRadius: 3, padding: "1px 5px", fontSize: 10, fontWeight: 700 },
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
  valueBadge: { background: "#dcfce7", color: "#15803d", borderRadius: 20, padding: "3px 12px", fontSize: 12, fontWeight: 500 },
  actionEdit: { background: "#f0fdf4", color: "#2e7d32", border: "1px solid #bbf7d0", borderRadius: 4, cursor: "pointer", padding: "5px 12px", marginRight: 6, fontSize: 13, fontWeight: 500 },
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
  addValBtn: { background: "linear-gradient(135deg,#2e7d32,#43a047)", color: "#fff", border: "none", borderRadius: 6, padding: "8px 14px", cursor: "pointer", fontSize: 16, fontWeight: 700 },
  removeValBtn: { background: "#fee2e2", color: "#ef4444", border: "none", borderRadius: 6, padding: "8px 12px", cursor: "pointer", fontSize: 14 },
  footer: { display: "flex", justifyContent: "flex-end", gap: 10, padding: "14px 24px", borderTop: "1px solid #e5e7eb" },
  btnSave: { background: "linear-gradient(135deg,#2e7d32,#43a047)", color: "#fff", border: "none", borderRadius: 6, padding: "10px 28px", fontWeight: 600, cursor: "pointer", fontSize: 14 },
  btnClose: { background: "#f3f4f6", color: "#374151", border: "1px solid #d1d5db", borderRadius: 6, padding: "10px 24px", fontWeight: 600, cursor: "pointer", fontSize: 14 },
};