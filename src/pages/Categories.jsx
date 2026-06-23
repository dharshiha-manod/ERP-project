import { useState, useEffect, useCallback } from "react";
import { categoriesAPI } from "../api/productAPI";

// ── Export helpers ──────────────────────────────────────────
function exportCSV(rows) {
  if (!rows.length) { alert("No data"); return; }
  const csv = ["Category,Category Code,Description",
    ...rows.map(r => `"${r.name}","${r.id}","${r.description||""}"`)
  ].join("\n");
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
  a.download = "categories.csv"; a.click();
}
function exportExcel(rows) {
  import("xlsx").then(XLSX => {
    const ws = XLSX.utils.json_to_sheet(rows.map(r => ({ Category: r.name, "Category Code": r.id, Description: r.description||"", "Parent Category": r.parent_name||"" })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Categories");
    XLSX.writeFile(wb, "categories.xlsx");
  });
}
function printTable(rows) {
  const win = window.open("", "_blank");
  win.document.write(`<html><head><title>Categories</title><style>
    body{font-family:sans-serif;font-size:13px;}table{width:100%;border-collapse:collapse;}
    th{background:#2e7d32;color:#fff;padding:8px;}td{padding:7px;border-bottom:1px solid #eee;}
  </style></head><body><h2>Categories</h2>
  <table><thead><tr><th>Category</th><th>Code</th><th>Description</th><th>Parent</th></tr></thead>
  <tbody>${rows.map(r=>`<tr><td>${r.name}</td><td>${r.id}</td><td>${r.description||""}</td><td>${r.parent_name||""}</td></tr>`).join("")}</tbody>
  </table></body></html>`);
  win.document.close(); win.print();
}
function exportPDF(rows) {
  printTable(rows); // Use print as PDF fallback
}

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [allCategories, setAllCategories]= useState([]); // for parent dropdown
  const [total, setTotal]           = useState(0);
  const [page, setPage]             = useState(1);
  const [perPage, setPerPage]       = useState(25);
  const [search, setSearch]         = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState("");
  const [showModal, setShowModal]   = useState(false);
  const [editItem, setEditItem]     = useState(null);
  const [form, setForm]             = useState({ name: "", parent_id: "", description: "" });
  const [saving, setSaving]         = useState(false);
  // Column visibility
  const [visibleCols, setVisibleCols] = useState({ category: true, code: true, description: true, parent: true, action: true });
  const [showColMenu, setShowColMenu] = useState(false);

  const load = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const data = await categoriesAPI.getAll({ page, limit: perPage, search });
      setCategories(data.categories || []);
      setTotal(data.total || 0);
    } catch (err) { setError(err.message || "Failed to load"); }
    finally { setLoading(false); }
  }, [page, perPage, search]);

  // Load all for parent dropdown (no pagination)
  const loadAll = useCallback(async () => {
    try {
      const data = await categoriesAPI.getAll({ limit: 500 });
      setAllCategories((data.categories || []).filter(c => !c.parent_id));
    } catch {}
  }, []);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { loadAll(); }, [loadAll]);
  useEffect(() => {
    const t = setTimeout(() => { setSearch(searchInput); setPage(1); }, 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  const openAdd  = () => { setForm({ name: "", parent_id: "", description: "" }); setEditItem(null); setShowModal(true); };
  const openEdit = (c) => { setForm({ name: c.name, parent_id: c.parent_id || "", description: c.description || "" }); setEditItem(c); setShowModal(true); };

  const handleSave = async () => {
    if (!form.name.trim()) { alert("Category name is required"); return; }
    setSaving(true);
    try {
      const payload = { name: form.name.trim(), parent_id: form.parent_id || null, description: form.description.trim() };
      if (editItem) await categoriesAPI.update(editItem.id, payload);
      else          await categoriesAPI.create(payload);
      setShowModal(false); setPage(1); await load(); await loadAll();
    } catch (err) { alert(err.message || "Failed to save"); }
    finally { setSaving(false); }
  };

  const handleDelete = async (c) => {
    if (!window.confirm(`Delete category "${c.name}"?`)) return;
    try { await categoriesAPI.delete(c.id); await load(); await loadAll(); }
    catch (err) { alert(err.message || "Failed to delete"); }
  };

  const totalPages = Math.max(1, Math.ceil(total / perPage));
  const from = categories.length === 0 ? 0 : (page - 1) * perPage + 1;
  const to   = (page - 1) * perPage + categories.length;

  return (
    <div style={s.page}>
      <h2 style={s.title}>Categories <span style={s.subtitle}>Manage your categories</span></h2>

      {error && <div style={s.errBanner}>{error}</div>}

      <div style={s.card}>
        {/* Top toolbar */}
        <div style={s.topRow}>
          <div style={s.showRow}>
            <span style={s.smallText}>Show</span>
            <select value={perPage} onChange={e => { setPerPage(+e.target.value); setPage(1); }} style={s.selectSm}>
              {[10,25,50,100].map(n => <option key={n}>{n}</option>)}
            </select>
            <span style={s.smallText}>entries</span>
          </div>
          <div style={s.btnRow}>
            <button onClick={() => exportCSV(categories)}  style={s.tbBtn}>Export CSV</button>
            <button onClick={() => exportExcel(categories)} style={s.tbBtn}>Export Excel</button>
            <button onClick={() => printTable(categories)}  style={s.tbBtn}>Print</button>
            <div style={{ position:"relative" }}>
              <button onClick={() => setShowColMenu(v => !v)} style={s.tbBtn}>Column visibility</button>
              {showColMenu && (
                <div style={s.colMenu}>
                  {Object.keys(visibleCols).map(col => (
                    <label key={col} style={s.colItem}>
                      <input type="checkbox" checked={visibleCols[col]}
                        onChange={e => setVisibleCols(v => ({ ...v, [col]: e.target.checked }))}/>
                      {" "}{col.charAt(0).toUpperCase() + col.slice(1)}
                    </label>
                  ))}
                </div>
              )}
            </div>
            <button onClick={() => exportPDF(categories)} style={s.tbBtn}>Export PDF</button>
            <input placeholder="Search ..." value={searchInput} onChange={e => setSearchInput(e.target.value)} style={s.searchBox}/>
          </div>
          <button onClick={openAdd} style={s.btnAdd}>+ Add</button>
        </div>

        {/* Table */}
        <div style={s.tableWrap}>
          <table style={s.table}>
            <thead>
              <tr style={s.thead}>
                {visibleCols.category    && <th style={s.th}>Category</th>}
                {visibleCols.code        && <th style={s.th}>Category Code</th>}
                {visibleCols.description && <th style={s.th}>Description</th>}
                {visibleCols.parent      && <th style={s.th}>Parent</th>}
                {visibleCols.action      && <th style={s.th}>Action</th>}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} style={s.noData}>Loading...</td></tr>
              ) : categories.length === 0 ? (
                <tr><td colSpan={5} style={s.noData}>No data available in table</td></tr>
              ) : (
                categories.map((c, i) => (
                  <tr key={c.id} style={{ background: i%2===0?"#fff":"#f9fafb", borderBottom:"1px solid #f0f0f0" }}>
                    {visibleCols.category    && <td style={s.td}><strong>{c.name}</strong></td>}
                    {visibleCols.code        && <td style={{ ...s.td, color:"#6b7280", fontFamily:"monospace" }}>{c.id}</td>}
                    {visibleCols.description && <td style={{ ...s.td, color:"#555" }}>{c.description || ""}</td>}
                    {visibleCols.parent      && <td style={s.td}>{c.parent_name ? <span style={s.parentBadge}>{c.parent_name}</span> : <span style={{ color:"#ccc" }}>—</span>}</td>}
                    {visibleCols.action      && (
                      <td style={s.td}>
                        <button onClick={() => openEdit(c)} style={s.editBtn}>✏ Edit</button>
                        <button onClick={() => handleDelete(c)} style={s.delBtn}>🗑 Delete</button>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div style={s.footRow}>
          <span style={s.smallText}>Showing {from} to {to} of {total} entries</span>
          <div style={s.pageBtns}>
            <button onClick={() => setPage(p => Math.max(1, p-1))} disabled={page <= 1} style={{ ...s.pageBtn, opacity: page<=1?0.45:1 }}>Previous</button>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i+1).map(pg => (
              <button key={pg} onClick={() => setPage(pg)} style={{ ...s.pageBtn, ...(page===pg ? s.pageBtnActive:{}) }}>{pg}</button>
            ))}
            {totalPages > 5 && <span style={{ padding:"0 6px", color:"#9ca3af" }}>...</span>}
            <button onClick={() => setPage(p => Math.min(totalPages, p+1))} disabled={page >= totalPages} style={{ ...s.pageBtn, opacity: page>=totalPages?0.45:1 }}>Next</button>
          </div>
        </div>
      </div>

      {/* Add / Edit Modal */}
      {showModal && (
        <div style={s.overlay}>
          <div style={s.modal}>
            <div style={s.modalHead}>
              <span style={s.modalTitle}>{editItem ? "Edit" : "Add"} Category</span>
              <button onClick={() => setShowModal(false)} style={s.closeBtn}>×</button>
            </div>
            <div style={s.modalBody}>
              <label style={s.lbl}>Category name: *</label>
              <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                placeholder="Category name" style={s.inp}/>

              <label style={s.lbl}>Parent Category:</label>
              <select value={form.parent_id} onChange={e => setForm({ ...form, parent_id: e.target.value })} style={s.inp}>
                <option value="">None (Top-level category)</option>
                {allCategories.filter(c => !editItem || c.id !== editItem.id).map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>

              <label style={s.lbl}>Description:</label>
              <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
                placeholder="Short description" rows={3} style={{ ...s.inp, resize:"vertical" }}/>
            </div>
            <div style={s.modalFoot}>
              <button onClick={handleSave} disabled={saving} style={{ ...s.btnSave, opacity: saving?0.7:1 }}>
                {saving ? "Saving..." : "Save"}
              </button>
              <button onClick={() => setShowModal(false)} style={s.btnClose}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const s = {
  page:       { fontFamily:"'Segoe UI',sans-serif", color:"#222", fontSize:14 },
  title:      { fontSize:24, fontWeight:700, marginBottom:16, color:"#1a1a2e" },
  subtitle:   { fontSize:15, fontWeight:400, color:"#888", marginLeft:8 },
  errBanner:  { background:"#fff3cd", border:"1px solid #ffc107", borderRadius:6, padding:"10px 16px", marginBottom:12, color:"#856404" },
  card:       { background:"#fff", borderRadius:8, padding:24, boxShadow:"0 1px 4px rgba(0,0,0,0.08)" },
  topRow:     { display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:10, marginBottom:14 },
  showRow:    { display:"flex", alignItems:"center", gap:8 },
  btnRow:     { display:"flex", alignItems:"center", gap:6, flexWrap:"wrap" },
  smallText:  { fontSize:13, color:"#555" },
  selectSm:   { padding:"4px 8px", border:"1px solid #d1d5db", borderRadius:4, fontSize:13 },
  tbBtn:      { background:"#fff", border:"1px solid #d1d5db", borderRadius:4, padding:"5px 11px", fontSize:12, cursor:"pointer", color:"#444" },
  searchBox:  { padding:"5px 10px", border:"1px solid #d1d5db", borderRadius:4, fontSize:13, width:160, outline:"none" },
  btnAdd:     { background:"#6f42c1", color:"#fff", border:"none", borderRadius:50, padding:"9px 22px", fontWeight:600, fontSize:14, cursor:"pointer" },
  tableWrap:  { overflowX:"auto", border:"1px solid #e5e7eb", borderRadius:8 },
  table:      { width:"100%", borderCollapse:"collapse", fontSize:14 },
  thead:      { background:"#f9fafb" },
  th:         { padding:"11px 14px", textAlign:"left", fontWeight:600, color:"#374151", borderBottom:"2px solid #e5e7eb", whiteSpace:"nowrap" },
  td:         { padding:"11px 14px", verticalAlign:"middle" },
  noData:     { textAlign:"center", padding:"44px 0", color:"#9ca3af" },
  parentBadge:{ background:"#ede9fe", color:"#6d28d9", borderRadius:20, padding:"2px 10px", fontSize:12, fontWeight:500 },
  editBtn:    { background:"#f0fdf4", color:"#2e7d32", border:"1px solid #bbf7d0", borderRadius:5, padding:"5px 13px", cursor:"pointer", fontSize:13, fontWeight:500, marginRight:6 },
  delBtn:     { background:"#fff0f0", color:"#dc2626", border:"1px solid #fecaca", borderRadius:5, padding:"5px 13px", cursor:"pointer", fontSize:13, fontWeight:500 },
  footRow:    { display:"flex", justifyContent:"space-between", alignItems:"center", marginTop:14, fontSize:13, color:"#555" },
  pageBtns:   { display:"flex", gap:5, alignItems:"center" },
  pageBtn:    { background:"#fff", border:"1px solid #d1d5db", borderRadius:4, padding:"5px 13px", cursor:"pointer", fontSize:13 },
  pageBtnActive:{ background:"#2e7d32", color:"#fff", border:"1px solid #2e7d32" },
  colMenu:    { position:"absolute", right:0, top:"110%", background:"#fff", border:"1px solid #e5e7eb", borderRadius:6, padding:"8px 12px", zIndex:200, minWidth:150, boxShadow:"0 4px 12px rgba(0,0,0,0.1)" },
  colItem:    { display:"flex", alignItems:"center", gap:6, padding:"4px 0", fontSize:13, cursor:"pointer" },
  overlay:    { position:"fixed", inset:0, background:"rgba(0,0,0,0.45)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:1000 },
  modal:      { background:"#fff", borderRadius:10, width:480, maxWidth:"95vw", boxShadow:"0 20px 60px rgba(0,0,0,0.2)" },
  modalHead:  { display:"flex", justifyContent:"space-between", alignItems:"center", padding:"16px 24px", borderBottom:"1px solid #e5e7eb" },
  modalTitle: { fontSize:17, fontWeight:700 },
  closeBtn:   { background:"none", border:"none", fontSize:22, cursor:"pointer", color:"#888" },
  modalBody:  { padding:"20px 24px" },
  modalFoot:  { display:"flex", justifyContent:"flex-end", gap:10, padding:"14px 24px", borderTop:"1px solid #e5e7eb" },
  lbl:        { display:"block", fontWeight:600, fontSize:13, color:"#374151", marginTop:14, marginBottom:5 },
  inp:        { width:"100%", padding:"8px 12px", border:"1px solid #d1d5db", borderRadius:6, fontSize:14, outline:"none", boxSizing:"border-box", fontFamily:"inherit" },
  btnSave:    { background:"#2e7d32", color:"#fff", border:"none", borderRadius:6, padding:"10px 28px", fontWeight:600, cursor:"pointer", fontSize:14 },
  btnClose:   { background:"#374151", color:"#fff", border:"none", borderRadius:6, padding:"10px 22px", cursor:"pointer", fontSize:14 },
};